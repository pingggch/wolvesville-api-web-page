const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const cors = require('cors');
const os = require('os'); 
const fetch = require('node-fetch');

const app = express();

// -------------------------------------------------------
// [CORRECTION 1] ใช้ PORT จาก Render (ถ้าไม่มีให้ใช้ 4000)
// -------------------------------------------------------
const PORT = process.env.PORT || 4000;

// FILES CONFIGURATION
// หมายเหตุ: บน Render Free Tier ไฟล์เหล่านี้จะถูก Reset ทุกครั้งที่ Deploy ใหม่
const STATS_FILE = path.join(__dirname, 'stats.json');
const TEMP_STATS_FILE = path.join(__dirname, 'stats.json.tmp');

const ITEMS_CACHE_FILE = path.join(__dirname, 'items_cache.json');
const TEMP_ITEMS_CACHE_FILE = path.join(__dirname, 'items_cache.json.tmp');

// WOLVESVILLE API CONFIG
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
// 1. GENERIC FILE UTILS (Atomic Write)
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
        // สร้างไฟล์ใหม่ถ้ายังไม่มี
        try {
             await saveJsonFile(filePath, filePath + '.tmp', defaultValue);
        } catch (err) {
            console.error("Error creating initial file:", err);
        }
        return defaultValue;
    }
}

// **********************************************
// 2. STATS LOGIC
// **********************************************

async function loadStats() {
    const initialStats = {
        date_today: new Date().toISOString().split('T')[0],
        date_this_month: new Date().toISOString().substring(0, 7),
        requests: { count_today: 0, count_month: 0, count_year: 0, count_lifetime: 0 }, 
        visitors: { count_today: 0, count_month: 0, count_year: 0, count_lifetime: 0 }  
    };
    const stats = await loadJsonFile(STATS_FILE, initialStats);
    
    // Validate fields
    if (stats.requests.count_lifetime === undefined) stats.requests.count_lifetime = stats.requests.count_year || 0;
    if (stats.visitors.count_lifetime === undefined) stats.visitors.count_lifetime = stats.visitors.count_year || 0;
    
    return stats;
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
    if (updated) await saveJsonFile(STATS_FILE, TEMP_STATS_FILE, updatedStats);
    res.json(updatedStats);
});

app.post('/api/stats/increment/:type', async (req, res) => {
    const type = req.params.type; 
    if (type !== 'requests' && type !== 'visitors') return res.status(400).json({ error: 'Invalid type' });

    let stats = await loadStats();
    const { stats: updatedStats } = checkAndResetStats(stats);
    stats = updatedStats;

    if (stats[type]) {
        stats[type].count_today++;
        stats[type].count_month++;
        stats[type].count_year++;
        stats[type].count_lifetime++; 
        await saveJsonFile(STATS_FILE, TEMP_STATS_FILE, stats);
        return res.status(200).json({ success: true, newCount: stats[type].count_today });
    }
    return res.status(500).json({ error: 'Server error' });
});

// **********************************************
// 3. ITEMS CACHE LOGIC
// **********************************************

app.get('/api/items/total', async (req, res) => {
    const apiKey = req.query.apiKey;
    
    const cacheData = await loadJsonFile(ITEMS_CACHE_FILE, { timestamp: 0, count: 0 });
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (now - cacheData.timestamp < ONE_DAY_MS && cacheData.count > 0) {
        console.log(`[Items Cache] Hit! Returning cached count: ${cacheData.count}`);
        return res.json({ count: cacheData.count, fromCache: true });
    }

    if (!apiKey) {
        // ถ้าไม่มี API Key และ Cache เก่าใช้ไม่ได้ ให้ส่ง error หรือค่าเก่าที่มี
        if (cacheData.count > 0) return res.json({ count: cacheData.count, fromCache: true, stale: true });
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

        const newCacheData = {
            timestamp: now,
            count: newCount
        };
        await saveJsonFile(ITEMS_CACHE_FILE, TEMP_ITEMS_CACHE_FILE, newCacheData);

        console.log(`[Items Cache] Updated. New count: ${newCount}`);
        return res.json({ count: newCount, fromCache: false });

    } catch (error) {
        console.error('[Items Cache] Error fetching items:', error);
        return res.json({ count: cacheData.count || 0, error: true });
    }
});

// **********************************************
// 4. PROXY & SERVER START
// **********************************************

const proxyHandler = async (req, res) => {
    // ... (Proxy Logic เดิม) ...
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

app.listen(PORT, () => {
    console.log(`\n==============================================`);
    console.log(`✅ Server is running on PORT ${PORT}`);
    console.log(`==============================================\n`);
});