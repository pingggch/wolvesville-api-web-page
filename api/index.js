const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { kv } = require('@vercel/kv'); // Vercel KV ฐานข้อมูลหลัก

const app = express();
app.use(cors());
app.use(express.json());

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
// 3. ระบบนับสถิติ (STATS TRACKER - Vercel KV)
// ==============================================

// ฟังก์ชันช่วยจัดการข้อมูลสถิติพื้นฐาน
const getInitialStats = () => {
    const today = new Date();
    return {
        date_today: today.toISOString().split('T')[0],
        date_this_month: today.toISOString().substring(0, 7),
        requests: { count_today: 0, count_month: 0, count_year: 0, count_lifetime: 0 }
    };
};

// ตรวจสอบและรีเซ็ตวัน/เดือน/ปี
const checkAndResetStats = (stats) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthStr = today.toISOString().substring(0, 7);
    const currentYear = today.getFullYear();
    let isUpdated = false;

    // รีเซ็ตรายวัน
    if (stats.date_today !== todayStr) {
        stats.requests.count_today = 0;
        stats.date_today = todayStr;
        isUpdated = true;
    }

    // รีเซ็ตรายเดือน และ รายปี
    if (stats.date_this_month !== monthStr) {
        const recordedYear = stats.date_this_month ? parseInt(stats.date_this_month.substring(0, 4)) : currentYear;
        if (currentYear !== recordedYear) {
            stats.requests.count_year = 0;
        }
        stats.requests.count_month = 0;
        stats.date_this_month = monthStr;
        isUpdated = true;
    }

    return { stats, isUpdated };
};

// Endpoint 3.1: ดึงข้อมูลไปแสดงที่กราฟ
app.get('/api/stats', async (req, res) => {
    try {
        let rawStats = await kv.get('api_stats');
        
        // ถ้ายังไม่มีข้อมูลในฐานข้อมูล ให้ตั้งค่าเริ่มต้น
        if (!rawStats) {
            rawStats = getInitialStats();
        }

        const { stats, isUpdated } = checkAndResetStats(rawStats);

        // เซฟกลับถ้ามีการอัปเดตวัน/เดือนใหม่
        if (isUpdated) {
            await kv.set('api_stats', stats);
        }

        return res.status(200).json(stats);
    } catch (error) {
        console.error("[Stats] Fetch Error:", error);
        return res.status(500).json({ error: "Failed to fetch stats" });
    }
});

// Endpoint 3.2: สั่งบวกตัวเลขสถิติ (ทำงานทุกครั้งที่หน้าเว็บส่ง Request)
app.post('/api/stats/increment/:type', async (req, res) => {
    const type = req.params.type; 
    
    // ตรวจจับว่าต้องเป็น 'requests' เท่านั้น (เพราะลบ visitors ทิ้งแล้ว)
    if (type !== 'requests') {
        return res.status(400).json({ error: 'Invalid stats type' });
    }

    try {
        let rawStats = await kv.get('api_stats');
        
        if (!rawStats) {
            rawStats = getInitialStats();
        }

        const { stats } = checkAndResetStats(rawStats);

        // สั่งบวกตัวเลขขึ้นทีละ 1
        stats.requests.count_today += 1;
        stats.requests.count_month += 1;
        stats.requests.count_year += 1;
        stats.requests.count_lifetime += 1;
        
        // เซฟกลับลง Database
        await kv.set('api_stats', stats);

        return res.status(200).json({ success: true, count: stats.requests.count_today });
    } catch (error) {
        console.error("[Stats] Increment Error:", error);
        return res.status(500).json({ error: 'Failed to increment stats' });
    }
});


// ==============================================
// 4. เริ่มเซิร์ฟเวอร์
// ==============================================
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`✅ Server running on PORT ${PORT}`));
}

module.exports = app;
