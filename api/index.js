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

    // 🌟 ระบบที่ 1: นับสถิติ (เฉพาะ Request)
    if (req.url && req.url.includes('/api/stats/increment') && req.method === 'POST') {
        const { type } = req.body; 
        try {
            if (type === 'requests') {
                const today = new Date().toISOString().split('T')[0];
                await kv.incr(`stats_requests_total`); 
                await kv.incr(`stats_requests_${today}`); 
            }
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    // 🌟 ระบบที่ 2: ดึงประวัติสถิติ 7 วัน สำหรับวาดกราฟ
    if (req.url && req.url.includes('/api/stats/history') && req.method === 'GET') {
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

    // 🌟 ระบบที่ 3: รับคำสั่งบันทึกคิวเควสอัตโนมัติ
    if (req.url && req.url.includes('/api/schedule-quest') && req.method === 'POST') {
        const { clanId, questId, questTitle, apiKey, targetTime } = req.body;

        if (!apiKey) {
            return res.status(400).json({ error: 'ไม่พบ API Key สำหรับใช้ซื้อเควส' });
        }

        try {
            const dbKey = `quest_queue_${clanId}`;
            let currentQueue = await kv.get(dbKey) || [];

            const now = new Date();
            const dateStr = now.toLocaleDateString('th-TH'); 
            const timeStr = now.toLocaleTimeString('th-TH'); 

            currentQueue.push({
                clanId: clanId,
                questId: questId,
                questTitle: questTitle || 'Unknown Quest',
                apiKey: apiKey,
                targetTime: targetTime,
                scheduledDate: dateStr,
                scheduledTime: timeStr,
                timestamp: now.getTime(),
                status: 'waiting'
            });

            await kv.set(dbKey, currentQueue);

            return res.status(200).json({ 
                success: true, 
                message: 'บันทึกคิวสำเร็จ!'
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // -------------------------------------------------------------
    // 🌟 ระบบปกติ: ระบบ Proxy ดึงข้อมูลเกม (Wolvesville API)
    // -------------------------------------------------------------
    const params = req.method === 'GET' ? req.query : req.body;
    
    // ถ้าไม่ได้ส่งพารามิเตอร์ของระบบ Proxy มา ให้ถือว่าเป็น Invalid Request
    if (!params) {
        return res.status(400).json({ error: 'Invalid Request' });
    }

    const endpoint = params.endpoint;
    const apiKey = params.apiKey;
    const targetMethod = params.method || req.method || 'GET';
    const targetData = params.data || params.body;

    if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });
    if (!apiKey) return res.status(401).json({ error: 'API Key missing' }); 

    // ระบบพิเศษ: ดึงไอเทมทั้งหมดเพื่อนับจำนวน (ทำงานแทน Cronjob) 
    if (endpoint && endpoint.startsWith('/items/total')) {
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
