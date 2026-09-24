const { kv } = require('@vercel/kv');

// helper วางไว้บนสุดของไฟล์
async function notifyGoogleSheets(reason = 'update') {
    const url = process.env.SHEETS_WEBHOOK_URL;
    const secret = process.env.SHEETS_WEBHOOK_SECRET;
    if (!url) return; // ยังไม่ได้ตั้ง ก็ข้ามไป

    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                secret: secret || '',
                reason: reason 
            })
        });
        console.log('[Sheets] notified:', reason);
    } catch (e) {
        console.warn('[Sheets] notify failed:', e.message);
    }
}

// =========================================================
// Helper: วันที่ตามเวลาไทย (UTC+7) — format YYYY-MM-DD
// =========================================================
function getThaiDateStr(date = new Date()) {
    // บวก 7 ชั่วโมง (ICT) แล้วค่อยดึงวันที่จาก ISO
    const thaiTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    return thaiTime.toISOString().split('T')[0];
}

export default async function handler(req, res) {
    // 1. อนุญาตให้หน้าเว็บ (CORS) เรียกใช้งานได้
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ดึงตัวแปรที่ส่งมา ไม่ว่าจะส่งแบบ query หรือ body
    const params = req.method === 'GET' ? req.query : req.body;

    // ดึงค่า endpoint ถ้าส่งมาแบบ proxy (เช่น ?endpoint=/api/...)
    const endpoint = params.endpoint || req.url;
    const apiKey = params.apiKey;
    const targetMethod = params.method || req.method || 'GET';

    // ใช้สำหรับ Proxy ทั่วไป
    const targetData = params.data || params.body;

    // ใช้สำหรับ endpoint ที่ frontend ส่ง body ตรงๆ
    const specialData = params;

    // =========================================================
    // 🌟 โซนระบบหลังบ้าน Vercel (ไม่เกี่ยวกับเซิร์ฟเวอร์เกม)
    // =========================================================

        // ระบบที่ 1: ส่งออกข้อมูลให้ Google Sheets
    if (endpoint && endpoint.includes('/api/export-sheets')) {
        try {
            const totalReq = await kv.get('stats_requests_total') || 0;
            const now = new Date();
            const thaiNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));

            const ranges = {};

            // ---------- 60 นาทีล่าสุด ----------
            {
                const keys = [];
                for (let i = 59; i >= 0; i--) {
                    const d = new Date(thaiNow.getTime() - i * 60 * 1000);
                    const dateStr = d.toISOString().split('T')[0];
                    const h = String(d.getUTCHours()).padStart(2, '0');
                    const m = String(d.getUTCMinutes()).padStart(2, '0');
                    keys.push({
                        key: `stats_min_${dateStr}-${h}-${m}`,
                        label: `${h}:${m}`
                    });
                }
                const counts = await Promise.all(keys.map(k => kv.get(k.key)));
                ranges.minute = keys.map((k, i) => ({
                    label: k.label,
                    value: counts[i] || 0
                }));
            }

            // ---------- 24 ชั่วโมงล่าสุด ----------
            {
                const keys = [];
                for (let i = 23; i >= 0; i--) {
                    const d = new Date(thaiNow.getTime() - i * 60 * 60 * 1000);
                    const dateStr = d.toISOString().split('T')[0];
                    const h = String(d.getUTCHours()).padStart(2, '0');
                    keys.push({
                        key: `stats_hour_${dateStr}-${h}`,
                        label: `${h}:00`
                    });
                }
                const counts = await Promise.all(keys.map(k => kv.get(k.key)));
                ranges.hour = keys.map((k, i) => ({
                    label: k.label,
                    value: counts[i] || 0
                }));
            }

            // ---------- 7 วันล่าสุด ----------
            {
                const keys = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(thaiNow.getTime() - i * 24 * 60 * 60 * 1000);
                    const dateStr = d.toISOString().split('T')[0];
                    const [_, month, day] = dateStr.split('-');
                    keys.push({
                        key: `stats_requests_${dateStr}`,
                        label: `${day}/${month}`,
                        date: dateStr
                    });
                }
                const counts = await Promise.all(keys.map(k => kv.get(k.key)));
                ranges.day = keys.map((k, i) => ({
                    label: k.label,
                    date: k.date,
                    value: counts[i] || 0
                }));
            }

            // ---------- 30 วันล่าสุด ----------
            {
                const keys = [];
                for (let i = 29; i >= 0; i--) {
                    const d = new Date(thaiNow.getTime() - i * 24 * 60 * 60 * 1000);
                    const dateStr = d.toISOString().split('T')[0];
                    const [_, month, day] = dateStr.split('-');
                    keys.push({
                        key: `stats_requests_${dateStr}`,
                        label: `${day}/${month}`,
                        date: dateStr
                    });
                }
                const counts = await Promise.all(keys.map(k => kv.get(k.key)));
                ranges.month = keys.map((k, i) => ({
                    label: k.label,
                    date: k.date,
                    value: counts[i] || 0
                }));
            }

            // ---------- 12 เดือนล่าสุด ----------
            {
                const keys = [];
                for (let i = 364; i >= 0; i--) {
                    const d = new Date(thaiNow.getTime() - i * 24 * 60 * 60 * 1000);
                    const dateStr = d.toISOString().split('T')[0];
                    keys.push({ key: `stats_requests_${dateStr}`, dateStr });
                }
                const counts = await Promise.all(keys.map(k => kv.get(k.key)));

                const monthlyMap = {};
                keys.forEach((k, i) => {
                    const monthKey = k.dateStr.substring(0, 7);
                    if (!monthlyMap[monthKey]) monthlyMap[monthKey] = 0;
                    monthlyMap[monthKey] += (counts[i] || 0);
                });

                const sortedMonths = Object.keys(monthlyMap).sort();
                ranges.year = sortedMonths.map(mk => {
                    const [y, m] = mk.split('-');
                    return {
                        label: `${m}/${y.substring(2)}`,
                        value: monthlyMap[mk]
                    };
                });
            }

            // ---------- ทั้งหมด (รายปี) ----------
            {
                const keys = [];
                for (let i = 1095; i >= 0; i--) {
                    const d = new Date(thaiNow.getTime() - i * 24 * 60 * 60 * 1000);
                    const dateStr = d.toISOString().split('T')[0];
                    keys.push({ key: `stats_requests_${dateStr}`, dateStr });
                }
                const counts = await Promise.all(keys.map(k => kv.get(k.key)));

                const yearlyMap = {};
                keys.forEach((k, i) => {
                    const yearKey = k.dateStr.substring(0, 4);
                    if (!yearlyMap[yearKey]) yearlyMap[yearKey] = 0;
                    yearlyMap[yearKey] += (counts[i] || 0);
                });

                const sortedYears = Object.keys(yearlyMap).sort();
                ranges.all = sortedYears.map(yk => ({
                    label: yk,
                    value: yearlyMap[yk]
                }));
            }

            // คิวเควส
            const questQueue = await kv.get('quest_queue') || [];

            return res.status(200).json({
                total_requests: totalReq,
                ranges: ranges,
                quest_queue: questQueue
            });

        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    // ระบบที่ 2: นับสถิติ (เฉพาะ Request)
    if (
    endpoint &&
    endpoint.includes('/api/stats/increment') &&
    targetMethod === 'POST'
) {
    try {
        if (specialData && specialData.type === 'requests') {
            const now = new Date();
            const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));

            const dateStr = thaiTime.toISOString().split('T')[0];             // 2026-09-25
            const hourStr = String(thaiTime.getUTCHours()).padStart(2, '0');  // 03
            const minStr  = String(thaiTime.getUTCMinutes()).padStart(2, '0'); // 41

            // 1. ยอดรวม
            await kv.incr('stats_requests_total');

            // 2. รายวัน
            await kv.incr(`stats_requests_${dateStr}`);

            // 3. รายชั่วโมง
            const hourKey = `stats_hour_${dateStr}-${hourStr}`;
            await kv.incr(hourKey);
            // TTL 8 วัน (ลบอัตโนมัติ)
            await kv.expire(hourKey, 8 * 24 * 60 * 60);

            // 4. Rolling 60 minutes (ใช้ INCR ต่อ key แล้วค่อยรวบ)
            const minKey = `stats_min_${dateStr}-${hourStr}-${minStr}`;
            await kv.incr(minKey);
            await kv.expire(minKey, 2 * 60 * 60); // TTL 2 ชั่วโมง
        }

        return res.status(200).json({ success: true });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}

    // =========================================================
    // 📊 /api/stats/range?range=minute|hour|day|month|year|all
    // =========================================================
    if (
        endpoint &&
        endpoint.includes('/api/stats/range') &&
        targetMethod === 'GET'
    ) {
        try {
            const range = specialData.range || 'day';
            const now = new Date();
            const thaiNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));

            let labels = [];
            let data = [];

            // ---------- MINUTE: 60 นาทีล่าสุด ----------
            if (range === 'minute') {
                const keys = [];
                for (let i = 59; i >= 0; i--) {
                    const d = new Date(thaiNow.getTime() - i * 60 * 1000);
                    const dateStr = d.toISOString().split('T')[0];
                    const h = String(d.getUTCHours()).padStart(2, '0');
                    const m = String(d.getUTCMinutes()).padStart(2, '0');
                    keys.push({
                        key: `stats_min_${dateStr}-${h}-${m}`,
                        label: `${h}:${m}`
                    });
                }
                const counts = await Promise.all(keys.map(k => kv.get(k.key)));
                keys.forEach((k, i) => {
                    labels.push(k.label);
                    data.push(counts[i] || 0);
                });
            }

        // ---------- HOUR: 24 ชั่วโมงล่าสุด ----------
            else if (range === 'hour') {
                const keys = [];
                for (let i = 23; i >= 0; i--) {
                    const d = new Date(thaiNow.getTime() - i * 60 * 60 * 1000);
                    const dateStr = d.toISOString().split('T')[0];
                    const h = String(d.getUTCHours()).padStart(2, '0');
                    keys.push({
                        key: `stats_hour_${dateStr}-${h}`,
                        label: `${h}:00`
                    });
                }
                const counts = await Promise.all(keys.map(k => kv.get(k.key)));
                    keys.forEach((k, i) => {
                    labels.push(k.label);
                    data.push(counts[i] || 0);
                });
            }

        // ---------- DAY: 7 วันล่าสุด ----------
            else if (range === 'day') {
                const keys = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(thaiNow.getTime() - i * 24 * 60 * 60 * 1000);
                    const dateStr = d.toISOString().split('T')[0];
                    const [_, month, day] = dateStr.split('-');
                    keys.push({
                        key: `stats_requests_${dateStr}`,
                        label: `${day}/${month}`
                    });
                }
                const counts = await Promise.all(keys.map(k => kv.get(k.key)));
                keys.forEach((k, i) => {
                    labels.push(k.label);
                    data.push(counts[i] || 0);
                });
            }

        // ---------- MONTH: 30 วันล่าสุด ----------
            else if (range === 'month') {
                const keys = [];
                for (let i = 29; i >= 0; i--) {
                    const d = new Date(thaiNow.getTime() - i * 24 * 60 * 60 * 1000);
                    const dateStr = d.toISOString().split('T')[0];
                    const [_, month, day] = dateStr.split('-');
                    keys.push({
                        key: `stats_requests_${dateStr}`,
                        label: `${day}/${month}`
                    });
                }
                const counts = await Promise.all(keys.map(k => kv.get(k.key)));
                keys.forEach((k, i) => {
                    labels.push(k.label);
                    data.push(counts[i] || 0);
                });
            }

        // ---------- YEAR: 12 เดือนล่าสุด ----------
            else if (range === 'year') {
                const keys = [];
                for (let i = 364; i >= 0; i--) {
                    const d = new Date(thaiNow.getTime() - i * 24 * 60 * 60 * 1000);
                    const dateStr = d.toISOString().split('T')[0];
                    keys.push({ key: `stats_requests_${dateStr}`, dateStr });
                }
                const counts = await Promise.all(keys.map(k => kv.get(k.key)));

                const monthlyMap = {};
                keys.forEach((k, i) => {
                    const monthKey = k.dateStr.substring(0, 7);
                    if (!monthlyMap[monthKey]) monthlyMap[monthKey] = 0;
                    monthlyMap[monthKey] += (counts[i] || 0);
                });

                const sortedMonths = Object.keys(monthlyMap).sort();
                for (const mk of sortedMonths) {
                    const [y, m] = mk.split('-');
                    labels.push(`${m}/${y.substring(2)}`);
                    data.push(monthlyMap[mk]);
                }
            }

        // ---------- ALL: ทุกปี ----------
            else if (range === 'all') {
                const keys = [];
                for (let i = 1095; i >= 0; i--) {
                    const d = new Date(thaiNow.getTime() - i * 24 * 60 * 60 * 1000);
                    const dateStr = d.toISOString().split('T')[0];
                    keys.push({ key: `stats_requests_${dateStr}`, dateStr });
                }
                const counts = await Promise.all(keys.map(k => kv.get(k.key)));
    
                const yearlyMap = {};
                keys.forEach((k, i) => {
                    const yearKey = k.dateStr.substring(0, 4);
                    if (!yearlyMap[yearKey]) yearlyMap[yearKey] = 0;
                    yearlyMap[yearKey] += (counts[i] || 0);
                });

                const sortedYears = Object.keys(yearlyMap).sort();
                for (const yk of sortedYears) {
                    labels.push(yk);
                    data.push(yearlyMap[yk]);
                }
            }

            const total = await kv.get('stats_requests_total') || 0;

        // ✅ Cache 30 วิ ลดการยิงซ้ำ
            res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

            return res.status(200).json({
                range,
                labels,
                data,
                total
            });

        } catch (e) {
            console.error('[Stats Range] Error:', e.message);
            return res.status(500).json({ error: e.message });
        }
    }
    // ระบบที่ 4: รับคำสั่งบันทึกคิวเควสอัตโนมัติ
    if (
    endpoint &&
    endpoint.includes('/api/schedule-quest') &&
    targetMethod === 'POST'
) {
    if (!apiKey) {
        return res.status(400).json({
            error: 'ไม่พบ API Key สำหรับใช้ซื้อเควส'
        });
    }

    try {
        const clanId = specialData.clanId;
        const questId = specialData.questId;
        const questTitle = specialData.questTitle;
        const targetTime = specialData.targetTime;
        // ✅ เพิ่ม 2 ตัวนี้
        const clanName = specialData.clanName || 'Unknown Clan';
        const clanTag = specialData.clanTag || '';
        const questImageUrl = specialData.questImageUrl || '';

        if (!clanId) return res.status(400).json({ error: 'ไม่พบ clanId' });
        if (!questId) return res.status(400).json({ error: 'ไม่พบ questId' });

        const dbKey = 'quest_queue';
        let currentQueue = await kv.get(dbKey) || [];

        const isDuplicate = currentQueue.some(
            q => q.clanId === clanId && q.questId === questId
        );

        if (isDuplicate) {
            return res.status(200).json({
                success: true,
                message: 'เควสนี้อยู่ในคิวอยู่แล้ว'
            });
        }

        const now = new Date();

        currentQueue.push({
            clanId: clanId,
            clanName: clanName,        // ✅ เก็บชื่อแคลน
            clanTag: clanTag,          // ✅ เก็บ tag แคลน
            questId: questId,
            questTitle: questTitle || 'Unknown Quest',
            questImageUrl: questImageUrl, // ✅ เก็บรูปเควส
            apiKey: apiKey,
            targetTime: targetTime,
            scheduledDate: now.toLocaleDateString('th-TH'),
            scheduledTime: now.toLocaleTimeString('th-TH'),
            timestamp: now.getTime(),
            status: 'waiting'
        });

        await kv.set(dbKey, currentQueue);
        await notifyGoogleSheets('schedule-quest'); // ← เพิ่ม

        return res.status(200).json({
            success: true,
            message: 'บันทึกคิวสำเร็จ!',
            total_in_queue: currentQueue.length
        });

    } catch (error) {
        console.error('[Schedule Quest] Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}

    // ระบบที่ 5: ยกเลิกคิวเควสอัตโนมัติ
    if (
    endpoint &&
    endpoint.includes('/api/cancel-schedule') &&
    targetMethod === 'POST'
) {
    try {
        const clanId = specialData.clanId;
        const questId = specialData.questId;

        if (!clanId) {
            return res.status(400).json({ error: 'ไม่พบ clanId' });
        }
        if (!questId) {
            return res.status(400).json({ error: 'ไม่พบ questId' });
        }

        const dbKey = 'quest_queue';
        let currentQueue = await kv.get(dbKey) || [];

        // ✅ filter ตาม clanId + questId (เพราะตอนนี้มีหลายแคลนในคิวเดียว)
        const newQueue = currentQueue.filter(
            q => !(q.clanId === clanId && q.questId === questId)
        );

        await kv.set(dbKey, newQueue);
        await notifyGoogleSheets('cancel-schedule'); // ← เพิ่ม

        return res.status(200).json({
            success: true,
            message: 'ยกเลิกคิวสำเร็จ',
            removed: currentQueue.length - newQueue.length,
            total_in_queue: newQueue.length
        });

    } catch (error) {
        console.error('[Cancel Schedule] Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}

    // ระบบที่ 6: รัน Cronjob ตรวจสอบและซื้อเควสอัตโนมัติ (ประมวลผลคิว)
    if (
    endpoint &&
    endpoint.includes('/api/cron/process-queue') &&
    targetMethod === 'GET'
) {
    try {
        // ✅ อ่าน global key เดียว
        const dbKey = 'quest_queue';
        const queue = await kv.get(dbKey) || [];

        if (queue.length === 0) {
            return res.status(200).json({
                success: true,
                processed: 0,
                message: 'ไม่มีคิวที่ต้องประมวลผล'
            });
        }

        const now = Date.now();
        let processedCount = 0;
        let failedCount = 0;

        // แยก task ที่ถึงเวลาซื้อ กับที่ยังไม่ถึง
        const toProcess = queue.filter(
            q => q.targetTime === 0 || q.targetTime <= now
        );
        const remainingQueue = queue.filter(
            q => q.targetTime !== 0 && q.targetTime > now
        );

        const updatedQueue = [...remainingQueue];

        for (const task of toProcess) {
            try {
                // ✅ ใช้ task.apiKey (ของเจ้าของแคลนนั้น) + task.clanId
                const response = await fetch(
                    `https://api.wolvesville.com/clans/${task.clanId}/quests/claim`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bot ${task.apiKey}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            questId: task.questId
                        })
                    }
                );

                if (response.ok) {
                    processedCount++;
                    console.log(
                        `[Cron] ซื้อสำเร็จ: clan=${task.clanId} quest=${task.questId}`
                    );
                    // ไม่ต้อง push กลับ → เอาออกจากคิว
                } else {
                    // ถ้าซื้อไม่สำเร็จ → เก็บกลับเข้าคิวรอ retry
                    const errText = await response.text();
                    console.warn(
                        `[Cron] ซื้อไม่สำเร็จ clan=${task.clanId} quest=${task.questId} status=${response.status}: ${errText}`
                    );
                    failedCount++;
                    updatedQueue.push(task);
                }
            } catch (err) {
                console.error(`[Cron] Error task:`, err.message);
                failedCount++;
                updatedQueue.push(task);
            }
        }

        // บันทึกคิวที่เหลือกลับลง KV
        await kv.set(dbKey, updatedQueue);
        await notifyGoogleSheets('cron-processed'); // ← เพิ่ม

        return res.status(200).json({
            success: true,
            processed: processedCount,
            failed: failedCount,
            remaining: updatedQueue.length,
            message: 'Cron job ประมวลผลเสร็จสิ้น'
        });

    } catch (error) {
        console.error('[Cron Process Queue] Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}

    // =========================================================
    // 🌟 โซนระบบ Proxy ดึงข้อมูลเกม (Wolvesville API)
    // =========================================================

    if (!endpoint) {
        return res.status(400).json({
            error: 'Endpoint required'
        });
    }

    if (!apiKey) {
        return res.status(401).json({
            error: 'API Key missing'
        });
    }

    // ระบบพิเศษ: ดึงไอเทมทั้งหมดเพื่อนับจำนวน (ทำงานแทน Cronjob)
    if (endpoint.startsWith('/items/total')) {
        const itemEndpoints = [
            '/items/avatarItems',
            '/items/backgrounds',
            '/items/badges',
            '/items/bodyPaints',
            '/items/emojis',
            '/items/loadingScreens',
            '/items/profileIconBorders',
            '/items/profileIcons',
            '/items/roleIcons',
            '/items/roses',
            '/items/roseSkins',
            '/items/talismans'
        ];

        try {
            let totalCount = 0;

            for (const ep of itemEndpoints) {
                const response = await fetch(
                    `https://api.wolvesville.com${ep}`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bot ${apiKey}`,
                            'Accept': 'application/json'
                        }
                    }
                );

                if (response.ok) {
                    const arr = await response.json();

                    if (Array.isArray(arr)) {
                        totalCount += arr.length;
                    }

                } else if (response.status === 429) {
                    await new Promise(
                        resolve => setTimeout(resolve, 500)
                    );
                }
            }

            res.setHeader(
                'Cache-Control',
                's-maxage=43200, stale-while-revalidate'
            );

            return res.status(200).json({
                count: totalCount
            });

        } catch (error) {
            console.error(
                '[Proxy Items] Error:',
                error.message
            );

            return res.status(500).json({
                error: error.message
            });
        }
    }

    // ยิง Request ทั่วไป ไปหา Wolvesville
    try {
        const fetchOptions = {
            method: targetMethod,

            headers: {
                'Authorization': `Bot ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        // ✅ Proxy ปกติยังใช้ targetData เหมือนเดิม
        if (
            (targetMethod === 'POST' || targetMethod === 'PUT') &&
            targetData
        ) {
            fetchOptions.body =
                typeof targetData === 'string'
                    ? targetData
                    : JSON.stringify(targetData);
        }

        const response = await fetch(
            `https://api.wolvesville.com${endpoint}`,
            fetchOptions
        );

        const contentType =
            response.headers.get('content-type');

        if (
            contentType &&
            contentType.includes('application/json')
        ) {
            const data = await response.json();

            return res
                .status(response.ok ? 200 : response.status)
                .json(data);

        } else {
            const text = await response.text();

            return res
                .status(response.ok ? 200 : response.status)
                .send(text);
        }

    } catch (error) {
        console.error(
            '[Proxy] Error:',
            error.message
        );

        return res.status(500).json({
            error: error.message
        });
    }
}
