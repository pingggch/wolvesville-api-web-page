// **********************************************
// 1. CONFIGURATION
// **********************************************
console.log('--- script.js: Loading Started ---'); 

const localServerUrl = window.location.origin; 

let itemDataCache = null; 
let isFetchingItems = false; 
let globalEmojiMap = new Map(); // Cache for Emoji URLs (Preview + Animation)
let avatarItemsCache = new Map(); // NEW: Cache for Avatar Items from API
let playerAvatarCache = new Map(); // Cache for player avatars
let clanMembersDetailedMap = new Map(); // NEW: Cache for Detailed Member Data

// Global Cache for Quest Details & Votes
let questDetailsCache = new Map();
let clanVotesCache = {};
let clanMembersCache = {}; // Map playerId -> username

// Polling Variables
let clanPollingInterval = null;
let currentViewingClanId = null;
let isCurrentViewMyClan = false;
let isFirstRender = true; // To track if we need to render full layout or just update content

// Global State for Animation
let currentParticipatingCount = 0; 

// Inject Lottie Player Script
const lottieScript = document.createElement('script');
lottieScript.src = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";
document.head.appendChild(lottieScript);

// **********************************************
// 2. CUSTOM UI HELPERS
// **********************************************

function showCustomConfirm(title, message, isDangerous = false) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="custom-modal-buttons">
                    <button class="btn-modal btn-cancel">Cancel</button>
                    <button class="btn-modal action-confirm ${isDangerous ? 'btn-danger' : 'btn-confirm'}">Yes, Confirm</button>
                </div>
            </div>
        `;
        
        const close = (val) => {
            overlay.remove();
            resolve(val);
        };

        overlay.querySelector('.btn-cancel').onclick = () => close(false);
        overlay.querySelector('.action-confirm').onclick = () => close(true);
        overlay.onclick = (e) => { if(e.target === overlay) close(false); };
        
        document.body.appendChild(overlay);
    });
}

function showCustomInfoModal(title, contentHtml, isLarge = false) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const style = isLarge ? 'min-width: 80%; max-width: 1000px;' : '';
    
    overlay.innerHTML = `
        <div class="modal-content" style="text-align:left; ${style}">
            <h3 style="text-align:center; margin-bottom: 20px;">${title}</h3>
            <div>${contentHtml}</div>
            <div class="custom-modal-buttons">
                <button class="btn-modal btn-confirm">Close</button>
            </div>
        </div>
    `;
    overlay.querySelector('.btn-confirm').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
}

function showCustomPrompt(title, message, defaultValue = '') {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content">
                <h3>${title}</h3>
                <p>${message}</p>
                <input type="text" id="custom-prompt-input" value="${defaultValue.replace(/"/g, '&quot;')}" style="width: 80%; padding: 10px; margin: 10px 0; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem;">
                <div class="custom-modal-buttons">
                    <button class="btn-modal btn-cancel">Cancel</button>
                    <button class="btn-modal btn-confirm">Save</button>
                </div>
            </div>
        `;
        
        const input = overlay.querySelector('#custom-prompt-input');
        
        const close = (val) => {
            overlay.remove();
            resolve(val);
        };

        overlay.querySelector('.btn-cancel').onclick = () => close(null);
        overlay.querySelector('.btn-confirm').onclick = () => close(input.value.trim());
        
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') close(input.value.trim());
        });

        overlay.onclick = (e) => { if(e.target === overlay) close(null); };
        
        document.body.appendChild(overlay);
        setTimeout(() => input.focus(), 100);
    });
}

function showCustomAlert(title, message) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content">
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="custom-modal-buttons">
                <button class="btn-modal btn-confirm">OK</button>
            </div>
        </div>
    `;
    overlay.querySelector('.btn-confirm').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
}

// **********************************************
// 3. DOM REFERENCES
// **********************************************
const appContainer = document.querySelector('.app-container');
const hamburgerBtn = document.querySelector('.hamburger-btn');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page-content');

const apiStatusDot = document.getElementById('api-status-dot');
const apiStatusText = document.getElementById('api-status-text');
const availableItems = document.getElementById('available-items'); 
const requestsTodayOnly = document.getElementById('requests-today-only'); 

const requestsFullToday = document.getElementById('requests-full-today');
const requestsFullThisMonth = document.getElementById('requests-full-this-month');
const requestsFullThisYear = document.getElementById('requests-full-this-year');
const requestsFullLifetime = document.getElementById('requests-full-lifetime'); 
const visitorsFullToday = document.getElementById('visitors-full-today');
const visitorsFullThisMonth = document.getElementById('visitors-full-this-month');
const visitorsFullThisYear = document.getElementById('visitors-full-this-year');
const visitorsFullLifetime = document.getElementById('visitors-full-lifetime'); 

const usernameInput = document.getElementById('username-input');
const searchPlayerBtn = document.getElementById('search-player-btn');
const playerProfileContainer = document.getElementById('player-profile-container');

const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const apiKeyStatus = document.getElementById('api-key-status');

const clanNameInput = document.getElementById('clan-name-input');
const searchClanBtn = document.getElementById('search-clan-btn');
const myClanBtn = document.getElementById('my-clan-btn');
const clanContentContainer = document.getElementById('clan-content-container');

// **********************************************
// 4. GLOBAL FUNCTIONS
// **********************************************

window.goToPlayerSearch = (username) => {
    console.log('Navigating to search for:', username);
    const input = document.getElementById('username-input');
    if(input) {
        input.value = username;
        const playerTab = document.querySelector('.nav-link[data-page="player-search"]');
        if (playerTab) {
            playerTab.click();
        }
        if (typeof window.searchAndDisplayPlayer === 'function') {
            window.searchAndDisplayPlayer();
        }
    }
};

function escapeJsString(str) {
    return (str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

async function fetchAndCacheEmojis() {
    if (globalEmojiMap.size > 0) return; 
    console.log('[Emojis] Fetching emojis list...');
    const res = await fetchData('/items/emojis', false, false);
    if (!res.error && Array.isArray(res)) {
        res.forEach(emoji => {
            globalEmojiMap.set(emoji.id, {
                preview: emoji.urlPreview,
                anim: emoji.urlAnimation 
            }); 
        });
        console.log(`[Emojis] Cached ${globalEmojiMap.size} emojis.`);
    }
}

async function fetchAndCacheAvatarItems() {
    if (avatarItemsCache.size > 0) return;
    console.log('[Items] Fetching avatar items list...');
    const res = await fetchData('/items/avatarItems', false, false);
    if (!res.error && Array.isArray(res)) {
        res.forEach(item => {
            avatarItemsCache.set(item.id, item);
        });
        console.log(`[Items] Cached ${avatarItemsCache.size} avatar items.`);
    }
}

// NEW: Function to View All Clan Quests (Wiki) - FETCHING GLOBAL QUESTS
window.viewAllQuests = async () => {
    showCustomInfoModal('Loading...', '<div style="text-align:center; padding:30px;"><div class="quest-inline-icon loading" style="font-size:40px;">sync</div><br>Fetching all possible quests from the game...</div>');
    
    try {
        const res = await fetchData('/clans/quests/all');
        
        if (res.error) {
             document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
             showCustomAlert('Error', 'Failed to fetch all quests: ' + (res.message || 'Unknown error'));
             return;
        }

        let html = '<div style="max-height: 75vh; overflow-y: auto; padding-right:10px; padding-bottom: 20px;">';
        html += '<p style="color:#64748b; font-size:0.9rem; margin-bottom:20px; text-align:center;">This list shows all clan quests existing in Wolvesville, including non-purchasable special events.</p>';
        html += '<div class="quest-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px;">';
        
        if (Array.isArray(res)) {
            html += res.map(q => {
                const isGem = q.purchasableWithGems;
                const costLabel = isGem 
                    ? '<span style="color:#d8b4fe; font-size:0.75rem; display:flex; align-items:center; gap:3px;"><span class="material-icons" style="font-size:14px;">diamond</span> Gem Quest</span>' 
                    : '<span style="color:#fcd34d; font-size:0.75rem; display:flex; align-items:center; gap:3px;"><span class="material-icons" style="font-size:14px;">monetization_on</span> Gold Quest</span>';
                
                const imgUrl = q.promoImageUrl || 'https://via.placeholder.com/200x120?text=No+Image';
                
                let rewardsHtml = '';
                if (q.rewards && q.rewards.length > 0) {
                    rewardsHtml = '<div style="display:flex; gap:4px; margin-top:8px; flex-wrap:wrap;">';
                    q.rewards.slice(0, 4).forEach(r => {
                        let rImg = 'https://cdn.wolvesville.com/static/items/calavera.png';
                        if (r.type === 'AVATAR_ITEM') {
                            rImg = `https://cdn.wolvesville.com/avatarItems/png/256x/${r.avatarItemId}.png`;
                        } else if (r.type === 'GOLD') {
                            rImg = 'https://cdn.wolvesville.com/static/gold.png';
                        } else if (r.type === 'GEM' || r.type === 'GEMS') {
                            rImg = 'https://cdn.wolvesville.com/static/gem.png';
                        }
                        rewardsHtml += `<img src="${rImg}" style="width:20px; height:20px; object-fit:contain; background:rgba(255,255,255,0.1); border-radius:4px; padding:2px;" title="${r.type} x${r.amount}">`;
                    });
                    if (q.rewards.length > 4) {
                        rewardsHtml += `<span style="font-size:0.65rem; color:white; align-self:center;">+${q.rewards.length - 4}</span>`;
                    }
                    rewardsHtml += '</div>';
                }

                return `
                    <div class="quest-card-large" style="height: 180px; cursor: default; border: 1px solid #334155; position: relative; overflow: hidden; border-radius: 12px;">
                        <img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0; z-index:1;">
                        <div style="position:absolute; bottom:0; left:0; right:0; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 70%, transparent 100%); padding: 10px; z-index: 2; min-height: 60px;">
                            <div style="font-weight:bold; color:white; font-size:0.85rem; text-shadow: 0 1px 2px black; margin-bottom:2px;">${q.id.substring(0,8)}...</div>
                            ${costLabel}
                            ${rewardsHtml}
                        </div>
                        ${!isGem && q.purchasableWithGems === false ? '<div style="position:absolute; top:5px; right:5px; background:rgba(239, 68, 68, 0.8); color:white; font-size:0.6rem; padding:2px 6px; border-radius:4px; z-index:3;">EVENT ONLY</div>' : ''}
                    </div>
                `;
            }).join('');
        }
        
        html += '</div></div>';
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        showCustomInfoModal('📚 Global Clan Quests Wiki', html, true);
    } catch(e) {
        console.error('[Wiki] Error:', e);
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        showCustomAlert('Error', 'An unexpected error occurred while fetching quests.');
    }
};

window.showQuestModal = (questId) => {
    const quest = questDetailsCache.get(questId);
    if (!quest) return showCustomAlert('Error', 'Quest details not found.');

    const title = quest.title || 'Clan Quest';
    const imageUrl = quest.promoImageUrl || 'https://via.placeholder.com/200';
    
    let rewardsHtml = '<p style="color:#64748b; font-style:italic;">No specific rewards</p>';
    if (quest.rewards && quest.rewards.length > 0) {
        const rewardsList = quest.rewards.map((r, idx) => {
            let imgUrl = 'https://via.placeholder.com/60?text=?';
            let label = r.type.replace(/_/g, ' ');
            let subLabel = `x${r.amount}`;

            if (r.type === 'AVATAR_ITEM') {
                const itemId = r.avatarItemId;
                imgUrl = `https://cdn.wolvesville.com/avatarItems/png/256x/${itemId}.png`; 
                const cachedItem = avatarItemsCache.get(itemId);
                if (cachedItem && cachedItem.imageUrl) imgUrl = cachedItem.imageUrl;
                label = 'Avatar Item';
                if (r.amount <= 1) subLabel = '';
            } else if (r.type === 'GOLD') imgUrl = 'https://cdn.wolvesville.com/static/gold.png';
            else if (r.type === 'GEM' || r.type === 'GEMS') imgUrl = 'https://cdn.wolvesville.com/static/gem.png';

            return `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; background:#fff; padding:10px; border-radius:12px; border:1px solid #e2e8f0; position:relative; box-shadow: 0 1px 2px rgba(0,0,0,0.05); min-height:80px;" title="${label}">
                    <div style="position:absolute; top:0; right:0; background:#64748b; color:white; font-size:0.65rem; padding:2px 6px; border-bottom-left-radius:8px; font-weight:bold;">T${idx+1}</div>
                    <img src="${imgUrl}" onerror="this.src='https://cdn.wolvesville.com/static/items/calavera.png'" style="width:48px; height:48px; object-fit:contain; margin-top:5px;">
                    ${subLabel ? `<div style="font-size:0.75rem; font-weight:bold; color:#475569; margin-top:5px;">${subLabel}</div>` : ''}
                </div>
            `;
        }).join('');

        const colCount = Math.max(1, Math.ceil(quest.rewards.length / 2));
        rewardsHtml = `<div style="display:grid; grid-template-columns:repeat(${colCount}, 1fr); gap:8px; margin-top:5px;">${rewardsList}</div>`;
    }

    let votesHtml = '<p style="color:#64748b;">No votes yet</p>';
    if (clanVotesCache.votes && clanVotesCache.votes[questId]) {
        const voterIds = clanVotesCache.votes[questId];
        if (voterIds.length > 0) {
            votesHtml = voterIds.map(vid => {
                const name = clanMembersCache[vid] || 'Unknown Member';
                return `<span class="voter-tag">${name}</span>`;
            }).join('');
            votesHtml = `<div style="margin-top:5px;">${votesHtml}</div>`;
        }
    }

    const content = `
        <img src="${imageUrl}" style="width:100%; border-radius:8px; margin-bottom:15px; border:1px solid #e2e8f0; display:block;">
        <h4 style="margin-bottom:10px; color:#334155;">🎁 Rewards</h4>
        ${rewardsHtml}
        <h4 style="margin:15px 0 10px 0; color:#334155;">🗳️ Votes (${(clanVotesCache.votes?.[questId] || []).length})</h4>
        ${votesHtml}
    `;

    showCustomInfoModal(title, content);
};

// Member Details Modal
function showMemberModal(data) {
    let avatarUrl = 'https://via.placeholder.com/150';
    if(data.equippedAvatar?.url) avatarUrl = data.equippedAvatar.url;
    else if(data.profileIconId) avatarUrl = `https://cdn-avatars.wolvesville.com/${data.profileIconId}`;

    const creationDate = formatDateThai(data.creationTime);
    const lastOnline = formatDateThai(data.lastOnline);
    const don = data.donated || {};
    const xpDur = data.xpDurations || {};
    
    let statusClass = 'offline';
    let statusLabel = data.status || 'UNKNOWN';
    if(data.playerStatus === 'ONLINE' || data.status === 'ONLINE') { statusClass = 'online'; statusLabel = 'ONLINE'; }
    else if(data.playerStatus === 'PLAY' || data.status === 'PLAY') { statusClass = 'play'; statusLabel = 'PLAYING'; }
    
    const joinMsg = data.joinMessage ? `<div style="background:#f1f5f9; padding:10px; border-radius:8px; margin-top:10px; font-style:italic; color:#475569; font-size:0.9rem; border-left: 3px solid #cbd5e1;">"${data.joinMessage}"</div>` : '';
    const fmt = (n) => (n || 0).toLocaleString();
    const safeUsername = escapeJsString(data.username);

    const content = `
        <div style="display:flex; flex-direction:column; align-items:center; margin-bottom:20px;">
            <img src="${avatarUrl}" style="width:100px; height:100px; border-radius:25%; border:4px solid #e2e8f0; margin-bottom:10px; background:#f1f5f9; object-fit:contain;">
            <h2 style="margin:0; font-size:1.5rem; color:#1e293b; cursor:pointer; text-decoration:underline;" 
                onclick="document.querySelectorAll('.modal-overlay').forEach(el => el.remove()); window.goToPlayerSearch('${safeUsername}')">
                ${data.username}
            </h2>
            <div style="color:#64748b; font-size:0.9rem;">${data.flair ? `"${data.flair}"` : '-'}</div>
            <div style="margin-top:5px;">
                <span class="status-badge ${statusClass}" style="font-size:0.7rem; padding:2px 8px;">${statusLabel}</span>
                <span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:12px; font-size:0.7rem; font-weight:bold;">LVL ${data.level || 0}</span>
            </div>
            ${joinMsg}
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
             <div style="background:#f8fafc; padding:10px; border-radius:8px; border:1px solid #e2e8f0; text-align:center;">
                <div style="font-size:0.8rem; color:#64748b; margin-bottom:5px;">Joined</div>
                <div style="font-weight:600; font-size:0.9rem;">${creationDate.split(' ')[0]}</div>
             </div>
             <div style="background:#f8fafc; padding:10px; border-radius:8px; border:1px solid #e2e8f0; text-align:center;">
                <div style="font-size:0.8rem; color:#64748b; margin-bottom:5px;">Last Online</div>
                <div style="font-weight:600; font-size:0.85rem;">${lastOnline}</div>
             </div>
        </div>
        <h4 style="margin:15px 0 10px 0; color:#334155; border-bottom:1px solid #eee; padding-bottom:5px;">💰 Donations</h4>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:5px; text-align:center; margin-bottom:15px; font-size:0.85rem;">
            <div style="font-weight:bold; color:#64748b; font-size:0.75rem;">Period</div>
            <div style="font-weight:bold; color:#d97706;">Gold</div>
            <div style="font-weight:bold; color:#9333ea;">Gems</div>
            <div style="color:#64748b;">Week</div><div style="color:#d97706;">${fmt(don.gold?.week)}</div><div style="color:#9333ea;">${fmt(don.gems?.week)}</div>
            <div style="color:#64748b;">Month</div><div style="color:#d97706;">${fmt(don.gold?.month)}</div><div style="color:#9333ea;">${fmt(don.gems?.month)}</div>
            <div style="color:#64748b;">All Time</div><div style="color:#d97706; font-weight:bold;">${fmt(don.gold?.allTime)}</div><div style="color:#9333ea; font-weight:bold;">${fmt(don.gems?.allTime)}</div>
        </div>
        <h4 style="margin:15px 0 10px 0; color:#334155; border-bottom:1px solid #eee; padding-bottom:5px;">⚔️ Activity</h4>
        <div style="background:#f0fdf4; padding:15px; border-radius:8px; border:1px solid #bbf7d0;">
             <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                 <div><div style="color:#166534; font-size:0.75rem; margin-bottom:2px;">XP (Week)</div><div style="font-weight:bold;">${fmt(xpDur.week)}</div></div>
                 <div><div style="color:#166534; font-size:0.75rem; margin-bottom:2px;">XP (Month)</div><div style="font-weight:bold;">${fmt(xpDur.month)}</div></div>
                 <div style="grid-column: span 2; text-align: center; background: rgba(255,255,255,0.5); border-radius: 6px; padding: 5px;">
                    <div style="color:#15803d; font-size:0.75rem; margin-bottom:2px; font-weight:bold;">✨ XP (All Time)</div>
                    <div style="font-weight:bold; font-size:1.1rem; color:#15803d;">${fmt(data.xp)}</div>
                 </div>
                 <div><div style="color:#166534; font-size:0.75rem; margin-bottom:2px;">Gold Quests</div><div style="font-weight:bold;">${fmt(data.goldQuests)}</div></div>
                 <div><div style="color:#166534; font-size:0.75rem; margin-bottom:2px;">Gem Quests</div><div style="font-weight:bold;">${fmt(data.gemQuests)}</div></div>
             </div>
        </div>
    `;
    showCustomInfoModal(data.username || 'Member Details', content);
}

// **********************************************
// 5. UTILITY FUNCTIONS
// **********************************************
function isUUID(str) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function formatMessage(msg) {
    return msg ? msg.replace(/\n/g, '<br>') : 'ไม่มีข้อความส่วนตัว';
}

function linkify(text) {
    if (!text) return '';
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });
}

function formatDateThai(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}

function getQuestResetTimeDisplay() {
    const now = new Date();
    let reset = new Date();
    const day = now.getDay();
    const diff = (day < 1) ? 1 : (1 + 7 - day) % 7; 
    const isTodayReset = diff === 0 && now.getHours() < 7;
    reset.setDate(now.getDate() + (isTodayReset ? 0 : diff)); 
    reset.setHours(7, 0, 0, 0); 
    if (reset < now) {
        reset.setDate(reset.getDate() + (diff === 0 ? 7 : 0));
        if (reset < now) reset.setDate(reset.getDate() + 7);
    }
    const timeDiff = reset - now;
    const d = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const h = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    return `<span id="quest-reset-timer" style="font-size:0.8rem; color:#64748b; font-weight:normal; float:right;">Refreshes in: ${d}d ${h}h ${m}m (Mon 07:00)</span>`;
}

function sendIncrementSignal(type) {
    fetch(`${localServerUrl}/api/stats/increment/${type}`, { method: 'POST' })
        .then(res => { if (res.ok) fetchAndDisplayStatsOnly(); })
        .catch(console.error);
}

// **********************************************
// 6. API HANDLER
// **********************************************
async function fetchData(endpoint, isStatusCheck = false, isRequest = true) {
    const key = localStorage.getItem('wolvesville_api_key');
    if (!key) return { error: true, message: 'Missing API Key' };

    try {
        const timestamp = new Date().getTime();
        const url = `${localServerUrl}/api/wolvesville?endpoint=${encodeURIComponent(endpoint)}&apiKey=${encodeURIComponent(key)}&_t=${timestamp}`;
        const res = await fetch(url);
        if (res.ok) {
            if (isRequest) sendIncrementSignal('requests');
            return await res.json();
        } else {
            return { error: true, status: res.status, message: await res.text() };
        }
    } catch (e) {
        return { error: true, message: e.message };
    }
}

async function sendPayload(endpoint, method, payload) {
    const key = localStorage.getItem('wolvesville_api_key');
    if (!key) return { error: true, message: 'Missing API Key' };

    try {
        const res = await fetch(`${localServerUrl}/api/wolvesville`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint: endpoint,
                apiKey: key,
                method: method,
                data: payload
            })
        });
        if (res.ok) {
            sendIncrementSignal('requests');
            const text = await res.text();
            return text ? JSON.parse(text) : { success: true };
        } else {
            return { error: true, status: res.status, message: await res.text() };
        }
    } catch (e) {
        return { error: true, message: e.message };
    }
}

async function fetchTotalItemsCount(force = false) {
    if (!force && itemDataCache) return itemDataCache;
    if (isFetchingItems) return { count: '...', error: false };
    isFetchingItems = true;
    try {
        const key = localStorage.getItem('wolvesville_api_key');
        const response = await fetch(`${localServerUrl}/api/items/total?apiKey=${encodeURIComponent(key)}`);
        const data = await response.json();
        itemDataCache = data.error ? { count: '-', error: true } : { count: data.count, error: false };
    } catch (e) {
        itemDataCache = { count: '-', error: true };
    }
    isFetchingItems = false;
    return itemDataCache;
}

async function fetchAndDisplayStatsOnly() {
    try {
        const res = await fetch(`${localServerUrl}/api/stats`);
        if (res.ok) {
            const stats = await res.json();
            const req = stats.requests;
            const vis = stats.visitors;
            if(requestsTodayOnly) requestsTodayOnly.textContent = req.count_today.toLocaleString();
            if(requestsFullToday) requestsFullToday.textContent = req.count_today.toLocaleString();
            if(requestsFullLifetime) requestsFullLifetime.textContent = (req.count_lifetime||0).toLocaleString();
            if(visitorsFullToday) visitorsFullToday.textContent = vis.count_today.toLocaleString();
        }
    } catch (e) { console.error(e); }
}

// **********************************************
// 7. DASHBOARD & PLAYER LOGIC
// **********************************************

async function fetchAndDisplayData() {
    await fetchAndDisplayStatsOnly();
    if(apiStatusText) apiStatusText.textContent = 'Checking...';
    const check = await fetchData('/announcements', true, false);
    if (!check.error) {
        if(apiStatusDot) { apiStatusDot.classList.add('connected'); apiStatusDot.style.backgroundColor = '#4CAF50'; }
        if(apiStatusText) apiStatusText.textContent = 'ออนไลน์ (200 OK)';
        const items = await fetchTotalItemsCount();
        if(availableItems) availableItems.textContent = items.error ? 'Error' : items.count.toLocaleString();
    } else {
        if(apiStatusDot) { apiStatusDot.classList.remove('connected'); apiStatusDot.style.backgroundColor = '#D32F2F'; }
        if(apiStatusText) apiStatusText.textContent = 'เชื่อมต่อไม่ได้';
    }
}

window.searchAndDisplayPlayer = async () => {
    const input = usernameInput.value.trim();
    if (!input) return;
    if (!localStorage.getItem('wolvesville_api_key')) return alert('กรุณาใส่ API Key');

    playerProfileContainer.innerHTML = '<div style="text-align:center; padding:30px;">⏳ กำลังค้นหาข้อมูล...</div>';
    let id = input;
    if (!isUUID(input)) {
        const search = await fetchData(`/players/search?username=${encodeURIComponent(input)}`);
        if (search && !search.error && search.length) id = search[0].id;
        else if (search && search.id) id = search.id;
        else {
            playerProfileContainer.innerHTML = '<div style="text-align:center; color:red; padding:20px;">ไม่พบผู้เล่น</div>';
            return;
        }
    }
    const data = await fetchData(`/players/${id}`);
    if (data && !data.error) {
        if (data.clanId) {
            const clan = await fetchData(`/clans/${data.clanId}/info`);
            if (!clan.error) { data.clanName = clan.name; data.clanTag = clan.tag; }
        }
        renderPlayerProfile(data);
    } else {
        playerProfileContainer.innerHTML = '<div style="text-align:center; color:red; padding:20px;">ดึงข้อมูลล้มเหลว</div>';
    }
};

function renderPlayerProfile(data) {
    const stats = data.gameStats || {};
    const roles = data.roleCards || [];
    const total = (stats.totalWinCount||0) + (stats.totalLoseCount||0) + (stats.totalTieCount||0);
    const winRate = total > 0 ? ((stats.totalWinCount/total)*100).toFixed(1) : 0;
    const rawStatus = (data.status || 'OFFLINE').toUpperCase();
    
    let statusBadge = `<span class="status-badge ${rawStatus.toLowerCase()}">${rawStatus}</span>`;
    let clanHtml = data.clanName ? `<span class="clan-tag">[${data.clanTag}] ${data.clanName}</span>` : '';

    const cardsHtml = roles.map(c => `
        <div class="game-card">
            <div class="card-body">
                <div class="card-title">${c.roleId1.toUpperCase()}</div>
                <div class="card-subtitle">${c.rarity}</div>
            </div>
        </div>
    `).join('');

    playerProfileContainer.innerHTML = `
        <div class="profile-header-card">
            <img src="${data.equippedAvatar?.url || ''}" class="profile-avatar-lg">
            <div class="profile-main-info">
                <div class="player-name">${data.username} ${clanHtml}</div>
                <div>${statusBadge}</div>
                <div class="player-bio">"${formatMessage(data.personalMessage)}"</div>
            </div>
        </div>
        <div class="stats-grid-container">
            <div class="stat-box">
                <h4>Games: ${total}</h4>
                <h4>Win Rate: ${winRate}%</h4>
            </div>
        </div>
        <div class="role-cards-wrapper">${cardsHtml}</div>
    `;
}

// **********************************************
// 8. CLAN MANAGER LOGIC
// **********************************************

async function fetchMyClan() {
    stopClanPolling();
    clanContentContainer.innerHTML = '<div class="loading-container">🛡️ Loading My Clan...</div>';
    const authRes = await fetchData('/clans/authorized');
    if (authRes.error || !authRes.length) {
        clanContentContainer.innerHTML = '❌ คุณไม่ได้อยู่ในแคลน';
        return;
    }
    const myClanId = authRes[0].id;
    await fetchClanData(myClanId, true);
    startClanPolling(myClanId, true);
}

async function searchClan() {
    stopClanPolling();
    const name = clanNameInput.value.trim();
    if (!name) return;
    clanContentContainer.innerHTML = '🔍 Searching Clan...';
    const searchRes = await fetchData(`/clans/search?name=${encodeURIComponent(name)}`);
    if (searchRes.error || !searchRes.length) {
        clanContentContainer.innerHTML = '❌ ไม่พบแคลนนี้';
        return;
    }
    await fetchClanData(searchRes[0].id, false);
}

function startClanPolling(clanId, isMyClan) {
    if (clanPollingInterval) clearInterval(clanPollingInterval);
    currentViewingClanId = clanId;
    isCurrentViewMyClan = isMyClan;
    clanPollingInterval = setInterval(() => {
        if (document.visibilityState === 'visible') fetchClanData(clanId, isMyClan, true);
    }, 60000);
}

function stopClanPolling() {
    if (clanPollingInterval) clearInterval(clanPollingInterval);
    clanPollingInterval = null;
}

async function fetchClanData(clanId, isMyClan = false, isBackground = false) {
    if(!isBackground) clanContentContainer.innerHTML = '🛡️ Fetching Clan Data...';
    await Promise.all([fetchAndCacheEmojis(), fetchAndCacheAvatarItems()]);
    
    const info = await fetchData(`/clans/${clanId}/info`);
    const membersRaw = await fetchData(`/clans/${clanId}/members`);
    const quests = await fetchData(`/clans/${clanId}/quests/active`);
    const chat = await fetchData(`/clans/${clanId}/chat`);
    const logs = await fetchData(`/clans/${clanId}/logs`);
    const history = await fetchData(`/clans/${clanId}/quests/history`);
    
    let availableQuests = [], votesData = {};
    if(isMyClan) {
        availableQuests = await fetchData(`/clans/${clanId}/quests/available`);
        votesData = await fetchData(`/clans/${clanId}/quests/votes`);
        if (Array.isArray(availableQuests)) availableQuests.forEach(q => questDetailsCache.set(q.id, q));
        clanVotesCache = votesData;
    }

    renderClanDashboard(info, membersRaw, quests, chat, logs, history, availableQuests, votesData, clanId, isMyClan);
}

function renderClanDashboard(info, members, quests, chat, logs, history, availableQuests, votesData, clanId, canEdit) {
    let mainHtml = `
        <div class="profile-header-card">
            <h2>[${info.tag}] ${info.name}</h2>
            <p>${info.description || ''}</p>
        </div>
        <button onclick="window.viewAllQuests()" class="btn-modal btn-confirm">📚 View All Global Quests</button>
        <div id="clan-members-list" class="member-list">
            ${Array.isArray(members) ? members.map(m => `<div class="member-card">${m.username}</div>`).join('') : ''}
        </div>
    `;
    clanContentContainer.innerHTML = mainHtml;
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayData();
    const k = localStorage.getItem('wolvesville_api_key');
    if(k) apiKeyInput.value = k;

    navLinks.forEach(l => {
        l.addEventListener('click', (e) => {
            navLinks.forEach(n => n.classList.remove('active'));
            l.classList.add('active');
            const t = l.dataset.page;
            pages.forEach(p => p.style.display = p.id === t ? 'block' : 'none');
            if(t==='dashboard') fetchAndDisplayData();
        });
    });

    if(saveApiKeyBtn) saveApiKeyBtn.addEventListener('click', () => {
        const v = apiKeyInput.value.trim();
        if(v.length>10) { localStorage.setItem('wolvesville_api_key',v); fetchAndDisplayData(); }
    });
    if(searchPlayerBtn) searchPlayerBtn.addEventListener('click', window.searchAndDisplayPlayer);
    if(searchClanBtn) searchClanBtn.addEventListener('click', searchClan);
    if(myClanBtn) myClanBtn.addEventListener('click', fetchMyClan);
});

console.log('--- script.js: Loading Finished ---');
