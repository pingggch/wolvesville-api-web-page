const { kv } = require('@vercel/kv'); 
// หรือ import { kv } from '@vercel/kv'; (ถ้าโปรเจกต์คุณใช้ ES Modules)

// --- 1. สำหรับดึงข้อมูลไปโชว์ที่กราฟ ---
app.get('/api/stats', async (req, res) => {
    try {
        let stats = await kv.get('api_stats');
        
        // ถ้ายังไม่มีข้อมูลในระบบ ให้ใช้ค่าเริ่มต้น
        if (!stats) {
            stats = {
                date_today: new Date().toISOString().split('T')[0],
                date_this_month: new Date().toISOString().slice(0, 7),
                requests: { count_today: 527, count_month: 1607, count_year: 13925, count_lifetime: 13925 }
            };
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const monthStr = todayStr.slice(0, 7);

        // รีเซ็ตยอดเมื่อเปลี่ยนวัน/เดือน
        if (stats.date_today !== todayStr) {
            stats.requests.count_today = 0;
            stats.date_today = todayStr;
        }
        if (stats.date_this_month !== monthStr) {
            stats.requests.count_month = 0;
            stats.date_this_month = monthStr;
        }

        res.json(stats);
    } catch (error) {
        console.error("KV Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

// --- 2. สำหรับบวกตัวเลขนับสถิติเพิ่ม ---
app.post('/api/stats/increment/:type', async (req, res) => {
    try {
        let stats = await kv.get('api_stats');
        if (!stats) {
             stats = {
                date_today: new Date().toISOString().split('T')[0],
                date_this_month: new Date().toISOString().slice(0, 7),
                requests: { count_today: 527, count_month: 1607, count_year: 13925, count_lifetime: 13925 }
            };
        }

        // เช็คก่อนบวก เผื่อเปลี่ยนวัน
        const todayStr = new Date().toISOString().split('T')[0];
        if (stats.date_today !== todayStr) {
            stats.requests.count_today = 0;
            stats.date_today = todayStr;
        }

        // บวกยอด Requests
        stats.requests.count_today += 1;
        stats.requests.count_month += 1;
        stats.requests.count_year += 1;
        stats.requests.count_lifetime += 1;

        // บันทึกกลับลงฐานข้อมูลถาวร
        await kv.set('api_stats', stats);

        res.json({ success: true, stats });
    } catch (error) {
        console.error("KV Increment Error:", error);
        res.status(500).json({ error: "Failed to increment stats" });
    }
});
