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

// Quest Wiki Cache
let allQuestsCache = []; 

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

// FIXED ICONS (Embedded SVG Base64 for reliability)
// ใช้สำหรับ Gold, Rose และ Gem เพื่อให้มั่นใจว่าแสดงผลได้แน่นอน 100%
const EMBEDDED_ICONS = {
    GOLD: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBmaWxsPSIjRkZENzAwIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAxOGMtNC40MSAwLTgtMy41OS04LThzMy41OS04IDgtOCA4IDMuNTkgOCA4LTMuNTkgOC04IDh6bS4zMS04Ljg2Yy0xLjc3LS40NS0yLjM0LS45NC0yLjM0LTEuNjcgMC0uODQuNzktMS40MyAyLjEtMS40MyAxLjM4IDAgMS45LjY2IDEuOTQgMS42NGgxLjcxYy0uMDUtMS4zNC0uODctMi41Ny0yLjQ5LTIuOTdWNUgxMC45djEuNjljLTEuNTEuMzItMi43MiAxLjMtMi43MiAyLjgxIDAgMS43OSAxLjQ5IDIuNjkgMy42NiAzLjIxIDEuOTUuNDYgMi4zNCAxLjE1IDIuMzQgMS44NyAwIC41My0uMzkgMS4zOS0yLjEgMS4zOS0xLjYgMC0yLjIzLS43Mi0yLjMyLTEuNjRIOC4wNGMuMSAxLjcgMS4zNiAyLjY2IDIuODYgMi45N1YxOWgyLjM0di0xLjY3YzEuNTItLjI5IDIuNzItMS4xNiAyLjczLTIuNzctLjAxLTIuMi0xLjktMi45Ni0zLjY2LTMuNDJ6Ii8+PC9zdmc+",
    ROSE: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBmaWxsPSIjRTkxRTYzIj48cGF0aCBkPSJNMTIgMkM5IDIgNyAzLjUgNyA1LjVjMCAuMy4wNS42LjE1LjktMS45LjMtMy42NSAxLjUtNC42NSAzLjEtLjkgMS40LS45IDMgMCA0LjQgMSAxLjYgMi43NSAyLjggNC42NSAzLjEtLjEuMy0uMTUuNi0uMTUuOSAwIDIgMiAzLjUgNSAzLjVzNS0xLjUgNS0zLjVjMC0uMy0uMDUtLjYtLjE1LS45IDEuOS0uMyAzLjY1LTEuNSA0LjY1LTMuMS45LTEuNC45LTMgMC00LjQtMS0xLjYtMi43NS0yLjgtNC42NS0zLjEuMS0uMy4xNS0uNi4xNS0uOSAwLTItMi0zLjUtNS0zLjV6bTAgMTVjLTEuMyAwLTIuNC0uOC0yLjgtMmg1LjZjLS40IDEuMi0xLjUgMi0yLjggMnptNC0zSDhjLS44IDAtMS41LS4yLTIuMS0uNS43LS43IDEuNS0xLjUgMi4xLTIuNWg4Yy42IDEgMS40IDEuOCAyLjEgMi41LS42LjMtMS4zLjUtMi4xLjV6bS00LTEwYzEuMyAwIDIuNC44IDIuOCAySDkuMmMuNC0xLjIgMS41LTIgMi44LTJ6Ii8+PC9zdmc+",
    GEM: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBmaWxsPSIjOUMyN0IwIj48cGF0aCBkPSJNMTkgM0g1Yy0xLjEgMC0yIC45LTIgMnYxNGMwIDEuMS45IDIgMiAyaDE0YzEuMSAwIDItLjkgMi0yVjVjMC0xLjEtLjktMi0yLTJ6bS02IDE0bC0zLTQuNUw3IDE3VjdsNC41IDMgMy00LjVMMTcgN3YxMGwtNCAweiIvPjwvc3ZnPg==",
    UNKNOWN: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0JEQkRCQyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTEgMTdoLTJ2LTZoMnY2em0wLThoLTJWN2gydjJ6Ii8+PC9zdmc+"
};

// **********************************************
// 2. CUSTOM UI HELPERS
// **********************************************
// Note: Styles are now handled in styles.css

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
    // Add logic for wider modal if isLarge is true
    const style = isLarge ? 'min-width: 80%; max-width: 900px;' : '';
    
    overlay.innerHTML = `
        <div class="modal-content" style="text-align:left; ${style}">
            <h3 style="text-align:center;">${title}</h3>
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

// Helper for navigation
window.goToPlayerSearch = (username) => {
    console.log('Navigating to search for:', username);
    const input = document.getElementById('username-input');
    if(input) {
        input.value = username;
        // Click the nav link to switch tabs
        // [FIXED] Updated selector to match 'player-search' from HTML
        const playerTab = document.querySelector('.nav-link[data-page="player-search"]');
        if (playerTab) {
            playerTab.click();
        } else {
            console.error('Player tab not found! Please check data-page attribute in HTML.');
        }
        
        // Trigger the search function
        // Check if function exists globally or locally
        if (typeof window.searchAndDisplayPlayer === 'function') {
            window.searchAndDisplayPlayer();
        } else {
            console.warn('searchAndDisplayPlayer function not found globally, trying local scope...');
            // Fallback: This might fail if called from a pure string onclick context depending on scope
            try {
                searchAndDisplayPlayer();
            } catch (e) {
                console.error('Could not execute search:', e);
            }
        }
    }
};

// Helper to escape strings for JS arguments in HTML
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
    } else {
        console.error('[Emojis] Failed to fetch:', res);
    }
}

// NEW: Fetch Avatar Items from API
async function fetchAndCacheAvatarItems() {
    if (avatarItemsCache.size > 0) return;
    
    console.log('[Items] Fetching avatar items list...');
    // This fetches the list of all avatar items to map ID to Image URL
    const res = await fetchData('/items/avatarItems', false, false);
    
    if (!res.error && Array.isArray(res)) {
        res.forEach(item => {
            // Store item details in cache
            avatarItemsCache.set(item.id, item);
        });
        console.log(`[Items] Cached ${avatarItemsCache.size} avatar items.`);
    } else {
        console.error('[Items] Failed to fetch avatar items:', res);
    }
}

// NEW: Show Member Details Modal
function showMemberModal(data) {
    // Determine Avatar URL
    let avatarUrl = 'https://via.placeholder.com/150';
    if(data.equippedAvatar?.url) avatarUrl = data.equippedAvatar.url;
    else if(data.profileIconId) avatarUrl = `https://cdn-avatars.wolvesville.com/${data.profileIconId}`;

    const creationDate = formatDateThai(data.creationTime);
    const lastOnline = formatDateThai(data.lastOnline);
    
    // Donation Stats (Handle structure from API)
    const don = data.donated || {};
    // Activity Stats
    const xpDur = data.xpDurations || {};
    
    // Status Badge
    let statusClass = 'offline';
    let statusLabel = data.status || 'UNKNOWN';
    if(data.playerStatus === 'ONLINE' || data.status === 'ONLINE') { statusClass = 'online'; statusLabel = 'ONLINE'; }
    else if(data.playerStatus === 'PLAY' || data.status === 'PLAY') { statusClass = 'play'; statusLabel = 'PLAYING'; }
    
    // Join Message
    const joinMsg = data.joinMessage ? `<div style="background:#f1f5f9; padding:10px; border-radius:8px; margin-top:10px; font-style:italic; color:#475569; font-size:0.9rem; border-left: 3px solid #cbd5e1;">"${data.joinMessage}"</div>` : '';

    // Helper for formatting numbers
    const fmt = (n) => (n || 0).toLocaleString();

    // Escape username for onclick
    const safeUsername = escapeJsString(data.username);

    const content = `
        <div style="display:flex; flex-direction:column; align-items:center; margin-bottom:20px;">
            <img src="${avatarUrl}" referrerpolicy="no-referrer" style="width:100px; height:100px; border-radius:25%; border:4px solid #e2e8f0; margin-bottom:10px; background:#f1f5f9; object-fit:contain;">
            <!-- Clickable Name to Search -->
            <h2 style="margin:0; font-size:1.5rem; color:#1e293b; cursor:pointer; text-decoration:underline;" 
                onclick="document.querySelectorAll('.modal-overlay').forEach(el => el.remove()); window.goToPlayerSearch('${safeUsername}')"
                title="คลิกเพื่อดูประวัติผู้เล่นแบบเต็ม">
                ${data.username}
            </h2>
            <div style="color:#64748b; font-size:0.9rem;">${data.flair ? `"${data.flair}"` : '-'}</div>
            <div style="margin-top:5px;">
                <span class="status-badge ${statusClass}" style="font-size:0.7rem; padding:2px 8px;">${statusLabel}</span>
                <span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:12px; font-size:0.7rem; font-weight:bold;">LVL ${data.level || 0}</span>
                ${data.isCoLeader ? '<span style="background:#e0f2fe; color:#075985; padding:2px 8px; border-radius:12px; font-size:0.7rem; font-weight:bold;">CO-LEADER</span>' : ''}
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
            
            <!-- Week -->
            <div style="color:#64748b;">Week</div>
            <div style="color:#d97706;">${fmt(don.gold?.week)}</div>
            <div style="color:#9333ea;">${fmt(don.gems?.week)}</div>

            <!-- Month -->
            <div style="color:#64748b;">Month</div>
            <div style="color:#d97706;">${fmt(don.gold?.month)}</div>
            <div style="color:#9333ea;">${fmt(don.gems?.month)}</div>

            <!-- All Time -->
            <div style="color:#64748b;">All Time</div>
            <div style="color:#d97706; font-weight:bold;">${fmt(don.gold?.allTime)}</div>
            <div style="color:#9333ea; font-weight:bold;">${fmt(don.gems?.allTime)}</div>
        </div>

        <h4 style="margin:15px 0 10px 0; color:#334155; border-bottom:1px solid #eee; padding-bottom:5px;">⚔️ Activity</h4>
        <div style="background:#f0fdf4; padding:15px; border-radius:8px; border:1px solid #bbf7d0;">
             <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                 <div>
                    <div style="color:#166534; font-size:0.75rem; margin-bottom:2px;">XP (Week)</div>
                    <div style="font-weight:bold; font-size:1rem;">${fmt(xpDur.week)}</div>
                 </div>
                 <div>
                    <div style="color:#166534; font-size:0.75rem; margin-bottom:2px;">XP (Month)</div>
                    <div style="font-weight:bold; font-size:1rem;">${fmt(xpDur.month)}</div>
                 </div>
                 
                 <!-- NEW: XP Lifetime -->
                 <div style="grid-column: span 2; text-align: center; background: rgba(255,255,255,0.5); border-radius: 6px; padding: 5px;">
                    <div style="color:#15803d; font-size:0.75rem; margin-bottom:2px; font-weight:bold;">✨ XP (All Time)</div>
                    <div style="font-weight:bold; font-size:1.1rem; color:#15803d;">${fmt(data.xp)}</div>
                 </div>

                 <div>
                    <div style="color:#166534; font-size:0.75rem; margin-bottom:2px;">Gold Quests</div>
                    <div style="font-weight:bold; font-size:1rem;">${fmt(data.goldQuests)}</div>
                 </div>
                 <div>
                    <div style="color:#166534; font-size:0.75rem; margin-bottom:2px;">Gem Quests</div>
                    <div style="font-weight:bold; font-size:1rem;">${fmt(data.gemQuests)}</div>
                 </div>
             </div>
        </div>

        <div style="margin-top:15px; font-size:0.75rem; color:#94a3b8; text-align:center;">
            Player ID: <span style="font-family:monospace;">${data.playerId || data.id}</span>
        </div>
    `;
    
    showCustomInfoModal(data.username || 'Member Details', content);
}

// NEW: Function to View All Clan Quests (Wiki)
window.viewAllQuests = async () => {
    showCustomInfoModal('Loading...', '<div style="text-align:center; padding:30px;"><div class="quest-inline-icon loading" style="font-size:40px;">sync</div><br>Fetching all quests...</div>');
    
    try {
        const res = await fetchData('/clans/quests/all');
        
        if (res.error) {
             document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
             showCustomAlert('Error', 'Failed to fetch all quests: ' + (res.message || 'Unknown error'));
             return;
        }

        // Generate HTML for All Quests Grid
        let html = '<div style="max-height: 70vh; overflow-y: auto; padding-right:5px;">';
        html += '<p style="color:#64748b; font-size:0.9rem; margin-bottom:15px;">List of all existing clan quests in the game.</p>';
        html += '<div class="quest-grid" style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px;">';
        
        if (Array.isArray(res)) {
            html += res.map(q => {
                const isGem = q.purchasableWithGems;
                let costLabel = isGem ? '<span style="color:#9333ea">💎 Gem Quest</span>' : '<span style="color:#d97706">💰 Gold Quest</span>';
                
                // Construct Image URL with Fallback
                const imgUrl = q.promoImageUrl || 'https://via.placeholder.com/200';
                
                // Render Rewards Mini
                let rewardsMini = '';
                if(q.rewards && q.rewards.length > 0) {
                   rewardsMini = `<div style="font-size:0.7rem; color:#64748b; margin-top:5px;">${q.rewards.length} Rewards</div>`; 
                }

                return `
                    <div class="quest-card-large" style="min-height: 160px; cursor: default;">
                          <img src="${imgUrl}" referrerpolicy="no-referrer" class="quest-card-large-img" style="height: 100px;">
                          <div class="quest-card-overlay" style="background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);">
                            <div style="padding: 5px;">
                                 <div style="font-size:0.8rem; font-weight:bold; color:white; text-shadow:0 1px 2px black;">${costLabel}</div>
                                 ${rewardsMini}
                            </div>
                          </div>
                    </div>
                `;
            }).join('');
        }
        
        html += '</div></div>';
        
        // Remove loading modal
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        // Show new large modal
        showCustomInfoModal('📚 All Clan Quests Wiki', html, true);

    } catch(e) {
        console.error(e);
        showCustomAlert('Error', 'Error fetching quests');
    }
};

// NEW: Function to Show Quest Details Modal
window.showQuestModal = (questId) => {
    const quest = questDetailsCache.get(questId);
    if (!quest) return showCustomAlert('Error', 'Quest details not found.');

    const title = quest.title || 'Clan Quest';
    const imageUrl = quest.promoImageUrl || 'https://via.placeholder.com/200';
    
    // Rewards - Updated Layout to Grid based on columns (calculating for 2 rows)
    let rewardsHtml = '<p style="color:#64748b; font-style:italic;">No specific rewards</p>';
    if (quest.rewards && quest.rewards.length > 0) {
        const rewardsList = quest.rewards.map((r, idx) => {
            let imgUrl = 'https://via.placeholder.com/60?text=?';
            let label = r.type.replace(/_/g, ' ');
            let subLabel = `x${r.amount}`;

            // Add onerror fallback
            const fallback = `this.onerror=null;this.src='${EMBEDDED_ICONS.UNKNOWN}';`;

            if (r.type === 'AVATAR_ITEM') {
                const itemId = r.avatarItemId;
                // Use Cached Item or Default Construction
                imgUrl = `https://cdn.wolvesville.com/avatarItems/png/256x/${itemId}.png`; 
                const cachedItem = avatarItemsCache.get(itemId);
                if (cachedItem && cachedItem.imageUrl) {
                    imgUrl = cachedItem.imageUrl; // Use API imageUrl if available
                }
                label = 'Avatar Item';
                if (r.amount <= 1) subLabel = '';
            } else if (r.type === 'GOLD') {
                imgUrl = EMBEDDED_ICONS.GOLD;
            } else if (r.type === 'GEM' || r.type === 'GEMS') {
                imgUrl = EMBEDDED_ICONS.GEM; // Use Embedded GEM
            } else if (r.type === 'ROSE' || r.type === 'ROSES') {
                imgUrl = EMBEDDED_ICONS.ROSE;
            }

            // Card Style for Grid - Image Centered, No Label Text
            return `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; background:#fff; padding:10px; border-radius:12px; border:1px solid #e2e8f0; position:relative; box-shadow: 0 1px 2px rgba(0,0,0,0.05); min-height:80px;" title="${label}">
                    <div style="position:absolute; top:0; right:0; background:#64748b; color:white; font-size:0.65rem; padding:2px 6px; border-bottom-left-radius:8px; font-weight:bold;">T${idx+1}</div>
                    <img src="${imgUrl}" referrerpolicy="no-referrer" onerror="${fallback}" style="width:48px; height:48px; object-fit:contain; margin-top:5px;">
                    ${subLabel ? `<div style="font-size:0.75rem; font-weight:bold; color:#475569; margin-top:5px;">${subLabel}</div>` : ''}
                </div>
            `;
        }).join('');

        // Grid Layout: Determine columns to fit into 2 rows
        const colCount = Math.max(1, Math.ceil(quest.rewards.length / 2));
        
        rewardsHtml = `<div style="display:grid; grid-template-columns:repeat(${colCount}, 1fr); gap:8px; margin-top:5px;">${rewardsList}</div>`;
    }

    // Votes
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

    // Quest Modal Content - Show just image at top
    const content = `
        <img src="${imageUrl}" referrerpolicy="no-referrer" style="width:100%; border-radius:8px; margin-bottom:15px; border:1px solid #e2e8f0; display:block;">
        <h4 style="margin-bottom:10px; color:#334155;">🎁 Rewards</h4>
        ${rewardsHtml}
        <h4 style="margin:15px 0 10px 0; color:#334155;">🗳️ Votes (${(clanVotesCache.votes?.[questId] || []).length})</h4>
        ${votesHtml}
    `;

    showCustomInfoModal(title, content);
};

window.sendClanAnnouncement = async (clanId) => {
    const input = document.getElementById('clan-announcement-input');
    if (!input) return;
    
    const msg = input.value.trim();
    if (!msg) return;

    try {
        console.log(`[Announcement] Sending to clan ${clanId}:`, msg);
        input.disabled = true;
        
        const res = await sendPayload(`/clans/${clanId}/announcements`, 'POST', { message: msg });
        
        input.disabled = false;
        
        if (res.error) {
            let errorMsg = res.message || 'Unknown error';
            if(res.status === 429) errorMsg = 'Too many requests. Please wait a moment.';
            showCustomAlert('Error', '❌ Failed to post announcement: ' + errorMsg);
        } else {
            input.value = ''; // Clear input
            showCustomAlert('Success', '✅ Announcement posted successfully!');
            fetchClanData(clanId, true, true); 
        }
    } catch (e) {
        console.error('[Announcement] Error:', e);
        showCustomAlert('Error', '❌ Error: ' + e.message);
        if(input) input.disabled = false;
    }
};

window.sendClanChatMessage = async (clanId) => {
    const input = document.getElementById('clan-chat-input');
    if (!input) return;
    
    const msg = input.value.trim();
    if (!msg) return;

    try {
        console.log(`[Chat] Sending message to clan ${clanId}:`, msg);
        input.disabled = true;
        
        const res = await sendPayload(`/clans/${clanId}/chat`, 'POST', { message: msg });
        
        input.disabled = false;
        
        if (res.error) {
            let errorMsg = res.message || 'Unknown error';
            if(res.status === 429) errorMsg = 'Too many requests. Please wait a moment.';
            showCustomAlert('Error', '❌ Failed to send message: ' + errorMsg);
        } else {
            input.value = ''; // Clear input
            input.focus();
            fetchClanData(clanId, true, true);
        }
    } catch (e) {
        console.error('[Chat] Error:', e);
        showCustomAlert('Error', '❌ Error: ' + e.message);
        if(input) input.disabled = false;
    }
};

window.blockMemberFromList = async (clanId, playerId, username) => {
    const confirmed = await showCustomConfirm(
        'Block Member',
        `⚠️ Are you sure you want to <strong>BLOCK</strong> <span style="color:#ef4444; font-weight:bold;">${username}</span> from the clan?<br><br>They will be removed and added to the blocklist.`,
        true 
    );

    if (!confirmed) return;

    try {
        console.log(`[BlockMember] Blocking ${username} (${playerId})...`);
        const res = await sendPayload(`/clans/${clanId}/members/${playerId}/block`, 'POST', {});
        
        if (res.error) {
             showCustomAlert('Block Failed', '❌ ' + (res.message || 'Unknown error'));
        } else {
            showCustomAlert('Success', `✅ Member <strong>${username}</strong> blocked.`);
            fetchClanData(clanId, true, true); 
        }
    } catch (e) {
        console.error('[BlockMember] Error:', e);
        showCustomAlert('Error', '❌ Critical Error: ' + e.message);
    }
};

window.unblockMember = async (clanId, playerId) => {
    try {
        console.log(`[UnblockMember] Unblocking ${playerId}...`);
        const res = await sendPayload(`/clans/${clanId}/members/${playerId}/unblock`, 'POST', {});
        
        if (res.error) {
             showCustomAlert('Unblock Failed', '❌ ' + (res.message || 'Unknown error'));
        } else {
            console.log('Unblocked successfully');
            fetchClanData(clanId, true, true); 
        }
    } catch (e) {
        console.error('[UnblockMember] Error:', e);
        showCustomAlert('Error', '❌ Critical Error: ' + e.message);
    }
};

window.manualAddToBlocklist = async (clanId) => {
    const playerId = document.getElementById('manual-block-input').value.trim();
    if (!playerId) return alert('Please enter a Player ID');
    if (!isUUID(playerId)) return alert('Invalid Player ID format (UUID required)');

    try {
        const res = await sendPayload(`/clans/${clanId}/members/${playerId}/block`, 'POST', {});
        if (res.error) {
            showCustomAlert('Error', '❌ Failed: ' + (res.message || 'Unknown error'));
        } else {
            showCustomAlert('Success', `✅ ID ${playerId} added to blocklist.`);
            document.getElementById('manual-block-input').value = '';
            fetchClanData(clanId, true, true);
        }
    } catch (e) {
        showCustomAlert('Error', e.message);
    }
};

window.kickMemberFromList = async (clanId, playerId, username) => {
    const confirmed = await showCustomConfirm(
        'Kick Member',
        `⚠️ Are you sure you want to <strong>KICK</strong> member <span style="color:#ef4444; font-weight:bold;">${username}</span>?<br><br>This action cannot be undone.`,
        true 
    );

    if (!confirmed) return;

    try {
        console.log(`[KickMember] Kicking ${username} (${playerId})...`);
        const res = await sendPayload(`/clans/${clanId}/members/${playerId}/kick`, 'POST', {});
        
        if (res.error) {
             let errMsg = res.message || 'Unknown error';
             if (res.status === 403) errMsg = 'Forbidden: You do not have permission to kick this member.';
             showCustomAlert('Kick Failed', '❌ ' + errMsg);
        } else {
            showCustomAlert('Success', `✅ Member <strong>${username}</strong> has been kicked.`);
            fetchClanData(clanId, true, true);
        }
    } catch (e) {
        console.error('[KickMember] Error:', e);
        showCustomAlert('Error', '❌ Critical Error: ' + e.message);
    }
};

window.toggleQuestFromList = async (clanId, playerId, currentStatus, btnElement) => {
    const newStatus = !currentStatus;
    const originalIcon = btnElement.innerText;
    const originalClass = btnElement.className;
    
    // UI Feedback (Spinning)
    btnElement.innerText = 'sync';
    btnElement.className = 'material-icons quest-inline-icon loading';
    btnElement.style.pointerEvents = 'none'; 
    
    const res = await sendPayload(`/clans/${clanId}/members/${playerId}/participateInQuests`, 'PUT', { participateInQuests: newStatus });
    
    if (res.error) {
        btnElement.innerText = originalIcon;
        btnElement.className = originalClass;
        btnElement.style.pointerEvents = 'auto';
        showCustomAlert('Error', '❌ Failed: ' + (res.message || 'Unknown error'));
    } else {
        // Success: Update Icon state
        btnElement.innerText = newStatus ? 'check_circle' : 'cancel';
        btnElement.className = `material-icons quest-inline-icon clickable ${newStatus ? 'on' : 'off'}`;
        btnElement.style.pointerEvents = 'auto';
        btnElement.setAttribute('onclick', `event.stopPropagation(); window.toggleQuestFromList('${clanId}', '${playerId}', ${newStatus}, this)`);

        // NEW: Update Price Animation on Client Side (Without Reload)
        const change = newStatus ? 1 : -1;
        currentParticipatingCount += change;
        if(currentParticipatingCount < 0) currentParticipatingCount = 0;
        
        // Trigger Animation
        updatePricesClientSide();
    }
};

// NEW: Helper to animate number change
function animateValue(obj, start, end, duration) {
    if (start === end) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Add comma separators
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// NEW: Update Price Displays
function updatePricesClientSide() {
    const n = currentParticipatingCount;
    
    // Update Active Quest Action Prices
    // Cost: 300 + 30 * members
    const actionCost = 300 + (30 * n);
    document.querySelectorAll('.dynamic-action-price').forEach(el => {
        const currentVal = parseInt(el.innerText.replace(/,/g, '')) || 0;
        animateValue(el, currentVal, actionCost, 500);
    });

    // Update Available Quest Buy Prices
    document.querySelectorAll('.dynamic-buy-price').forEach(el => {
        const isGem = el.dataset.currency === 'gem';
        // Gold: 2000 + 400 * members, Gem: 350 + 135 * members
        const cost = isGem ? (350 + 135 * n) : (2000 + 400 * n);
        const currentVal = parseInt(el.innerText.replace(/,/g, '')) || 0;
        animateValue(el, currentVal, cost, 500);
    });
}

window.editFlairFromList = async (clanId, playerId, currentFlair) => {
    const newFlair = await showCustomPrompt('Edit Flair', 'Enter new flair (nickname) for this member:', currentFlair);
    if (newFlair === null) return; 

    try {
        const res = await sendPayload(`/clans/${clanId}/members/${playerId}/flair`, 'PUT', { flair: newFlair });
        
        if (res.error) {
            let errMsg = res.message || 'Unknown error';
            if (res.status === 403) errMsg = 'Forbidden: You do not have permission.';
            else if (res.status === 404) errMsg = 'Member not found.';
            showCustomAlert('Error', '❌ Failed to update flair:\n' + errMsg);
        } else {
            showCustomAlert('Success', '✅ Flair Updated Successfully!');
            fetchClanData(clanId, true, true);
        }
    } catch (e) {
        console.error('[EditFlair] Critical Error:', e);
        showCustomAlert('Error', '❌ Critical Error: ' + e.message);
    }
};

window.toggleAllQuestParticipation = async (clanId, isParticipating) => {
    const action = isParticipating ? 'ENABLE' : 'DISABLE';
    const confirmed = await showCustomConfirm(
        'Confirm Action', 
        `⚠️ Are you sure you want to <strong>${action}</strong> quest participation for <strong>ALL</strong> members?`, 
        !isParticipating 
    );
    
    if(!confirmed) return;

    try {
        const res = await sendPayload(`/clans/${clanId}/members/all/participateInQuests`, 'PUT', { participateInQuests: isParticipating });
        
        if (res.error) {
            showCustomAlert('Failed', '❌ Failed: ' + (res.message || 'Unknown error'));
        } else {
            showCustomAlert('Success', `✅ Successfully <strong>${action}D</strong> participation for everyone!`);
            setTimeout(() => { fetchClanData(clanId, true, true); }, 1000); 
        }
    } catch (e) {
        showCustomAlert('Error', '❌ Error: ' + e.message);
    }
};

window.shuffleClanQuests = async (clanId) => {
    const confirmed = await showCustomConfirm(
        'Shuffle Quests',
        '⚠️ <strong>Cost: 500 Gold</strong><br>Are you sure you want to shuffle the available quests?',
        false 
    );

    if (!confirmed) return;

    try {
        console.log(`[Shuffle] Shuffling quests for clan ${clanId}...`);
        const res = await sendPayload(`/clans/${clanId}/quests/available/shuffle`, 'POST', {});

        if (res.error) {
            let errorMsg = res.message || 'Unknown error';
            showCustomAlert('Shuffle Failed', '❌ ' + errorMsg);
        } else {
            showCustomAlert('Success', '✅ Quests shuffled successfully!');
            fetchClanData(clanId, true, true); 
        }
    } catch (e) {
        console.error('[Shuffle] Error:', e);
        showCustomAlert('Error', '❌ Error: ' + e.message);
    }
};

window.skipQuestWaitingTime = async (clanId) => {
    const confirmed = await showCustomConfirm('Skip Wait Time', '⚠️ ต้องการใช้ Gold/Gems เพื่อข้ามเวลาการรอหรือไม่?', false);
    if (!confirmed) return;

    try {
        const res = await sendPayload(`/clans/${clanId}/quests/active/skipWaitingTime`, 'POST', {});
        if (res.error) {
            showCustomAlert('Error', '❌ Failed: ' + (res.message || 'Unknown error'));
        } else {
            showCustomAlert('Success', '✅ Skipped waiting time!');
            fetchClanData(clanId, true, true);
        }
    } catch(e) {
        showCustomAlert('Error', e.message);
    }
};

window.claimQuestExtraTime = async (clanId) => {
    const confirmed = await showCustomConfirm('Add Time', '⚠️ ต้องการใช้ Gold/Gems เพื่อเพิ่มเวลาทำเควสหรือไม่? (ทำได้ครั้งเดียวต่อขั้น)', false);
    if (!confirmed) return;

    try {
        const res = await sendPayload(`/clans/${clanId}/quests/active/claimTime`, 'POST', {});
        if (res.error) {
            showCustomAlert('Error', '❌ Failed: ' + (res.message || 'Unknown error'));
        } else {
            showCustomAlert('Success', '✅ Added extra time!');
            fetchClanData(clanId, true, true);
        }
    } catch(e) {
        showCustomAlert('Error', e.message);
    }
};

window.cancelActiveQuest = async (clanId) => {
    const confirmed = await showCustomConfirm('Cancel Quest', '⚠️ ยืนยันที่จะยกเลิกเควสปัจจุบันหรือไม่? (ได้คืนค่าใช้จ่ายบางส่วน)', true);
    if (!confirmed) return;

    try {
        const res = await sendPayload(`/clans/${clanId}/quests/active/cancel`, 'POST', {});
        if (res.error) {
            showCustomAlert('Error', '❌ Failed: ' + (res.message || 'Unknown error'));
        } else {
            showCustomAlert('Success', '✅ Quest cancelled!');
            fetchClanData(clanId, true, true);
        }
    } catch(e) {
        showCustomAlert('Error', e.message);
    }
};

window.claimClanQuest = async (clanId, questId, questTitle) => {
    const confirmed = await showCustomConfirm(
        'Buy Quest',
        `⚠️ ต้องการซื้อเควส <strong>${questTitle}</strong> หรือไม่?<br>การกระทำนี้จะใช้ Gold/Gems ของแคลน!`,
        false 
    );

    if (!confirmed) return;

    try {
        console.log(`[ClaimQuest] Claiming quest ${questId} for clan ${clanId}...`);
        const res = await sendPayload(`/clans/${clanId}/quests/claim`, 'POST', { questId: questId });

        if (res.error) {
            let errorMsg = res.message || 'Unknown error';
            showCustomAlert('Claim Failed', '❌ ' + errorMsg);
        } else {
            showCustomAlert('Success', '✅ ซื้อเควสสำเร็จ!');
            setTimeout(() => {
                fetchClanData(clanId, true, true); 
            }, 3000);
        }
    } catch (e) {
        console.error('[ClaimQuest] Error:', e);
        showCustomAlert('Error', '❌ Error: ' + e.message);
    }
};

// [UPDATED] FETCH MEMBER DETAILS (CLICK HANDLER)
async function fetchMemberDetails(clanId, playerId, canEdit) {
    if (!playerId) return;

    // Check Cache first to see if we already have detailed info (e.g. from fetchClanData)
    let memberData = clanMembersDetailedMap.get(playerId) || {};
    // If we have 'donated' field, it means we have detailed info.
    const hasDetailedInfo = memberData.donated !== undefined;

    if (!hasDetailedInfo) {
        // Show initial loading modal if we don't have detailed info yet
        showCustomInfoModal(
            'Loading Member...', 
            '<div style="text-align:center; padding:20px;"><div class="quest-inline-icon loading" style="font-size:40px;">sync</div><br>Fetching details...</div>'
        );
        
        try {
            // Parallel Fetch: Detailed list (to find one) + specific player (for avatar/status)
            // Note: API doesn't support fetching one detailed member, so we fetch list or assume we are bot.
            const [detailedRes, playerRes] = await Promise.all([
                fetchData(`/clans/${clanId}/members/detailed`),
                fetchData(`/players/${playerId}`)
            ]);

            // If detailed list works, find the member
            if (!detailedRes.error && Array.isArray(detailedRes)) {
                const found = detailedRes.find(m => m.playerId === playerId);
                if (found) memberData = found;
            }

            // Merge with player profile (playerRes usually has equippedAvatar if detailedRes doesn't)
            if (!playerRes.error) {
                memberData = { ...playerRes, ...memberData };
            }

            // Close loading modal (remove last overlay)
            const overlays = document.querySelectorAll('.modal-overlay');
            if (overlays.length > 0) overlays[overlays.length - 1].remove();
        } catch (e) {
             console.error('[MemberDetails] Error:', e);
             showCustomAlert('Error', 'Failed to load member details.');
             return;
        }
    } else {
        // We have detailed info, but let's do a quick fetch of player profile to ensure online status/avatar is fresh
        // without blocking the UI
        try {
             const playerRes = await fetchData(`/players/${playerId}`);
             if (!playerRes.error) {
                 memberData = { ...memberData, ...playerRes };
             }
        } catch(e) { console.error('Background player fetch failed', e); }
    }
    
    // Show actual data
    showMemberModal(memberData);
}

// **********************************************
// 9. QUEST WIKI LOGIC (GET /clans/quests/all)
// **********************************************

// ฟังก์ชันหลักสำหรับโหลดข้อมูล Quest Wiki
async function initQuestWiki() {
    const container = document.getElementById('quest-wiki-container');
    const searchInput = document.getElementById('quest-search-input');
    
    // ถ้าเคยโหลดมาแล้ว ไม่ต้องโหลดซ้ำ (ประหยัด API call)
    if (allQuestsCache.length > 0) {
        renderWikiGrid(allQuestsCache);
        return;
    }

    container.innerHTML = `
        <div style="text-align:center; grid-column:1/-1; padding:40px;">
            <div class="quest-inline-icon loading" style="font-size:40px;">sync</div>
            <br>กำลังดึงข้อมูลเควสและไอเทม...
        </div>
    `;

    try {
        // [UPDATED] เรียกใช้ API พร้อมกันทั้ง 2 ตัว: Quests และ Avatar Items (รอให้เสร็จทั้งคู่ก่อนแสดงผล)
        // นี่คือจุดสำคัญที่จะทำให้รูปไอเทมแสดงผลถูกต้อง เพราะ Cache จะถูกสร้างเสร็จก่อน
        const [res, _] = await Promise.all([
            fetchData('/clans/quests/all'),
            fetchAndCacheAvatarItems() 
        ]);

        if (res.error) {
            container.innerHTML = `<div style="text-align:center; color:red; grid-column:1/-1;">Error: ${res.message}</div>`;
            return;
        }

        if (Array.isArray(res)) {
            allQuestsCache = res; // เก็บลง Cache
            renderWikiGrid(allQuestsCache); // สั่งแสดงผล

            // เพิ่ม Event Listener สำหรับช่องค้นหา
            if (searchInput) {
                searchInput.addEventListener('keyup', (e) => {
                    const term = e.target.value.toLowerCase();
                    const filtered = allQuestsCache.filter(q => 
                        (q.title && q.title.toLowerCase().includes(term)) || 
                        (q.name && q.name.toLowerCase().includes(term)) // บางที API อาจส่ง name แทน title
                    );
                    renderWikiGrid(filtered);
                });
            }
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = `<div style="text-align:center; color:red; grid-column:1/-1;">Critical Error loading Wiki</div>`;
    }
}

// ฟังก์ชันสำหรับสร้าง HTML Grid ของเควส
function renderWikiGrid(quests) {
    const container = document.getElementById('quest-wiki-container');
    
    if (!quests || quests.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#888; grid-column:1/-1; padding:20px;">ไม่พบเควสที่ค้นหา</div>`;
        return;
    }

    const html = quests.map(q => {
        // ตรวจสอบว่าเป็นเควส Gem หรือ Gold
        const isGem = q.purchasableWithGems;
        const currencyIcon = isGem ? 'diamond' : 'monetization_on';
        const currencyColor = isGem ? '#d8b4fe' : '#fcd34d'; // ม่วง หรือ เหลือง
        
        // ใช้ promoImagePrimaryColor เป็นสีขอบ (ถ้ามี)
        const borderColor = q.promoImagePrimaryColor || '#e2e8f0';
        
        // รูปภาพ
        const imgUrl = q.promoImageUrl || 'https://via.placeholder.com/300x150?text=No+Image';

        // นับจำนวนของรางวัล
        const rewardCount = q.rewards ? q.rewards.length : 0;

        return `
            <div class="quest-card-large" onclick="window.showQuestModal('${q.id}')" style="border-color:${borderColor};">
                <img src="${imgUrl}" class="quest-card-large-img" loading="lazy">
                <div class="quest-card-overlay">
                    <div>
                        <div class="quest-price-tag" style="color: ${currencyColor};">
                            <span class="material-icons" style="font-size:16px;">${currencyIcon}</span>
                            <span style="margin-left:4px;">${isGem ? 'Gem Quest' : 'Gold Quest'}</span>
                        </div>
                    </div>
                    <div style="font-size:0.8rem; font-weight:bold; background:rgba(0,0,0,0.6); padding:4px 8px; border-radius:6px; backdrop-filter:blur(4px);">
                        ${rewardCount} Rewards
                    </div>
                </div>
                <!-- Pre-cache details for modal -->
                ${(() => { questDetailsCache.set(q.id, q); return ''; })()} 
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    sendIncrementSignal('visitors');
    fetchAndDisplayData();

    const k = localStorage.getItem('wolvesville_api_key');
    if(k) { apiKeyInput.value = k; if(apiKeyStatus) apiKeyStatus.innerHTML = '✅ Saved'; }

    navLinks.forEach(l => {
        l.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(n => n.classList.remove('active'));
            l.classList.add('active');
            const t = l.dataset.page;
            pages.forEach(p => {
                p.style.display = p.id === t ? 'block' : 'none';
                if(p.id === t) p.classList.add('active-page');
            });
            if(window.innerWidth<=768) {
                appContainer.classList.remove('sidebar-pushed');
                if(hamburgerBtn) hamburgerBtn.querySelector('.material-icons').textContent = 'menu';
            }
            if(t==='dashboard') fetchAndDisplayData();
            else if(t==='quest-wiki') initQuestWiki(); // <--- เรียกฟังก์ชันเมื่อกดแท็บ Wiki
            else if(t==='settings') {
                const cur = localStorage.getItem('wolvesville_api_key');
                if(cur) apiKeyInput.value = cur;
            }
        });
    });

    if(hamburgerBtn) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            appContainer.classList.toggle('sidebar-pushed');
            hamburgerBtn.querySelector('.material-icons').textContent = appContainer.classList.contains('sidebar-pushed') ? 'menu_open' : 'menu';
        });
        document.addEventListener('click', (e) => {
            if(window.innerWidth<=768 && appContainer.classList.contains('sidebar-pushed') && !e.target.closest('.sidebar') && !e.target.closest('.hamburger-btn')) {
                appContainer.classList.remove('sidebar-pushed');
                hamburgerBtn.querySelector('.material-icons').textContent = 'menu';
            }
        });
    }

    if(saveApiKeyBtn) saveApiKeyBtn.addEventListener('click', () => {
        const v = apiKeyInput.value.trim();
        if(v.length>10) { localStorage.setItem('wolvesville_api_key',v); alert('Saved!'); fetchAndDisplayData(); }
        else alert('Key too short');
    });
    if(searchPlayerBtn) searchPlayerBtn.addEventListener('click', searchAndDisplayPlayer);
    if(usernameInput) usernameInput.addEventListener('keydown', (e) => { if(e.key==='Enter') searchAndDisplayPlayer(); });

    if(searchClanBtn) searchClanBtn.addEventListener('click', searchClan);
    if(myClanBtn) myClanBtn.addEventListener('click', fetchMyClan);
    if(clanNameInput) clanNameInput.addEventListener('keydown', (e) => { if(e.key==='Enter') searchClan(); });

    document.querySelector('.nav-link[data-page="dashboard"]')?.click();
});

console.log('--- script.js: Loading Finished ---');
