const express = require('express');
const cors = require('cors');
const { Redis } = require('@upstash/redis'); // แทนที่ @vercel/kv ที่เลิกใช้แล้ว

const app = express();
app.use(cors());
app.use(express.json());

// Redis.fromEnv() อ่าน UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
// ซึ่ง Vercel ใส่ให้อัตโนมัติเมื่อคุณเชื่อมต่อ "Upstash for Redis" จาก Marketplace
const kv = Redis.fromEnv();

const WOLVESVILLE_BASE_URL = 'https://api.wolvesville.com';

// ==============================================
// 1. ระบบ Proxy (ตัวกลางยิง API เข้าเกม)
// ==============================================
const proxyHandler = async (req, res) => {
    const params = req.method === 'GET' ? req.query : req.body;
    const endpoint = params.endpoint;
    const apiKey = params.apiKey;
    const targetMethod = params.method || 'GET';
    const targetData = params.data || params.body;

    if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });
    if (!apiKey) return res.status(401).json({ error: 'API Key missing' });

    try {
        const fetchOptions = {
            method: targetMethod,
            headers: {
                'Authorization': `Bot ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        if ((targetMethod === 'POST' || targetMethod === 'PUT') && targetData) {
            fetchOptions.body = JSON.stringify(targetData);
        }

        // fetch เป็น global ใน Node 18+ บน Vercel แล้ว ไม่ต้อง import node-fetch อีกต่อไป
        const response = await fetch(`${WOLVESVILLE_BASE_URL}${endpoint}`, fetchOptions);

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return res.status(response.ok ? 200 : response.status).json(data);
        } else {
            const text = await response.text();
            return res.status(response.ok ? 200 : response.status).send(text);
        }
    } catch (error) {
        console.error('[Proxy] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

app.get('/api/wolvesville', proxyHandler);
app.post('/api/wolvesville', proxyHandler);


// ==============================================
// 2. ระบบ AUTO QUEST BUYER (Cron Job)
// ==============================================
app.post('/api/schedule-quest', async (req, res) => {
    const { clanId, questId, questTitle, apiKey, targetTime } = req.body;
    if (!clanId || !questId || !apiKey) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await kv.hset(`clan_auto_quest:${clanId}`, {
            questId,
            questTitle,
            apiKey,
            targetTime: targetTime || 0,
            status: 'pending',
            timestamp: Date.now()
        });
        await kv.sadd('active_auto_quests_clans', clanId);
        return res.status(200).json({ success: true, message: 'Schedule saved' });
    } catch (error) {
        console.error('KV Save Error:', error);
        return res.status(500).json({ error: 'Failed to save schedule' });
    }
});

app.get('/api/cron-buy-quest', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const activeClans = await kv.smembers('active_auto_quests_clans');
        if (!activeClans || activeClans.length === 0) {
            return res.status(200).json({ message: 'No active quests scheduled.' });
        }

        let results = [];
        const now = Date.now();

        for (const clanId of activeClans) {
            const data = await kv.hgetall(`clan_auto_quest:${clanId}`);
            if (!data || data.status !== 'pending') continue;

            if (data.targetTime && data.targetTime > now) {
                results.push({ clanId, status: 'waiting', reason: 'Not yet time' });
                continue;
            }

            try {
                const activeCheckRes = await fetch(`${WOLVESVILLE_BASE_URL}/clans/${clanId}/quests/active`, {
                    headers: { 'Authorization': `Bot ${data.apiKey}`, 'Accept': 'application/json' }
                });
                const activeData = await activeCheckRes.json();

                if (activeData && activeData.quest) {
                    results.push({ clanId, status: 'skipped', reason: 'Quest already active' });
                    continue;
                }

                const buyRes = await fetch(`${WOLVESVILLE_BASE_URL}/clans/${clanId}/quests/claim`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bot ${data.apiKey}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ questId: data.questId })
                });

                if (buyRes.ok) {
                    await kv.hset(`clan_auto_quest:${clanId}`, { status: 'completed' });
                    await kv.srem('active_auto_quests_clans', clanId);
                    results.push({ clanId, status: 'success', questId: data.questId });
                } else {
                    const errorData = await buyRes.json();
                    results.push({ clanId, status: 'failed', error: errorData });
                }
            } catch (err) {
                results.push({ clanId, status: 'error', message: err.message });
            }
        }
        return res.status(200).json({ message: 'Cron job executed', details: results });
    } catch (error) {
        console.error('Cron Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


// ==============================================
// 3. ระบบนับสถิติ (STATS TRACKER - Upstash Redis)
// ==============================================

const METRICS = ['requests', 'visitors']; // รองรับทั้งสองแบบ ตามที่ dashboard เรียกจริง

const getInitialStats = () => {
    const today = new Date();
    const base = {
        date_today: today.toISOString().split('T')[0],
        date_this_month: today.toISOString().substring(0, 7),
    };
    for (const m of METRICS) {
        base[m] = { count_today: 0, count_month: 0, count_year: 0, count_lifetime: 0 };
    }
    return base;
};

// ตรวจสอบและรีเซ็ตวัน/เดือน/ปี (รีเซ็ตทุก metric พร้อมกัน)
const checkAndResetStats = (stats) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthStr = today.toISOString().substring(0, 7);
    const currentYear = today.getFullYear();
    let isUpdated = false;

    if (stats.date_today !== todayStr) {
        for (const m of METRICS) stats[m].count_today = 0;
        stats.date_today = todayStr;
        isUpdated = true;
    }

    if (stats.date_this_month !== monthStr) {
        const recordedYear = stats.date_this_month ? parseInt(stats.date_this_month.substring(0, 4)) : currentYear;
        if (currentYear !== recordedYear) {
            for (const m of METRICS) stats[m].count_year = 0;
        }
        for (const m of METRICS) stats[m].count_month = 0;
        stats.date_this_month = monthStr;
        isUpdated = true;
    }

    return { stats, isUpdated };
};

// Endpoint 3.1: ดึงข้อมูลไปแสดงที่กราฟ
app.get('/api/stats', async (req, res) => {
    try {
        let rawStats = await kv.get('api_stats');

        if (!rawStats) {
            rawStats = getInitialStats();
        }
        // เผื่อข้อมูลเก่าใน Redis ไม่มี key "visitors" (มาจากโครงสร้างเดิม)
        for (const m of METRICS) {
            if (!rawStats[m]) rawStats[m] = { count_today: 0, count_month: 0, count_year: 0, count_lifetime: 0 };
        }

        const { stats, isUpdated } = checkAndResetStats(rawStats);

        if (isUpdated) {
            await kv.set('api_stats', stats);
        }

        return res.status(200).json(stats);
    } catch (error) {
        console.error("[Stats] Fetch Error:", error);
        return res.status(500).json({ error: "Failed to fetch stats" });
    }
});

// Endpoint 3.2: สั่งบวกตัวเลขสถิติ — รองรับทั้ง requests และ visitors
app.post('/api/stats/increment/:type', async (req, res) => {
    const type = req.params.type;

    if (!METRICS.includes(type)) {
        return res.status(400).json({ error: 'Invalid stats type', allowed: METRICS });
    }

    try {
        let rawStats = await kv.get('api_stats');

        if (!rawStats) {
            rawStats = getInitialStats();
        }
        for (const m of METRICS) {
            if (!rawStats[m]) rawStats[m] = { count_today: 0, count_month: 0, count_year: 0, count_lifetime: 0 };
        }

        const { stats } = checkAndResetStats(rawStats);

        stats[type].count_today += 1;
        stats[type].count_month += 1;
        stats[type].count_year += 1;
        stats[type].count_lifetime += 1;

        await kv.set('api_stats', stats);

        return res.status(200).json({ success: true, type, count: stats[type].count_today });
    } catch (error) {
        console.error("[Stats] Increment Error:", error);
        return res.status(500).json({ error: 'Failed to increment stats' });
    }
});

// ==============================================
// 4. ไอเทมทั้งหมดในเกม — endpoint นี้ยังไม่เคยมีอยู่จริง (คือสาเหตุ 404 เดิม)
// เก็บ cache ไว้ใน Redis แล้วให้ job แยกต่างหากอัปเดตเป็นระยะ (ดูหมายเหตุด้านล่าง)
// ==============================================
app.get('/api/items/total', async (req, res) => {
    const apiKey = req.query.apiKey;
    if (!apiKey) return res.status(401).json({ error: 'API Key missing' });

    try {
        const cached = await kv.get('items_cache:total');
        if (cached !== null && cached !== undefined) {
            return res.status(200).json({ total: cached, source: 'cache' });
        }
        return res.status(404).json({ error: 'No cached item total yet — needs a job to populate it, see notes' });
    } catch (error) {
        console.error('[Items] Fetch Error:', error);
        return res.status(500).json({ error: 'Failed to fetch item total' });
    }
});

module.exports = app;
