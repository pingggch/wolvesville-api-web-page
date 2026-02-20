const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 4000;

// ==========================================
// ⚙️ GITHUB CONFIGURATION (โหลดจาก .env)
// ==========================================
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 
const GITHUB_REPO = process.env.GITHUB_REPO; 
const GITHUB_STATS_PATH = 'stats.json';
const GITHUB_ITEMS_CACHE_PATH = 'items_cache.json'; // เพิ่มไฟล์ items_cache.json ตามในรูป

// State ตัวแปรสำหรับเก็บ SHA เพื่อใช้ตอน Commit ทับไฟล์เดิม
let currentStatsSha = null;
let currentItemsCacheSha = null;
let statsDirty = false;

let cachedStats = null;
let cachedItemsData = null;

// FILES CONFIGURATION (Local Fallback)
const STATS_FILE = path.join(__dirname, 'stats.json');
const TEMP_STATS_FILE = path.join(__dirname, 'stats.json.tmp');

const ITEMS_CACHE_FILE = path.join(__dirname, 'items_cache.json');
const TEMP_ITEMS_CACHE_FILE = path.join(__dirname, 'items_cache.json.tmp');

const WOLVESVILLE_BASE_URL = 'https://api.wolvesville.com';
const ITEM_ENDPOINTS = [
    '/items/avatarItems', '/items/bodyPaints', '/items/profileIcons',
    '/items/profileIconBorders', '/items/emojis', '/items/backgrounds',
    '/items/loadingScreens', '/items/roleIcons', '/items/roseSkins', '/items/talismans'
];

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// **********************************************
// 1. GENERIC FILE UTILS & GITHUB SYNC
// **********************************************

async function saveJsonFile(filePath, tempPath, data) {
    const jsonString = JSON.stringify(data, null, 2);
    try {
        await fs.writeFile(tempPath, jsonString, 'utf-8');
        await fs.rename(tempPath, filePath);
    } catch (error) {
        console.error(`ERROR: Failed to save file ${filePath}`, error);
    }
}

async function loadJsonFile(filePath, defaultValue) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        try {
             await saveJsonFile(filePath, filePath + '.tmp', defaultValue);
        } catch (err) {}
        return defaultValue;
    }
}

// 🟢 ฟังก์ชันหลักสำหรับ: ดึงไฟล์จาก GitHub
async function fetchFileFromGitHub(filePath) {
    if (!GITHUB_TOKEN || !GITHUB_REPO) return { data: null, sha: null };
    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (res.ok) {
            const data = await res.json();
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            return { data: JSON.parse(content), sha: data.sha };
        }
    } catch (e) {
        console.error(`[GitHub] Fetch Error for ${filePath}:`, e.message);
    }
    return { data: null, sha: null };
}

// 🟢 ฟังก์ชันหลักสำหรับ: อัปเดตไฟล์ทับบน GitHub อัตโนมัติ
async function pushFileToGitHub(filePath, jsonData, currentSha) {
    if (!GITHUB_TOKEN || !GITHUB_REPO) return currentSha;
    try {
        const contentStr = JSON.stringify(jsonData, null, 2) + '\n';
        const encodedContent = Buffer.from(contentStr).toString('base64');
        
        const bodyData = {
            message: `Auto-update ${filePath} via Dashboard`,
            content: encodedContent
        };
        // ถ้าเคยมีไฟล์นี้อยู่แล้วให้แนบ SHA ไปทับไฟล์เดิม
        if (currentSha) bodyData.sha = currentSha;

        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });
        
        if (res.ok) {
            const data = await res.json();
            console.log(`[GitHub] ${filePath} synced successfully!`);
            return data.content.sha; // คืนค่า SHA ใหม่
        } else {
            console.error(`[GitHub] Push failed for ${filePath}. Fetching fresh SHA...`);
            // กรณีมีคนแก้ไฟล์พร้อมกัน (Conflict) ให้ไปดึงค่าล่าสุดมาเตรียมไว้รอบหน้า
            const latest = await fetchFileFromGitHub(filePath);
            return latest.sha;
        }
    } catch (e) {
        console.error(`[GitHub] Push Error for ${filePath}:`, e.message);
        return currentSha;
    }
}

// Loop การตรวจสอบและอัปเดต `stats.json` ลง GitHub (ทำทุก 1 นาที เพื่อไม่ให้ติด Limit ของ GitHub)
setInterval(async () => {
    if (statsDirty && cachedStats) {
        statsDirty = false;
        currentStatsSha = await pushFileToGitHub(GITHUB_STATS_PATH, cachedStats, currentStatsSha);
    }
}, 60000);

// **********************************************
// 2. STATS LOGIC
// **********************************************

async function loadStats() {
    if (!cachedStats) {
        // ดึงจาก GitHub ก่อนเป็นอันดับแรก
        const ghData = await fetchFileFromGitHub(GITHUB_STATS_PATH);
        if (ghData.data) {
            cachedStats = ghData.data;
            currentStatsSha = ghData.sha;
            await saveJsonFile(STATS_FILE, TEMP_STATS_FILE, cachedStats); // เซฟลง Local ไว้ด้วย
        } else {
            // ถ้าดึงไม่ได้ ให้ใช้ค่าเริ่มต้น
            const initialStats = {
                date_today: new Date().toISOString().split('T')[0],
                date_this_month: new Date().toISOString().substring(0, 7),
                requests: { count_today: 0, count_month: 0, count_year: 0, count_lifetime: 0 }, 
                visitors: { count_today: 0, count_month: 0, count_year: 0, count_lifetime: 0 }  
            };
            cachedStats = await loadJsonFile(STATS_FILE, initialStats);
        }
    }
    
    if (cachedStats.requests.count_lifetime === undefined) cachedStats.requests.count_lifetime = cachedStats.requests.count_year || 0;
    if (cachedStats.visitors.count_lifetime === undefined) cachedStats.visitors.count_lifetime = cachedStats.visitors.count_year || 0;
    
    return cachedStats;
}

function checkAndResetStats(stats) {
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];
    const thisMonth = today.toISOString().substring(0, 7);
    let updated = false;

    if (stats.date_today !== todayDate) {
        stats.requests.count_today = 0;
        stats.visitors.count_today = 0;
        stats.date_today = todayDate;
        updated = true;
    }

    if (stats.date_this_month !== thisMonth) {
        const currentYear = today.getFullYear();
        const recordedYear = stats.date_this_month ? parseInt(stats.date_this_month.substring(0, 4)) : currentYear;
        if (currentYear !== recordedYear) {
            stats.requests.count_year = 0;
            stats.visitors.count_year = 0;
        }
        stats.requests.count_month = 0;
        stats.visitors.count_month = 0;
        stats.date_this_month = thisMonth;
        updated = true;
    }
    return { stats, updated };
}

// Stats Endpoints
app.get('/api/stats', async (req, res) => {
    let stats = await loadStats();
    const { stats: updatedStats, updated } = checkAndResetStats(stats);
    if (updated) {
        cachedStats = updatedStats;
        await saveJsonFile(STATS_FILE, TEMP_STATS_FILE, cachedStats);
        statsDirty = true;
    }
    res.json(cachedStats);
});

app.post('/api/stats/increment/:type', async (req, res) => {
    const type = req.params.type; 
    if (type !== 'requests' && type !== 'visitors') return res.status(400).json({ error: 'Invalid type' });

    let stats = await loadStats();
    const { stats: updatedStats } = checkAndResetStats(stats);
    cachedStats = updatedStats;

    if (cachedStats[type]) {
        cachedStats[type].count_today++;
        cachedStats[type].count_month++;
        cachedStats[type].count_year++;
        cachedStats[type].count_lifetime++; 
        
        await saveJsonFile(STATS_FILE, TEMP_STATS_FILE, cachedStats);
        statsDirty = true; // มาร์คไว้รออัปเดตลง GitHub

        return res.status(200).json({ success: true, newCount: cachedStats[type].count_today });
    }
    return res.status(500).json({ error: 'Server error' });
});

// **********************************************
// 3. ITEMS CACHE LOGIC (Sync with GitHub added)
// **********************************************

app.get('/api/items/total', async (req, res) => {
    const apiKey = req.query.apiKey;
    
    // โหลดข้อมูลล่าสุด (ใช้ GitHub เป็นหลัก ถ้าไม่มีใช้จาก Local)
    if (!cachedItemsData) {
        const ghData = await fetchFileFromGitHub(GITHUB_ITEMS_CACHE_PATH);
        if (ghData.data) {
            cachedItemsData = ghData.data;
            currentItemsCacheSha = ghData.sha;
        } else {
            cachedItemsData = await loadJsonFile(ITEMS_CACHE_FILE, { timestamp: 0, count: 0 });
        }
    }

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();

    // เช็คว่า Cache หมดอายุหรือยัง
    if (now - cachedItemsData.timestamp < ONE_DAY_MS && cachedItemsData.count > 0) {
        console.log(`[Items Cache] Hit! Returning cached count: ${cachedItemsData.count}`);
        return res.json({ count: cachedItemsData.count, fromCache: true });
    }

    if (!apiKey) {
        if (cachedItemsData.count > 0) return res.json({ count: cachedItemsData.count, fromCache: true, stale: true });
        return res.status(400).json({ error: 'API Key required to refresh cache' });
    }

    console.log(`[Items Cache] Miss/Expired. Fetching fresh data...`);

    try {
        const fetchPromises = ITEM_ENDPOINTS.map(endpoint => 
            fetch(`${WOLVESVILLE_BASE_URL}${endpoint}`, {
                headers: { 
                    'Authorization': `Bot ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }).then(r => r.ok ? r.json() : [])
        );

        const results = await Promise.all(fetchPromises);
        
        const uniqueIds = new Set();
        results.forEach(items => {
            if (Array.isArray(items)) {
                items.forEach(item => { if(item.id) uniqueIds.add(item.id); });
            }
        });

        const newCount = uniqueIds.size;

        // อัปเดต Cache ใหม่
        cachedItemsData = {
            timestamp: now,
            count: newCount
        };
        
        await saveJsonFile(ITEMS_CACHE_FILE, TEMP_ITEMS_CACHE_FILE, cachedItemsData);

        // ดันไฟล์ items_cache.json ขึ้นไปทับบน GitHub อัตโนมัติ (ทำทันที ไม่ต้องรอ Loop เพราะดึงวันละรอบ)
        currentItemsCacheSha = await pushFileToGitHub(GITHUB_ITEMS_CACHE_PATH, cachedItemsData, currentItemsCacheSha);

        console.log(`[Items Cache] Updated. New count: ${newCount}`);
        return res.json({ count: newCount, fromCache: false });

    } catch (error) {
        console.error('[Items Cache] Error fetching items:', error);
        return res.json({ count: cachedItemsData.count || 0, error: true });
    }
});

// **********************************************
// 4. PROXY & SERVER START
// **********************************************

const proxyHandler = async (req, res) => {
    const params = req.method === 'GET' ? req.query : req.body;
    const endpoint = params.endpoint;
    const apiKey = params.apiKey;
    const targetMethod = params.method || 'GET'; 
    const targetData = params.data || params.body;

    if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });
    if (!apiKey) return res.status(401).json({ error: 'API Key missing' });

    const targetUrl = `${WOLVESVILLE_BASE_URL}${endpoint}`;

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

        const response = await fetch(targetUrl, fetchOptions);
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (!response.ok) return res.status(response.status).json(data);
            return res.status(200).json(data);
        } else {
            const text = await response.text();
            if (!response.ok) return res.status(response.status).send(text);
            return res.status(200).send(text);
        }
        
    } catch (error) {
        console.error('[Proxy] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

app.get('/api/wolvesville', proxyHandler);
app.post('/api/wolvesville', proxyHandler);

// 🌟 สิ่งที่แก้ไขใหม่สำหรับ Vercel: ให้ export app ออกมาแทนการสั่ง listen เสมอ 🌟
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`\n==============================================`);
        console.log(`✅ Server is running on PORT ${PORT}`);
        console.log(`==============================================\n`);
    });
}

module.exports = app;
