// ไฟล์: api/index.js
export default async function handler(req, res) {
    // 1. อนุญาตให้หน้าเว็บ (CORS) เรียกใช้งานได้
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 2. ดึงข้อมูลที่หน้าเว็บส่งมา
    const params = req.method === 'GET' ? req.query : req.body;
    const endpoint = params.endpoint;
    const apiKey = params.apiKey;
    const targetMethod = params.method || req.method || 'GET';
    const targetData = params.data || params.body;

    // 3. ตรวจสอบว่ามีข้อมูลครบไหม
    if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });
    // 🌟 ระบบพิเศษ: ดึงไอเทมทั้งหมดเพื่อนับจำนวน (ทำงานแทน Cronjob) 🌟
    if (endpoint === '/items/total') {
        const itemEndpoints = [
            '/items/avatarItems', '/items/bodyPaints', '/items/profileIcons',
            '/items/profileIconBorders', '/items/emojis', '/items/backgrounds',
            '/items/loadingScreens', '/items/roleIcons', '/items/roseSkins', '/items/talismans'
        ];

        try {
            // สั่งยิง API พร้อมกัน 21 เส้นเพื่อความรวดเร็ว
            const fetchPromises = itemEndpoints.map(ep => 
                fetch(`https://api.wolvesville.com${ep}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bot ${apiKey}`, 'Accept': 'application/json' }
                }).then(r => r.ok ? r.json() : [])
            );

            const results = await Promise.all(fetchPromises);
            
            // นำผลลัพธ์ที่เป็น Array มาบวกความยาวรวมกัน
            let totalCount = 0;
            results.forEach(arr => {
                if (Array.isArray(arr)) totalCount += arr.length;
            });

            // 🌟 สั่งให้ Vercel จดจำตัวเลขนี้ไว้ 12 ชั่วโมง (43200 วินาที) จะได้ไม่กินโควต้า API บ่อยๆ
            res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate');
            return res.status(200).json({ count: totalCount });

        } catch (error) {
            console.error('[Proxy Items] Error:', error.message);
            return res.status(500).json({ error: error.message });
        }
    }
    if (!apiKey) return res.status(401).json({ error: 'API Key missing' });

    try {
        // 4. เตรียมยิง Request ไปหา Wolvesville
        const fetchOptions = {
            method: targetMethod,
            headers: {
                'Authorization': `Bot ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        // ถ้ามีการส่ง Data (พวก POST, PUT เช่น การกดโหวต, ซื้อเควส) ให้แนบไปด้วย
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
        res.status(500).json({ error: error.message });
    }
}
