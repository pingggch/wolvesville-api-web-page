const { kv } = require('@vercel/kv');

const { kv } = require('@vercel/kv');

// สร้าง Route สำหรับรับคำสั่งเข้าคิว และนับจำนวนการใช้ API
app.post('/api/schedule-quest', async (req, res) => {
    const { clanId, questId, questTitle, apiKey, targetTime } = req.body;

    if (!apiKey) {
        return res.status(400).json({ error: 'ไม่พบ API Key สำหรับใช้ซื้อเควส' });
    }

    try {
        // 🌟 1. นับจำนวนการใช้ API รวม (บวกเพิ่มทีละ 1 ทุกครั้งที่มีคนยิงคำสั่งมา)
        const totalRequests = await kv.incr('api_total_requests');

        // 🌟 2. จัดการเรื่องคิวเควส
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

        // 3. เซฟคิวกลับลงไปใน Database
        await kv.set(dbKey, currentQueue);

        // ส่ง Response กลับไปพร้อมยอดการใช้ API ปัจจุบัน
        res.status(200).json({ 
            success: true, 
            message: 'บันทึกคิวสำเร็จ!',
            totalApiUsage: totalRequests 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default async function handler(req, res) {
    // 1. อนุญาตให้หน้าเว็บ (CORS) เรียกใช้งานได้
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. ดึงข้อมูลที่หน้าเว็บส่งมา
    const params = req.method === 'GET' ? req.query : req.body;
    const endpoint = params.endpoint;
    const apiKey = params.apiKey;
    const targetMethod = params.method || req.method || 'GET';
    const targetData = params.data || params.body;

    // 3. ตรวจสอบว่ามีข้อมูลครบไหม
    if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });
    if (!apiKey) return res.status(401).json({ error: 'API Key missing' }); // 🌟 เช็ค API Key ก่อนเสมอ

    // 🌟 ระบบพิเศษ: ดึงไอเทมทั้งหมดเพื่อนับจำนวน (ทำงานแทน Cronjob) 🌟
    if (endpoint && endpoint.startsWith('/items/total')) {
        // อัปเดต Endpoints ตามที่ระบุใหม่ 12 หัวข้อ
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

            // ค่อยๆ ยิงทีละลิงก์ (Sequential) เพื่อไม่ให้เกม Wolvesville ตกใจและบล็อค (Rate Limit)
            for (const ep of itemEndpoints) {
                const response = await fetch(`https://api.wolvesville.com${ep}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bot ${apiKey}`, 'Accept': 'application/json' }
                });

                if (response.ok) {
                    const arr = await response.json();
                    if (Array.isArray(arr)) totalCount += arr.length;
                } else if (response.status === 429) {
                    // ถ้าเกมเริ่มบล็อค ให้หยุดพักหายใจ 0.5 วินาที แล้วลุยต่อ
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            // 🌟 สั่งให้ Vercel จดจำตัวเลขนี้ไว้ 12 ชั่วโมง (43200 วินาที)
            res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate');
            return res.status(200).json({ count: totalCount });

        } catch (error) {
            console.error('[Proxy Items] Error:', error.message);
            return res.status(500).json({ error: error.message });
        }
    }

    try {
        // 4. เตรียมยิง Request ทั่วไป ไปหา Wolvesville
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

        // 5. ยิงไปที่เกม
        const response = await fetch(`https://api.wolvesville.com${endpoint}`, fetchOptions);
        
        // 6. ส่งผลลัพธ์กลับมาที่หน้าเว็บเรา
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
