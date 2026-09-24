const { kv } = require('@vercel/kv');

export default async function handler(req, res) {
    // 1. อนุญาตให้หน้าเว็บ (CORS) เรียกใช้งานได้
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ดึงตัวแปรที่ส่งมา ไม่ว่าจะส่งแบบ query หรือ body
    const params = req.method === 'GET' ? req.query : req.body;
    // ดึงค่า endpoint ถ้าส่งมาแบบ proxy (เช่น ?endpoint=/api/...)
    const endpoint = params.endpoint || req.url; 
    const apiKey = params.apiKey;
    const targetMethod = params.method || req.method || 'GET';
    const targetData = params.data || params.body;

    // =========================================================
    // 🌟 โซนระบบหลังบ้าน Vercel (ไม่เกี่ยวกับเซิร์ฟเวอร์เกม)
    // =========================================================

    // ระบบที่ 1: ส่งออกข้อมูลให้ Google Sheets
    if (endpoint && endpoint.includes('/api/export-sheets')) {
        try {
            const totalReq = await kv.get('stats_requests_total') || 0;
            const dailyStats = [];
            for(let i = 0; i <= 6; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const count = await kv.get(`stats_requests_${dateStr}`) || 0;
                dailyStats.push({ date: dateStr, requests: count });
            }
            const clanId = params.clanId; 
            let questQueue = [];
            if (clanId) questQueue = await kv.get(`quest_queue_${clanId}`) || [];

            return res.status(200).json({ total_requests: totalReq, daily_stats: dailyStats, quest_queue: questQueue });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    // ระบบที่ 2: นับสถิติ (เฉพาะ Request)
    if (endpoint && endpoint.includes('/api/stats/increment') && targetMethod === 'POST') {
        try {
            if (targetData && targetData.type === 'requests') {
                const today = new Date().toISOString().split('T')[0];
                await kv.incr(`stats_requests_total`); 
                await kv.incr(`stats_requests_${today}`); 
            }
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    // ระบบที่ 3: ดึงประวัติสถิติ 7 วัน สำหรับวาดกราฟ
    if (endpoint && endpoint.includes('/api/stats/history') && targetMethod === 'GET') {
        try {
            const stats = [];
            const labels = [];
            for(let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0]; 
                const count = await kv.get(`stats_requests_${dateStr}`) || 0;
                stats.push(count);
                const [year, month, day] = dateStr.split('-');
                labels.push(`${day}/${month}`); 
            }
            const total = await kv.get('stats_requests_total') || 0;
            return res.status(200).json({ labels, data: stats, total });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    // ระบบที่ 4: รับคำสั่งบันทึกคิวเควสอัตโนมัติ
    if (endpoint && endpoint.includes('/api/schedule-quest') && targetMethod === 'POST') {
        if (!apiKey) return res.status(400).json({ error: 'ไม่พบ API Key สำหรับใช้ซื้อเควส' });
        try {
            const dbKey = `quest_queue_${targetData.clanId}`;
            let currentQueue = await kv.get(dbKey) || [];
            const now = new Date();
            currentQueue.push({
                clanId: targetData.clanId,
                questId: targetData.questId,
                questTitle: targetData.questTitle || 'Unknown Quest',
                apiKey: apiKey,
                targetTime: targetData.targetTime,
                scheduledDate: now.toLocaleDateString('th-TH'),
                scheduledTime: now.toLocaleTimeString('th-TH'),
                timestamp: now.getTime(),
                status: 'waiting'
            });
            await kv.set(dbKey, currentQueue);
            return res.status(200).json({ success: true, message: 'บันทึกคิวสำเร็จ!' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // ระบบที่ 5: ยกเลิกคิวเควสอัตโนมัติ
    if (endpoint && endpoint.includes('/api/cancel-schedule') && targetMethod === 'POST') {
        try {
            const dbKey = `quest_queue_${targetData.clanId}`;
            let currentQueue = await kv.get(dbKey) || [];
            const newQueue = currentQueue.filter(q => q.questId !== targetData.questId);
            await kv.set(dbKey, newQueue);
            return res.status(200).json({ success: true, message: 'ยกเลิกคิวสำเร็จ' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // ระบบที่ 6: รัน Cronjob ตรวจสอบและซื้อเควสอัตโนมัติ (ประมวลผลคิว)
    if (endpoint && endpoint.includes('/api/cron/process-queue') && targetMethod === 'GET') {
        try {
            // ดึงรายชื่อกล่องเก็บคิวทั้งหมดใน DB
            const keys = await kv.keys('quest_queue_*');
            const now = Date.now();
            let processedCount = 0;

            for (const key of keys) {
                let queue = await kv.get(key) || [];
                if (queue.length === 0) continue; // ถ้าคิวว่างให้ข้ามไป

                // คัดกรองเอาเฉพาะเควสที่ถึงเวลาซื้อ (targetTime <= ตอนนี้ หรือ 0 คือให้ซื้อทันที)
                const toProcess = queue.filter(q => q.targetTime === 0 || q.targetTime <= now);
                // คิวที่ยังไม่ถึงเวลา ให้เก็บไว้เหมือนเดิม
                const remainingQueue = queue.filter(q => q.targetTime !== 0 && q.targetTime > now);

                let updatedQueue = [...remainingQueue];

                for (const task of toProcess) {
                    // ยิง API ไปที่เซิร์ฟเวอร์เกมเพื่อขอซื้อเควส
                    const response = await fetch(`https://api.wolvesville.com/clans/${task.clanId}/quests/claim`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bot ${task.apiKey}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ questId: task.questId })
                    });

                    if (response.ok) {
                        processedCount++;
                        // ถ้าซื้อสำเร็จแล้ว ไม่ต้องเอาใส่กลับไปใน updatedQueue อีก
                    } else {
                        // ถ้าซื้อไม่สำเร็จ (เช่น แคลนกำลังทำเควสอื่นอยู่ หรือเงินไม่พอ)
                        // ให้ผลักกลับเข้าคิว เพื่อรอเช็คใหม่ในรอบถัดไป
                        updatedQueue.push(task);
                    }
                }
                
                // บันทึกคิวที่เหลือหรือที่ต้องรอรอบหน้า กลับลงไปใน Database
                await kv.set(key, updatedQueue);
            }

            return res.status(200).json({ success: true, processed: processedCount, message: 'Cron job ประมวลผลเสร็จสิ้น' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // =========================================================
    // 🌟 โซนระบบ Proxy ดึงข้อมูลเกม (Wolvesville API)
    // =========================================================

    if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });
    if (!apiKey) return res.status(401).json({ error: 'API Key missing' }); 

    // ระบบพิเศษ: ดึงไอเทมทั้งหมดเพื่อนับจำนวน (ทำงานแทน Cronjob) 
    if (endpoint.startsWith('/items/total')) {
        const itemEndpoints = [
            '/items/avatarItems', '/items/backgrounds', '/items/badges', '/items/bodyPaints',
            '/items/emojis', '/items/loadingScreens', '/items/profileIconBorders', '/items/profileIcons',
            '/items/roleIcons', '/items/roses', '/items/roseSkins', '/items/talismans'
        ];
        try {
            let totalCount = 0;
            for (const ep of itemEndpoints) {
                const response = await fetch(`https://api.wolvesville.com${ep}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bot ${apiKey}`, 'Accept': 'application/json' }
                });
                if (response.ok) {
                    const arr = await response.json();
                    if (Array.isArray(arr)) totalCount += arr.length;
                } else if (response.status === 429) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate');
            return res.status(200).json({ count: totalCount });
        } catch (error) {
            console.error('[Proxy Items] Error:', error.message);
            return res.status(500).json({ error: error.message });
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

        if ((targetMethod === 'POST' || targetMethod === 'PUT') && targetData) {
            fetchOptions.body = typeof targetData === 'string' ? targetData : JSON.stringify(targetData);
        }

        const response = await fetch(`https://api.wolvesville.com${endpoint}`, fetchOptions);
        
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
        return res.status(500).json({ error: error.message });
    }
}
