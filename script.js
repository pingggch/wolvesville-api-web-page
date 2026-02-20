// **********************************************
// 1. CONFIGURATION & GLOBALS
// **********************************************
console.log('--- script.js: Loading Started ---'); 

const localServerUrl = window.location.origin; 

// Global Caches
let itemDataCache = null; 
let isFetchingItems = false; 
let globalEmojiMap = new Map(); 
let avatarItemsCache = new Map(); 
let playerAvatarCache = new Map(); 
let clanMembersDetailedMap = new Map(); 
let questDetailsCache = new Map(); 
let clanVotesCache = {}; 
let clanMembersCache = {}; 
let allQuestsCache = []; 

// New Roles Caches
let rolesCache = new Map();
let advancedRolesMappingCache = {};
let randomRolesMappingCache = {};
let rankedRandomExcludedRolesCache = [];

// Polling & State
let clanPollingInterval = null;
let currentViewingClanId = null;
let isCurrentViewMyClan = false;
let isFirstRender = true; 
let currentParticipatingCount = 0; 

// Inject Lottie Player Script
const lottieScript = document.createElement('script');
lottieScript.src = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";
document.head.appendChild(lottieScript);

// FIXED ICONS
const EMBEDDED_ICONS = {
    GOLD: "https://static.wikia.nocookie.net/werewolf-online/images/6/6d/Coin.png/revision/latest/scale-to-width-down/20?cb=20190630074706",
    ROSE: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdApY9XQWX18BrmYNYj1ifzw1lrcOrzizAgQ&s",
    GEM: "https://static.wikia.nocookie.net/werewolf-online/images/3/37/400_gems.png/revision/latest?cb=20200518070137",
    UNKNOWN: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0JEQkRCQyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTEgMTdoLTJ2LTZoMnY2em0wLThoLTJWN2gydjJ6Ii8+PC9zdmc+"
};

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
                    <button class="btn-modal btn-cancel">ยกเลิก</button>
                    <button class="btn-modal action-confirm ${isDangerous ? 'btn-danger' : 'btn-confirm'}">ยืนยัน</button>
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
    const style = isLarge ? 'min-width: 80%; max-width: 900px;' : '';
    
    overlay.innerHTML = `
        <div class="modal-content" style="text-align:left; ${style}">
            <h3 style="text-align:center;">${title}</h3>
            <div>${contentHtml}</div>
            <div class="custom-modal-buttons">
                <button class="btn-modal btn-confirm">ปิด</button>
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
                    <button class="btn-modal btn-cancel">ยกเลิก</button>
                    <button class="btn-modal btn-confirm">บันทึก</button>
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
                <button class="btn-modal btn-confirm">ตกลง</button>
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

// Stats Elements
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

// Feature Elements
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
        } else {
            try {
                searchAndDisplayPlayer();
            } catch (e) {
                console.error('Could not execute search:', e);
            }
        }
    }
};

// เพิ่มฟังก์ชันคลิกดูรายละเอียดสมาชิกแคลนตรงนี้
window.fetchMemberDetails = async (clanId, playerId, canEdit) => {
    showCustomInfoModal('กำลังโหลด...', '<div style="text-align:center; padding:30px;"><span class="material-icons loading-spinner" style="font-size:50px; color:#cbd5e1;">sync</span><div style="margin-top:15px; font-size:1.1rem; color:#64748b;">กำลังดึงข้อมูลผู้เล่น...</div></div>');
    
    try {
        const playerDetail = await fetchData(`/players/${playerId}`);
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        if (playerDetail && !playerDetail.error) {
            const clanData = clanMembersDetailedMap.get(playerId) || {};
            // รวมข้อมูลจากทั้ง Player API และ Clan Member API
            const combinedData = { ...clanData, ...playerDetail, username: clanData.username || playerDetail.username };
            
            showMemberModal(combinedData);
        } else {
            showCustomAlert('แจ้งเตือน', '❌ ไม่สามารถดึงข้อมูลผู้เล่นได้');
        }
    } catch (e) {
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        showCustomAlert('แจ้งเตือน', '❌ เกิดข้อผิดพลาด: ' + e.message);
    }
};

function escapeJsString(str) {
    return (str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

async function fetchAndCacheEmojis() {
    if (globalEmojiMap.size > 0) return; 
    const res = await fetchData('/items/emojis', false, false);
    if (!res.error && Array.isArray(res)) {
        res.forEach(emoji => {
            globalEmojiMap.set(emoji.id, {
                preview: emoji.urlPreview,
                anim: emoji.urlAnimation 
            }); 
        });
    }
}

async function fetchAndCacheAvatarItems() {
    if (avatarItemsCache.size > 0) return;
    const res = await fetchData('/items/avatarItems', false, false);
    if (!res.error && Array.isArray(res)) {
        res.forEach(item => {
            avatarItemsCache.set(item.id, item);
        });
    }
}

async function fetchAndCacheRoles() {
    if (rolesCache.size > 0) return;
    const res = await fetchData('/roles', false, false);
    if (!res.error && res.roles) {
        res.roles.forEach(r => rolesCache.set(r.id, r));
        advancedRolesMappingCache = res.advancedRolesMapping || {};
        randomRolesMappingCache = res.randomRolesMapping || {};
        rankedRandomExcludedRolesCache = res.rankedRandomExcludedRoles || [];
        console.log('[Roles] Data cached successfully.');
    }
}

function showMemberModal(data) {
    let avatarUrl = 'https://via.placeholder.com/150';
    if(data.equippedAvatar?.url) avatarUrl = data.equippedAvatar.url;
    else if(data.profileIconId) avatarUrl = `https://cdn-avatars.wolvesville.com/${data.profileIconId}`;

    const creationDate = formatDateThai(data.creationTime);
    const lastOnline = formatDateThai(data.lastOnline);
    
    const don = data.donated || {};
    const xpDur = data.xpDurations || {};
    
    let statusClass = 'offline';
    let statusLabel = data.status || 'ไม่ทราบ';
    if(data.playerStatus === 'ONLINE' || data.status === 'ONLINE') { statusClass = 'online'; statusLabel = 'ออนไลน์'; }
    else if(data.playerStatus === 'PLAY' || data.status === 'PLAY') { statusClass = 'play'; statusLabel = 'กำลังเล่น'; }
    else if(data.playerStatus === 'DO_NOT_DISTURB' || data.status === 'DND') { statusClass = 'dnd'; statusLabel = 'ห้ามรบกวน'; }
    else if(data.status === 'OFFLINE' || data.playerStatus === 'OFFLINE') { statusLabel = 'ออฟไลน์'; }
    
    const joinMsg = data.joinMessage ? `<div style="background:#f1f5f9; padding:10px; border-radius:8px; margin-top:10px; font-style:italic; color:#475569; font-size:0.9rem; border-left: 3px solid #cbd5e1;">"${data.joinMessage}"</div>` : '';

    const fmt = (n) => (n || 0).toLocaleString();
    const safeUsername = escapeJsString(data.username);

    const content = `
        <div style="display:flex; flex-direction:column; align-items:center; margin-bottom:20px;">
            <img src="${avatarUrl}" referrerpolicy="no-referrer" style="width:100px; height:100px; border-radius:25%; border:4px solid #e2e8f0; margin-bottom:10px; background:#f1f5f9; object-fit:contain;">
            <h2 style="margin:0; font-size:1.5rem; color:#1e293b; cursor:pointer; text-decoration:underline;" 
                onclick="document.querySelectorAll('.modal-overlay').forEach(el => el.remove()); window.goToPlayerSearch('${safeUsername}')"
                title="คลิกเพื่อดูประวัติผู้เล่นแบบเต็ม">
                ${data.username}
            </h2>
            <div style="color:#64748b; font-size:0.9rem;">${data.flair ? `"${data.flair}"` : '-'}</div>
            <div style="margin-top:5px;">
                <span class="status-badge ${statusClass}" style="font-size:0.7rem; padding:2px 8px;">${statusLabel}</span>
                <span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:12px; font-size:0.7rem; font-weight:bold;">เลเวล ${data.level || 0}</span>
                ${data.isCoLeader ? '<span style="background:#e0f2fe; color:#075985; padding:2px 8px; border-radius:12px; font-size:0.7rem; font-weight:bold;">รองหัวหน้า</span>' : ''}
            </div>
            ${joinMsg}
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
             <div style="background:#f8fafc; padding:10px; border-radius:8px; border:1px solid #e2e8f0; text-align:center;">
                <div style="font-size:0.8rem; color:#64748b; margin-bottom:5px;">เข้าร่วมเมื่อ</div>
                <div style="font-weight:600; font-size:0.9rem;">${creationDate.split(' ')[0]}</div>
             </div>
             <div style="background:#f8fafc; padding:10px; border-radius:8px; border:1px solid #e2e8f0; text-align:center;">
                <div style="font-size:0.8rem; color:#64748b; margin-bottom:5px;">ออนไลน์ล่าสุด</div>
                <div style="font-weight:600; font-size:0.85rem;">${lastOnline}</div>
             </div>
        </div>

        <h4 style="margin:15px 0 10px 0; color:#334155; border-bottom:1px solid #eee; padding-bottom:5px;">💰 สถิติการบริจาค (Donations)</h4>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:5px; text-align:center; margin-bottom:15px; font-size:0.85rem;">
            <div style="font-weight:bold; color:#64748b; font-size:0.75rem;">ระยะเวลา</div>
            <div style="font-weight:bold; color:#d97706;">ทอง</div>
            <div style="font-weight:bold; color:#9333ea;">เพชร</div>
            
            <div style="color:#64748b;">สัปดาห์นี้</div>
            <div style="color:#d97706;">${fmt(don.gold?.week)}</div>
            <div style="color:#9333ea;">${fmt(don.gems?.week)}</div>

            <div style="color:#64748b;">เดือนนี้</div>
            <div style="color:#d97706;">${fmt(don.gold?.month)}</div>
            <div style="color:#9333ea;">${fmt(don.gems?.month)}</div>

            <div style="color:#64748b;">ทั้งหมด</div>
            <div style="color:#d97706; font-weight:bold;">${fmt(don.gold?.allTime)}</div>
            <div style="color:#9333ea; font-weight:bold;">${fmt(don.gems?.allTime)}</div>
        </div>

        <h4 style="margin:15px 0 10px 0; color:#334155; border-bottom:1px solid #eee; padding-bottom:5px;">⚔️ กิจกรรมแคลน (Activity)</h4>
        <div style="background:#f0fdf4; padding:15px; border-radius:8px; border:1px solid #bbf7d0;">
             <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                 <div>
                    <div style="color:#166534; font-size:0.75rem; margin-bottom:2px;">XP (สัปดาห์นี้)</div>
                    <div style="font-weight:bold; font-size:1rem;">${fmt(xpDur.week)}</div>
                 </div>
                 <div>
                    <div style="color:#166534; font-size:0.75rem; margin-bottom:2px;">XP (เดือนนี้)</div>
                    <div style="font-weight:bold; font-size:1rem;">${fmt(xpDur.month)}</div>
                 </div>
                 
                 <div style="grid-column: span 2; text-align: center; background: rgba(255,255,255,0.5); border-radius: 6px; padding: 5px;">
                    <div style="color:#15803d; font-size:0.75rem; margin-bottom:2px; font-weight:bold;">✨ XP (ทั้งหมด)</div>
                    <div style="font-weight:bold; font-size:1.1rem; color:#15803d;">${fmt(data.xp)}</div>
                 </div>

                 <div>
                    <div style="color:#166534; font-size:0.75rem; margin-bottom:2px;">ลงเควสทอง</div>
                    <div style="font-weight:bold; font-size:1rem;">${fmt(data.goldQuests)} ครั้ง</div>
                 </div>
                 <div>
                    <div style="color:#166534; font-size:0.75rem; margin-bottom:2px;">ลงเควสเพชร</div>
                    <div style="font-weight:bold; font-size:1rem;">${fmt(data.gemQuests)} ครั้ง</div>
                 </div>
             </div>
        </div>

        <div style="margin-top:15px; font-size:0.75rem; color:#94a3b8; text-align:center;">
            Player ID: <span style="font-family:monospace;">${data.playerId || data.id}</span>
        </div>
    `;
    
    showCustomInfoModal(data.username || 'ข้อมูลสมาชิก', content);
}

// Function to Show Quest Details Modal WITH Votes
window.showQuestModal = (questId) => {
    const quest = questDetailsCache.get(questId);
    if (!quest) return showCustomAlert('แจ้งเตือน', 'ไม่พบข้อมูลของเควสนี้ครับ');

    const title = quest.title || 'เควสแคลน';
    const imageUrl = quest.promoImageUrl || 'https://via.placeholder.com/200';
    
    let rewardsHtml = '<p style="color:#64748b; font-style:italic;">ไม่มีรางวัลเฉพาะเจาะจง</p>';
    if (quest.rewards && quest.rewards.length > 0) {
        const rewardsList = quest.rewards.map((r, idx) => {
            let imgUrl = EMBEDDED_ICONS.UNKNOWN;
            let label = r.type.replace(/_/g, ' ');
            let subLabel = `x${r.amount}`;

            let fallback = `this.onerror=null;this.src='${EMBEDDED_ICONS.UNKNOWN}';`;

            if (r.type === 'AVATAR_ITEM') {
                const itemId = r.avatarItemId;
                imgUrl = `https://cdn.wolvesville.com/avatarItems/png/256x/${itemId}.png`; 
                const cachedItem = avatarItemsCache.get(itemId);
                if (cachedItem && cachedItem.imageUrl) {
                    imgUrl = cachedItem.imageUrl; 
                }
                label = 'ไอเทมตกแต่ง (Avatar Item)';
                if (r.amount <= 1) subLabel = '';
            } else if (r.type === 'GOLD') {
                imgUrl = EMBEDDED_ICONS.GOLD;
                label = 'ทอง (Gold)';
            } else if (r.type === 'GEM' || r.type === 'GEMS') {
                imgUrl = EMBEDDED_ICONS.GEM; 
                label = 'เพชร (Gems)';
            } else if (r.type === 'ROSE' || r.type === 'ROSES' || r.type === 'ROSE_PACKAGE') {
                imgUrl = EMBEDDED_ICONS.ROSE;
                label = 'ดอกกุหลาบ (Rose)';
            }

            return `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; background:#fff; padding:10px; border-radius:12px; border:1px solid #e2e8f0; position:relative; box-shadow: 0 1px 2px rgba(0,0,0,0.05); min-height:80px;" title="${label}">
                    <div style="position:absolute; top:0; right:0; background:#64748b; color:white; font-size:0.65rem; padding:2px 6px; border-bottom-left-radius:8px; font-weight:bold;">ด่าน ${idx+1}</div>
                    <img src="${imgUrl}" referrerpolicy="no-referrer" onerror="${fallback}" style="width:48px; height:48px; object-fit:contain; margin-top:5px;">
                    ${subLabel ? `<div style="font-size:0.75rem; font-weight:bold; color:#475569; margin-top:5px;">${subLabel}</div>` : ''}
                </div>
            `;
        }).join('');

        const colCount = Math.max(1, Math.ceil(quest.rewards.length / 2));
        rewardsHtml = `<div style="display:grid; grid-template-columns:repeat(${colCount}, 1fr); gap:8px; margin-top:5px;">${rewardsList}</div>`;
    }

    // เอาประวัติคนโหวตกลับมา
    let votesHtml = '<p style="color:#64748b; font-style:italic;">ยังไม่มีการโหวต</p>';
    if (clanVotesCache && clanVotesCache.votes && clanVotesCache.votes[questId]) {
        const voterIds = clanVotesCache.votes[questId];
        if (voterIds.length > 0) {
            const voterNames = voterIds.map(vid => clanMembersCache[vid] || 'ไม่ทราบชื่อสมาชิก').join(', ');
            votesHtml = `<div style="margin-top:5px; font-size:0.9rem; color:#475569; background:#f8fafc; padding:8px; border-radius:8px; border:1px solid #e2e8f0;">${voterNames}</div>`;
        }
    }

    const content = `
        <img src="${imageUrl}" referrerpolicy="no-referrer" style="width:100%; border-radius:8px; margin-bottom:15px; border:1px solid #e2e8f0; display:block;">
        <h4 style="margin-bottom:10px; color:#334155;">🎁 รายการของรางวัล (Rewards)</h4>
        ${rewardsHtml}
        <h4 style="margin:15px 0 10px 0; color:#334155; border-top:1px dashed #eee; padding-top:15px;">🗳️ จำนวนโหวตจากแคลน (${(clanVotesCache?.votes?.[questId] || []).length})</h4>
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
            if(res.status === 429) errorMsg = 'ระบบถูกจำกัดการเรียกใช้งานชั่วคราว กรุณารอสักครู่ (Too many requests)';
            showCustomAlert('ล้มเหลว', '❌ ไม่สามารถโพสต์ประกาศได้: ' + errorMsg);
        } else {
            input.value = ''; 
            showCustomAlert('สำเร็จ', '✅ โพสต์ประกาศแคลนสำเร็จแล้ว!');
            fetchClanData(clanId, true, true); 
        }
    } catch (e) {
        console.error('[Announcement] Error:', e);
        showCustomAlert('ข้อผิดพลาด', '❌ เกิดข้อผิดพลาด: ' + e.message);
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
            if(res.status === 429) errorMsg = 'ระบบถูกจำกัดการเรียกใช้งานชั่วคราว กรุณารอสักครู่ (Too many requests)';
            showCustomAlert('ล้มเหลว', '❌ ไม่สามารถส่งข้อความได้: ' + errorMsg);
        } else {
            input.value = ''; 
            input.focus();
            fetchClanData(clanId, true, true);
        }
    } catch (e) {
        console.error('[Chat] Error:', e);
        showCustomAlert('ข้อผิดพลาด', '❌ เกิดข้อผิดพลาด: ' + e.message);
        if(input) input.disabled = false;
    }
};

window.blockMemberFromList = async (clanId, playerId, username) => {
    const confirmed = await showCustomConfirm(
        'บล็อคผู้เล่น',
        `⚠️ คุณแน่ใจหรือไม่ว่าต้องการ <strong>บล็อค</strong> <span style="color:#ef4444; font-weight:bold;">${username}</span> ออกจากแคลน?<br><br>ผู้เล่นจะถูกเตะออกและเพิ่มชื่อลงในแบล็คลิสต์ (Blocklist) ทันที`,
        true 
    );

    if (!confirmed) return;

    try {
        console.log(`[BlockMember] Blocking ${username} (${playerId})...`);
        const res = await sendPayload(`/clans/${clanId}/members/${playerId}/block`, 'POST', {});
        
        if (res.error) {
             showCustomAlert('การบล็อคล้มเหลว', '❌ ' + (res.message || 'Unknown error'));
        } else {
            showCustomAlert('สำเร็จ', `✅ บล็อคผู้เล่น <strong>${username}</strong> เรียบร้อยแล้ว`);
            fetchClanData(clanId, true, true); 
        }
    } catch (e) {
        console.error('[BlockMember] Error:', e);
        showCustomAlert('ข้อผิดพลาด', '❌ เกิดข้อผิดพลาดร้ายแรง: ' + e.message);
    }
};

window.unblockMember = async (clanId, playerId) => {
    try {
        console.log(`[UnblockMember] Unblocking ${playerId}...`);
        const res = await sendPayload(`/clans/${clanId}/members/${playerId}/unblock`, 'POST', {});
        
        if (res.error) {
             showCustomAlert('ปลดบล็อคล้มเหลว', '❌ ' + (res.message || 'Unknown error'));
        } else {
            console.log('Unblocked successfully');
            fetchClanData(clanId, true, true); 
        }
    } catch (e) {
        console.error('[UnblockMember] Error:', e);
        showCustomAlert('ข้อผิดพลาด', '❌ เกิดข้อผิดพลาดร้ายแรง: ' + e.message);
    }
};

window.manualAddToBlocklist = async (clanId) => {
    const playerId = document.getElementById('manual-block-input').value.trim();
    if (!playerId) return showCustomAlert('แจ้งเตือน', 'กรุณาระบุ Player ID (UUID) ครับ');
    if (!isUUID(playerId)) return showCustomAlert('รูปแบบไม่ถูกต้อง', 'รูปแบบ Player ID ไม่ถูกต้อง (ต้องเป็น UUID เท่านั้นครับ)');

    try {
        const res = await sendPayload(`/clans/${clanId}/members/${playerId}/block`, 'POST', {});
        if (res.error) {
            showCustomAlert('ล้มเหลว', '❌ ทำรายการไม่สำเร็จ: ' + (res.message || 'Unknown error'));
        } else {
            showCustomAlert('สำเร็จ', `✅ เพิ่มไอดี ${playerId} ลงในแบล็คลิสต์เรียบร้อยแล้ว`);
            document.getElementById('manual-block-input').value = '';
            fetchClanData(clanId, true, true);
        }
    } catch (e) {
        showCustomAlert('ข้อผิดพลาด', e.message);
    }
};

window.kickMemberFromList = async (clanId, playerId, username) => {
    const confirmed = await showCustomConfirm(
        'เตะผู้เล่น',
        `⚠️ คุณแน่ใจหรือไม่ว่าต้องการ <strong>เตะ</strong> <span style="color:#ef4444; font-weight:bold;">${username}</span> ออกจากแคลน?<br><br>การกระทำนี้ไม่สามารถย้อนกลับได้`,
        true 
    );

    if (!confirmed) return;

    try {
        console.log(`[KickMember] Kicking ${username} (${playerId})...`);
        const res = await sendPayload(`/clans/${clanId}/members/${playerId}/kick`, 'POST', {});
        
        if (res.error) {
             let errMsg = res.message || 'Unknown error';
             if (res.status === 403) errMsg = 'ปฏิเสธการเข้าถึง: คุณไม่มีสิทธิ์ในการเตะสมาชิกคนนี้ครับ';
             showCustomAlert('การเตะล้มเหลว', '❌ ' + errMsg);
        } else {
            showCustomAlert('สำเร็จ', `✅ สมาชิก <strong>${username}</strong> ถูกเตะออกจากแคลนแล้ว`);
            fetchClanData(clanId, true, true);
        }
    } catch (e) {
        console.error('[KickMember] Error:', e);
        showCustomAlert('ข้อผิดพลาด', '❌ เกิดข้อผิดพลาดร้ายแรง: ' + e.message);
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
        showCustomAlert('ล้มเหลว', '❌ ไม่สามารถเปลี่ยนสถานะได้: ' + (res.message || 'Unknown error'));
    } else {
        btnElement.innerText = newStatus ? 'check_circle' : 'cancel';
        btnElement.className = `material-icons quest-inline-icon clickable ${newStatus ? 'on' : 'off'}`;
        btnElement.style.pointerEvents = 'auto';
        btnElement.setAttribute('onclick', `event.stopPropagation(); window.toggleQuestFromList('${clanId}', '${playerId}', ${newStatus}, this)`);

        const change = newStatus ? 1 : -1;
        currentParticipatingCount += change;
        if(currentParticipatingCount < 0) currentParticipatingCount = 0;
        
        updatePricesClientSide();
    }
};

function animateValue(obj, start, end, duration) {
    if (start === end) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function updatePricesClientSide() {
    const n = currentParticipatingCount;
    
    const actionCost = 300 + (30 * n);
    document.querySelectorAll('.dynamic-action-price').forEach(el => {
        const currentVal = parseInt(el.innerText.replace(/,/g, '')) || 0;
        animateValue(el, currentVal, actionCost, 500);
    });

    document.querySelectorAll('.dynamic-buy-price').forEach(el => {
        const isGem = el.dataset.currency === 'gem';
        const cost = isGem ? (350 + 135 * n) : (2000 + 400 * n);
        const currentVal = parseInt(el.innerText.replace(/,/g, '')) || 0;
        animateValue(el, currentVal, cost, 500);
    });
}

window.editFlairFromList = async (clanId, playerId, currentFlair) => {
    const newFlair = await showCustomPrompt('แก้ไขฉายา', 'พิมพ์ฉายาใหม่สำหรับสมาชิกคนนี้:', currentFlair);
    if (newFlair === null) return; 

    try {
        const res = await sendPayload(`/clans/${clanId}/members/${playerId}/flair`, 'PUT', { flair: newFlair });
        
        if (res.error) {
            let errMsg = res.message || 'Unknown error';
            if (res.status === 403) errMsg = 'ปฏิเสธการเข้าถึง: คุณไม่มีสิทธิ์แก้ไขฉายานี้';
            else if (res.status === 404) errMsg = 'ไม่พบข้อมูลสมาชิกท่านนี้';
            showCustomAlert('ล้มเหลว', '❌ ไม่สามารถอัปเดตฉายาได้:\n' + errMsg);
        } else {
            showCustomAlert('สำเร็จ', '✅ อัปเดตฉายาเรียบร้อยแล้ว!');
            fetchClanData(clanId, true, true);
        }
    } catch (e) {
        console.error('[EditFlair] Critical Error:', e);
        showCustomAlert('ข้อผิดพลาด', '❌ เกิดข้อผิดพลาดร้ายแรง: ' + e.message);
    }
};

window.toggleAllQuestParticipation = async (clanId, isParticipating) => {
    const actionTh = isParticipating ? 'เปิด' : 'ปิด';
    const confirmed = await showCustomConfirm(
        'ยืนยันการทำรายการ', 
        `⚠️ คุณแน่ใจหรือไม่ว่าต้องการ <strong>${actionTh}</strong> การเข้าร่วมทำเควสสำหรับสมาชิก <strong>ทุกคน</strong>?`, 
        !isParticipating 
    );
    
    if(!confirmed) return;

    try {
        const res = await sendPayload(`/clans/${clanId}/members/all/participateInQuests`, 'PUT', { participateInQuests: isParticipating });
        
        if (res.error) {
            showCustomAlert('ล้มเหลว', '❌ ไม่สามารถทำรายการได้: ' + (res.message || 'Unknown error'));
        } else {
            showCustomAlert('สำเร็จ', `✅ <strong>${actionTh}</strong> การเข้าร่วมทำเควสสำหรับทุกคนเรียบร้อยแล้ว!`);
            setTimeout(() => { fetchClanData(clanId, true, true); }, 1000); 
        }
    } catch (e) {
        showCustomAlert('ข้อผิดพลาด', '❌ เกิดข้อผิดพลาด: ' + e.message);
    }
};

window.shuffleClanQuests = async (clanId) => {
    const confirmed = await showCustomConfirm(
        'สุ่มเควสใหม่',
        '⚠️ <strong>ใช้ทอง: 500 💰</strong><br>คุณแน่ใจหรือไม่ว่าต้องการสุ่มเควสที่มีให้ซื้อใหม่ทั้งหมด?',
        false 
    );

    if (!confirmed) return;

    try {
        console.log(`[Shuffle] Shuffling quests for clan ${clanId}...`);
        const res = await sendPayload(`/clans/${clanId}/quests/available/shuffle`, 'POST', {});

        if (res.error) {
            let errorMsg = res.message || 'Unknown error';
            showCustomAlert('สุ่มเควสล้มเหลว', '❌ ' + errorMsg);
        } else {
            showCustomAlert('สำเร็จ', '✅ สุ่มเควสใหม่เรียบร้อยแล้ว!');
            fetchClanData(clanId, true, true); 
        }
    } catch (e) {
        console.error('[Shuffle] Error:', e);
        showCustomAlert('ข้อผิดพลาด', '❌ เกิดข้อผิดพลาด: ' + e.message);
    }
};

window.skipQuestWaitingTime = async (clanId) => {
    const confirmed = await showCustomConfirm('ข้ามเวลาการรอ', '⚠️ ต้องการใช้ทอง/เพชรของแคลนเพื่อข้ามเวลาการรอเควสด่านต่อไปหรือไม่?', false);
    if (!confirmed) return;

    try {
        const res = await sendPayload(`/clans/${clanId}/quests/active/skipWaitingTime`, 'POST', {});
        if (res.error) {
            showCustomAlert('ล้มเหลว', '❌ ไม่สามารถข้ามเวลาได้: ' + (res.message || 'Unknown error'));
        } else {
            showCustomAlert('สำเร็จ', '✅ ทำการข้ามเวลาการรอสำเร็จ!');
            fetchClanData(clanId, true, true);
        }
    } catch(e) {
        showCustomAlert('ข้อผิดพลาด', e.message);
    }
};

window.claimQuestExtraTime = async (clanId) => {
    const confirmed = await showCustomConfirm('ขยายเวลา', '⚠️ ต้องการใช้ทอง/เพชรของแคลนเพื่อขยายเวลาทำเควสเพิ่มหรือไม่? (กดได้ครั้งเดียวต่อ 1 ด่าน)', false);
    if (!confirmed) return;

    try {
        const res = await sendPayload(`/clans/${clanId}/quests/active/claimTime`, 'POST', {});
        if (res.error) {
            showCustomAlert('ล้มเหลว', '❌ ไม่สามารถขยายเวลาได้: ' + (res.message || 'Unknown error'));
        } else {
            showCustomAlert('สำเร็จ', '✅ ขยายเวลาทำเควสสำเร็จ!');
            fetchClanData(clanId, true, true);
        }
    } catch(e) {
        showCustomAlert('ข้อผิดพลาด', e.message);
    }
};

window.cancelActiveQuest = async (clanId) => {
    const confirmed = await showCustomConfirm('ยกเลิกเควส', '⚠️ ยืนยันที่จะยกเลิกเควสที่กำลังทำอยู่หรือไม่? (แคลนจะได้รับค่าใช้จ่ายบางส่วนคืน)', true);
    if (!confirmed) return;

    try {
        const res = await sendPayload(`/clans/${clanId}/quests/active/cancel`, 'POST', {});
        if (res.error) {
            showCustomAlert('ล้มเหลว', '❌ ไม่สามารถยกเลิกเควสได้: ' + (res.message || 'Unknown error'));
        } else {
            showCustomAlert('สำเร็จ', '✅ ยกเลิกเควสเรียบร้อยแล้ว!');
            fetchClanData(clanId, true, true);
        }
    } catch(e) {
        showCustomAlert('ข้อผิดพลาด', e.message);
    }
};

window.claimClanQuest = async (clanId, questId, questTitle) => {
    const confirmed = await showCustomConfirm(
        'ซื้อเควส',
        `⚠️ ต้องการซื้อเควส <strong>${questTitle}</strong> หรือไม่?<br>การกระทำนี้จะหักทองหรือเพชรของแคลนโดยตรง!`,
        false 
    );

    if (!confirmed) return;

    try {
        console.log(`[ClaimQuest] Claiming quest ${questId} for clan ${clanId}...`);
        const res = await sendPayload(`/clans/${clanId}/quests/claim`, 'POST', { questId: questId });

        if (res.error) {
            let errorMsg = res.message || 'Unknown error';
            showCustomAlert('ซื้อเควสล้มเหลว', '❌ ' + errorMsg);
        } else {
            showCustomAlert('สำเร็จ', '✅ ซื้อเควสแคลนสำเร็จแล้ว!');
            setTimeout(() => {
                fetchClanData(clanId, true, true); 
            }, 3000);
        }
    } catch (e) {
        console.error('[ClaimQuest] Error:', e);
        showCustomAlert('ข้อผิดพลาด', '❌ เกิดข้อผิดพลาด: ' + e.message);
    }
};

// ฟังก์ชันรับหมวก API Hat
window.redeemApiHat = async () => {
    const confirmed = await showCustomConfirm(
        'รับหมวก API Hat',
        '⚠️ ต้องการรับหมวก API Hat แบบพิเศษฟรี สำหรับไอดีเจ้าของ Bot หรือไม่?',
        false 
    );

    if (!confirmed) return;

    try {
        console.log('[RedeemApiHat] Requesting API Hat...');
        showCustomInfoModal('กำลังดำเนินการ...', '<div style="text-align:center; padding:30px;"><span class="material-icons loading-spinner" style="font-size:50px; color:#cbd5e1;">sync</span><div style="margin-top:15px; font-size:1.1rem; color:#64748b;">กำลังร้องขอของรางวัลจากเซิร์ฟเวอร์...</div></div>');
        
        const res = await sendPayload('/items/redeemApiHat', 'POST', {});
        
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());

        if (res.error) {
            showCustomAlert('ล้มเหลว', '❌ ไม่สามารถรับรางวัลได้: ' + (res.message || 'Unknown error'));
        } else {
            showCustomAlert('สำเร็จ', '✅ รับหมวก API Hat สำเร็จ!<br><br>ไอเทมได้ถูกเพิ่มเข้าไปในช่องเก็บของในเกม (Inventory) ของบัญชีเจ้าของบอทเรียบร้อยแล้วครับ');
        }
    } catch (e) {
        console.error('[RedeemApiHat] Error:', e);
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        showCustomAlert('ข้อผิดพลาด', '❌ เกิดข้อผิดพลาด: ' + e.message);
    }
};

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

    return `<span id="quest-reset-timer" style="font-size:0.8rem; color:#64748b; font-weight:normal; float:right;">สุ่มเควสฟรีอัตโนมัติในอีก: ${d} วัน ${h} ชม. ${m} นาที (จันทร์ 07:00)</span>`;
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
    if (!key) return { error: true, message: 'ไม่พบ API Key ในระบบ' };

    // เพิ่มพารามิเตอร์ locale เฉพาะเมื่อเลือกภาษาไทย (ถ้าเป็น en ให้ใช้ endpoint เดิมๆ)
    const locale = localStorage.getItem('wolvesville_api_locale') || 'th';
    let finalEndpoint = endpoint;
    if (locale === 'th' && !finalEndpoint.includes('locale=')) {
        finalEndpoint += (finalEndpoint.includes('?') ? '&' : '?') + 'locale=th';
    }

    try {
        const timestamp = new Date().getTime();
        const url = `${localServerUrl}/api/wolvesville?endpoint=${encodeURIComponent(finalEndpoint)}&apiKey=${encodeURIComponent(key)}&_t=${timestamp}`;
        const res = await fetch(url);
        
        if (res.ok) {
            if (isRequest) sendIncrementSignal('requests');
            return await res.json();
        } else {
            return { error: true, status: res.status };
        }
    } catch (e) {
        return { error: true, message: e.message };
    }
}

async function sendPayload(endpoint, method, payload) {
    const key = localStorage.getItem('wolvesville_api_key');
    if (!key) return { error: true, message: 'ไม่พบ API Key ในระบบ' };

    // เพิ่มพารามิเตอร์ locale เฉพาะเมื่อเลือกภาษาไทย
    const locale = localStorage.getItem('wolvesville_api_locale') || 'th';
    let finalEndpoint = endpoint;
    if (locale === 'th' && !finalEndpoint.includes('locale=')) {
        finalEndpoint += (finalEndpoint.includes('?') ? '&' : '?') + 'locale=th';
    }

    const url = `${localServerUrl}/api/wolvesville`; 
    
    try {
        const res = await fetch(url, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint: finalEndpoint,
                apiKey: key,
                method: method,
                data: payload,
                body: payload,
                headers: { 'Content-Type': 'application/json' }
            })
        });
        
        if (res.ok) {
            sendIncrementSignal('requests');
            const text = await res.text();
            return text ? JSON.parse(text) : { success: true };
        } else {
            const txt = await res.text();
            if (res.status === 404 && txt.includes('Cannot POST')) {
                return { error: true, status: 404, message: 'ข้อผิดพลาดพร็อกซี: โลคอลเซิร์ฟเวอร์ของคุณไม่รองรับ POST requests โปรดเพิ่ม POST handler ลงใน server.js' };
            }
            return { error: true, status: res.status, message: txt };
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
        if (!key) throw new Error('No API Key');

        const response = await fetch(`${localServerUrl}/api/items/total?apiKey=${encodeURIComponent(key)}`);
        const data = await response.json();

        if (data.error) {
             itemDataCache = { count: '-', error: true };
        } else {
             itemDataCache = { count: data.count, error: false };
             console.log(`[Items] Count loaded: ${data.count} (Source: ${data.fromCache ? 'Server Cache' : 'Live API'})`);
        }
    } catch (e) {
        console.error('[Items] Error fetching total:', e);
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
            if(requestsFullThisMonth) requestsFullThisMonth.textContent = req.count_month.toLocaleString();
            if(requestsFullThisYear) requestsFullThisYear.textContent = req.count_year.toLocaleString();
            if(requestsFullLifetime) requestsFullLifetime.textContent = (req.count_lifetime||0).toLocaleString();

            if(visitorsFullToday) visitorsFullToday.textContent = vis.count_today.toLocaleString();
            if(visitorsFullThisMonth) visitorsFullThisMonth.textContent = vis.count_month.toLocaleString();
            if(visitorsFullThisYear) visitorsFullThisYear.textContent = vis.count_year.toLocaleString();
            if(visitorsFullLifetime) visitorsFullLifetime.textContent = (vis.count_lifetime||0).toLocaleString();
        }
    } catch (e) { console.error(e); }
}

// Function to render Global Announcements
function renderGlobalAnnouncements(data) {
    let container = document.getElementById('global-announcements-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'global-announcements-container';
        container.style.marginTop = '40px';
        const dashboardPage = document.getElementById('dashboard');
        if (dashboardPage) {
            dashboardPage.appendChild(container);
        } else {
            return;
        }
    }

    const buildList = (title, icon, items, color) => {
        if (!items || items.length === 0) return '';
        let html = `
            <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; max-height: 600px;">
                <h3 style="margin: 0 0 15px 0; color: ${color}; display: flex; align-items: center; gap: 8px; font-size: 1.2rem;">
                    <span class="material-icons">${icon}</span> ${title}
                </h3>
                <div style="overflow-y: auto; padding-right: 5px; flex: 1; display: flex; flex-direction: column; gap: 15px;" class="clan-scroll-area">
        `;
        
        items.forEach(item => {
            let imgHtml = '';
            if (item.attachments && item.attachments.length > 0) {
                const att = item.attachments[0];
                imgHtml = `<img src="${att.url}" referrerpolicy="no-referrer" style="max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #e2e8f0; object-fit: contain; max-height: 250px;" loading="lazy" alt="Attachment">`;
            }
            
            html += `
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid ${color};">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <strong style="color: #334155; font-size: 0.95rem;">@${item.author?.username || 'ระบบ'}</strong>
                        <span style="font-size: 0.75rem; color: #94a3b8; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${formatDateThai(item.timestamp)}</span>
                    </div>
                    <div style="color: #475569; font-size: 0.9rem; line-height: 1.5; white-space: pre-wrap; word-break: break-word;">${linkify(item.content)}</div>
                    ${imgHtml}
                </div>
            `;
        });
        
        html += `</div></div>`;
        return html;
    };

    const annHtml = buildList('ประกาศ (Announcements)', 'campaign', data.announcements, 'var(--primary-color)');
    const changeHtml = buildList('อัปเดต (Changelogs)', 'update', data.changelogs, '#f59e0b');
    const eventsHtml = buildList('กิจกรรม (Discord Events)', 'event', data.discordEvents, '#a855f7');

    container.innerHTML = `
        <h2 style="margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; display: flex; align-items: center; gap: 10px;">
            <span class="material-icons" style="color: var(--primary-color);">newspaper</span> 
            ข่าวสารและอัปเดตเซิร์ฟเวอร์ (Global Announcements)
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            ${annHtml || ''}
            ${changeHtml || ''}
            ${eventsHtml || ''}
        </div>
    `;
}

// **********************************************
// 7. DASHBOARD & PLAYER LOGIC
// **********************************************

async function fetchAndDisplayData() {
    await fetchAndDisplayStatsOnly();
    if(availableItems) availableItems.textContent = '...';
    if(apiStatusText) apiStatusText.textContent = 'กำลังตรวจสอบ...';
    if(apiStatusDot) apiStatusDot.style.backgroundColor = '#FFD700';

    const check = await fetchData('/announcements', true, false);
    if (!check.error) {
        if(apiStatusDot) { apiStatusDot.classList.add('connected'); apiStatusDot.style.backgroundColor = '#4CAF50'; }
        if(apiStatusText) apiStatusText.textContent = 'ออนไลน์ (200 OK)';
        
        const items = await fetchTotalItemsCount();
        if(availableItems) {
             availableItems.innerHTML = `
                ${items.error ? 'ข้อผิดพลาด' : items.count.toLocaleString()}
             `;
        }
        
        // Render Global Announcements if data is available
        renderGlobalAnnouncements(check);
        
        // Fetch roles cache in the background on startup
        fetchAndCacheRoles();

    } else {
        if(apiStatusDot) { apiStatusDot.classList.remove('connected'); apiStatusDot.style.backgroundColor = '#D32F2F'; }
        if(apiStatusText) apiStatusText.textContent = 'เชื่อมต่อไม่ได้';
        if(availableItems) availableItems.textContent = '-';
    }
}

async function searchAndDisplayPlayer() {
    window.searchAndDisplayPlayer = searchAndDisplayPlayer;
    
    const input = usernameInput.value.trim();
    if (!input) return;
    if (!localStorage.getItem('wolvesville_api_key')) {
        if (typeof showCustomAlert === 'function') {
            return showCustomAlert('แจ้งเตือน', 'กรุณาใส่ API Key ในหน้าตั้งค่าก่อนครับ');
        } else {
            return alert('กรุณาใส่ API Key ในหน้าตั้งค่าก่อนครับ');
        }
    }

    // 🌟 หน้าต่างโหลดแบบสวยงาม (มีไอคอนหมุน) 🌟
    playerProfileContainer.innerHTML = `
        <div style="text-align:center; padding:60px 20px; background:white; border-radius:var(--radius-lg); border:1px solid #e2e8f0; box-shadow:var(--shadow-sm); margin-top:20px; animation: fadeIn 0.3s ease-out;">
            <span class="material-icons loading-spinner" style="font-size:60px; color:var(--primary-color);">autorenew</span>
            <h3 style="color:#1e293b; margin-top:20px; font-size:1.3rem;">กำลังค้นหาข้อมูล...</h3>
            <p style="color:#64748b; font-size:0.95rem; margin-top:5px;">กำลังดึงข้อมูลของ <strong style="color:var(--primary-color);">${escapeJsString(input)}</strong> จากเซิร์ฟเวอร์</p>
        </div>
    `;

    let id = input;
    if (!isUUID(input)) {
        const search = await fetchData(`/players/search?username=${encodeURIComponent(input)}`);
        if (search && !search.error && search.length) id = search[0].id;
        else if (search && search.id) id = search.id;
        else {
            // ❌ หน้าต่างแจ้งเตือนแบบสวยงามเมื่อไม่พบผู้เล่น ❌
            playerProfileContainer.innerHTML = `
                <div class="empty-state" style="border-color: #fecaca; background: #fef2f2; margin-top:20px;">
                    <span class="material-icons" style="color: #ef4444; font-size: 60px;">person_off</span>
                    <h3 style="color: #991b1b; margin:10px 0; font-size:1.3rem;">ไม่พบผู้เล่น</h3>
                    <p style="color: #ef4444; font-size:0.95rem;">ไม่พบข้อมูลของชื่อ <strong>${escapeJsString(input)}</strong> ในระบบ<br>กรุณาตรวจสอบตัวสะกดอีกครั้ง</p>
                </div>
            `;
            return;
        }
    }

    const data = await fetchData(`/players/${id}`);
    if (data && !data.error) {
        // Ensure roles are cached before displaying profile
        await fetchAndCacheRoles();
        
        if (data.clanId) {
            const clan = await fetchData(`/clans/${data.clanId}/info`);
            if (!clan.error) {
                data.clanName = clan.name;
                data.clanTag = clan.tag;
            }
        }
        renderPlayerProfile(data);
    } else {
        // ❌ หน้าต่างแจ้งเตือนเมื่อดึงข้อมูลล้มเหลว ❌
        playerProfileContainer.innerHTML = `
            <div class="empty-state" style="border-color: #fecaca; background: #fef2f2; margin-top:20px;">
                <span class="material-icons" style="color: #ef4444; font-size: 60px;">error_outline</span>
                <h3 style="color: #991b1b; margin:10px 0; font-size:1.3rem;">ดึงข้อมูลล้มเหลว</h3>
                <p style="color: #ef4444; font-size:0.95rem;">เกิดข้อผิดพลาดในการดึงข้อมูลจาก API<br>ข้อความ: ${data.message || 'Unknown Error'}</p>
            </div>
        `;
    }
    fetchAndDisplayStatsOnly();
}

window.searchAndDisplayPlayer = searchAndDisplayPlayer;

function renderPlayerProfile(data) {
    const stats = data.gameStats || {};
    const roles = data.roleCards || [];
    
    const total = (stats.totalWinCount||0) + (stats.totalLoseCount||0) + (stats.totalTieCount||0);
    const winRate = total > 0 ? ((stats.totalWinCount/total)*100).toFixed(1) : 0;
    
    const rankTotal = (data.rankedWins||0) + (data.rankedLosses||0);
    const rankWR = rankTotal > 0 ? ((data.rankedWins/rankTotal)*100).toFixed(1) : 0;
    const rankSkill = data.rankedSeasonSkill || '-';
    const rankMaxSkill = data.rankedSeasonMaxSkill || '-';
    const bestRank = data.rankedSeasonBestRank ? `#${data.rankedSeasonBestRank.toLocaleString()}` : '-';

    const calcWR = (w, l) => { const t = (w||0)+(l||0); return t > 0 ? ((w/t)*100).toFixed(0) : 0; };
    const vilWR = calcWR(stats.villageWinCount, stats.villageLoseCount);
    const wolfWR = calcWR(stats.werewolfWinCount, stats.werewolfLoseCount);
    const voteWR = calcWR(stats.votingWinCount, stats.votingLoseCount);

    // ตรวจสอบเวลาออนไลน์ล่าสุด (ห้ามเกิน 5 นาที)
    let isReallyOnline = false;
    if (data.lastOnline) {
        const lastOnlineDate = new Date(data.lastOnline);
        const now = new Date();
        const diffMinutes = (now - lastOnlineDate) / (1000 * 60);
        isReallyOnline = diffMinutes <= 5;
    }

    const rawStatus = (data.status || 'OFFLINE').toUpperCase();
    let statusBadge = '';

    // ถ้าออนไลน์อยู่ในช่วง 5 นาที
    if (isReallyOnline) {
        if (rawStatus === 'PLAY') {
            statusBadge = '<span class="status-badge play"><span class="material-icons">sports_esports</span> กำลังเล่น</span>';
        } else if (rawStatus === 'DO_NOT_DISTURB' || rawStatus === 'DND') { 
            statusBadge = '<span class="status-badge dnd"><span class="material-icons">do_not_disturb_on</span> ห้ามรบกวน</span>';
        } else { 
            // DEFAULT หรือ ONLINE
            statusBadge = '<span class="status-badge online"><span class="material-icons">fiber_manual_record</span> ออนไลน์</span>';
        }
    } else {
        // ถ้าเกิน 5 นาที ปัดเป็น Offline ทันที
        statusBadge = '<span class="status-badge offline"><span class="material-icons">cloud_off</span> ออฟไลน์</span>';
    }

    let clanHtml = '';
    if (data.clanName) clanHtml = `<span class="clan-tag" title="${data.clanId}">[${data.clanTag||'CLAN'}] ${data.clanName}</span>`;
    else if (data.clanId) clanHtml = `<span class="clan-tag error">มีแต่ Clan ID</span>`;

    const achievements = stats.achievements || [];
    const topRoles = achievements
        .sort((a, b) => b.level - a.level || b.points - a.points)
        .slice(0, 3)
        .map(a => {
            const rData = rolesCache.get(a.roleId) || {};
            const rName = rData.name || a.roleId.replace(/-/g,' ').toUpperCase();
            return `
                <div class="achievement-tag">
                    <strong>${rName}</strong>
                    <span class="achievement-lvl">เลเวล ${a.level}</span>
                </div>
            `;
        }).join('');

    const cardsHtml = roles.map(c => {
        const roleData = rolesCache.get(c.roleId1) || {};
        const roleName = roleData.name || c.roleId1.replace(/-/g,' ').toUpperCase();
        
        let roleIconHtml = `<span class="material-icons" style="color:rgba(255,255,255,0.8);">style</span>`;
        if (roleData.image && roleData.image.url) {
            roleIconHtml = `<img src="${roleData.image.url}" referrerpolicy="no-referrer" style="width: 44px; height: 44px; object-fit: contain; filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.5));" alt="${roleName}">`;
        }

        const advancedList = (c.roleIdsAdvanced || [])
            .map(id => {
                const advData = rolesCache.get(id) || {};
                const advName = advData.name || id.replace(/-/g, ' ');
                return `<span style="display:inline-block; background:#f1f5f9; padding:2px 6px; border-radius:4px; margin:2px 2px 2px 0; font-size:0.7rem; border:1px solid #e2e8f0; color:#475569;">${advName}</span>`;
            })
            .join('');

        return `
        <div class="game-card">
            <div class="card-top rarity-${c.rarity}" style="display: flex; align-items: center; justify-content: center;">
                ${roleIconHtml}
            </div>
            <div class="card-body">
                <div class="card-title">${roleName}</div>
                <div class="card-subtitle">${c.rarity}</div>
                ${advancedList ? `<div style="margin-bottom:8px; display:flex; flex-wrap:wrap;">${advancedList}</div>` : ''}
                <ul class="ability-list">${[c.abilityId1,c.abilityId2,c.abilityId3,c.abilityId4].filter(x=>x).map(a=>`<li class="ability-item">${a.replace(/-/g,' ')}</li>`).join('')}</ul>
            </div>
        </div>
    `}).join('');

    const rawJson = JSON.stringify(data, null, 4);

    playerProfileContainer.innerHTML = `
        <div class="profile-header-card">
            <div class="profile-avatar-wrapper">
                <img src="${data.equippedAvatar?.url || 'https://via.placeholder.com/150'}" class="profile-avatar-lg">
                <div class="level-badge">เลเวล ${data.level}</div>
            </div>
            <div class="profile-main-info">
                <div class="player-name">${data.username} ${clanHtml}</div>
                <div style="margin-bottom:10px;">${statusBadge}</div>
                
                <div style="margin-bottom: 10px;">
                    <span class="rose-stat" title="ได้รับ"><span class="material-icons">favorite</span> ${data.receivedRosesCount?.toLocaleString() || 0}</span>
                    <span class="rose-stat" title="ส่งให้ผู้อื่น"><span class="material-icons">volunteer_activism</span> ${data.sentRosesCount?.toLocaleString() || 0}</span>
                </div>

                <div class="player-bio">"${formatMessage(data.personalMessage)}"</div>
                <div style="font-size:0.8rem; color:#94a3b8; margin-top:10px;">
                    ID: ${data.id} <br>
                    เข้าร่วมเมื่อ: ${formatDateThai(data.creationTime)} | ออนไลน์ล่าสุด: ${formatDateThai(data.lastOnline)}
                </div>
            </div>
        </div>

        <h3 class="stats-section-title"><span class="material-icons">analytics</span> สถิติการเล่น (Statistics)</h3>
        <div class="stats-grid-container">
            <div class="stat-box">
                <h4 class="box-title">ภาพรวม (Overview)</h4>
                <div class="stat-row"><span class="stat-label">จำนวนเกม</span><span class="stat-val">${total.toLocaleString()} รอบ</span></div>
                <div class="stat-row"><span class="stat-label">เวลาเล่นรวม</span><span class="stat-val">${((stats.totalPlayTimeInMinutes||0)/60).toFixed(1)} ชม.</span></div>
                <div class="progress-container">
                    <div class="progress-label"><span>อัตราชนะ</span><span>${winRate}%</span></div>
                    <div class="progress-track"><div class="progress-fill fill-win" style="width:${winRate}%"></div></div>
                </div>
                
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #eee;">
                    <span class="stat-label" style="display:block; margin-bottom:5px;">บทบาทที่เล่นบ่อยสุด:</span>
                    <div class="achievements-list">${topRoles}</div>
                </div>
            </div>

            <div class="stat-box">
                <h4 class="box-title">โหมดจัดอันดับ (Ranked Season)</h4>
                ${rankTotal > 0 ? `
                    <div class="stat-row"><span class="stat-label">คะแนน / สูงสุด</span><span class="stat-val">${rankSkill} / ${rankMaxSkill}</span></div>
                    <div class="stat-row"><span class="stat-label">อันดับสูงสุด</span><span class="stat-val" style="color:var(--warning)">${bestRank}</span></div>
                    <div class="stat-row"><span class="stat-label">ชนะ / แพ้</span><span class="stat-val"><span class="value-green">${data.rankedWins}</span> / <span class="value-red">${data.rankedLosses}</span></span></div>
                    <div class="progress-container">
                        <div class="progress-label"><span>อัตราชนะ</span><span>${rankWR}%</span></div>
                        <div class="progress-track"><div class="progress-fill fill-solo" style="width:${rankWR}%"></div></div>
                    </div>
                ` : '<div style="padding:20px; text-align:center; color:#ccc">ไม่มีข้อมูลในโหมดจัดอันดับ</div>'}
            </div>

            <div class="stat-box">
                <h4 class="box-title">ประสิทธิภาพแบ่งตามฝ่าย (Performance)</h4>
                <div class="progress-container" style="margin-bottom:8px">
                    <div class="progress-label"><span>ฝ่ายหมู่บ้าน (Village)</span><span>${vilWR}%</span></div>
                    <div class="progress-track"><div class="progress-fill fill-win" style="width:${vilWR}%"></div></div>
                </div>
                <div class="progress-container">
                    <div class="progress-label"><span>ฝ่ายหมาป่า (Werewolf)</span><span>${wolfWR}%</span></div>
                    <div class="progress-track"><div class="progress-fill fill-wolf" style="width:${wolfWR}%"></div></div>
                </div>
                <div class="progress-container">
                    <div class="progress-label"><span>โหวต / ฉายเดี่ยว</span><span>${voteWR}%</span></div>
                    <div class="progress-track"><div class="progress-fill fill-solo" style="width:${voteWR}%"></div></div>
                </div>
            </div>
        </div>

        ${roles.length ? `<h3 class="stats-section-title"><span class="material-icons">style</span> การ์ดบทบาท (${roles.length})</h3><div class="role-cards-wrapper">${cardsHtml}</div>` : ''}

        <div class="api-console" style="margin-top:30px; border-top:1px dashed #e2e8f0; padding-top:20px;">
            <details>
                <summary style="cursor:pointer; background:#f1f5f9; padding:10px; border-radius:8px; font-weight:600; color:#475569;">
                    <span class="material-icons" style="vertical-align:bottom; margin-right:5px; font-size:20px;">data_object</span>
                    🔧 ข้อมูลดิบของผู้เล่น (Raw JSON Data)
                </summary>
                <pre style="background:#1e1e1e; color:#a5d6ff; padding:15px; border-radius:8px; margin-top:10px; overflow:auto; max-height:400px; font-size:0.85rem; font-family:monospace;">${rawJson}</pre>
            </details>
        </div>
    `;
}

// **********************************************
// 8. CLAN MANAGER LOGIC
// **********************************************

async function fetchMyClan() {
    if (!localStorage.getItem('wolvesville_api_key')) return showCustomAlert('แจ้งเตือน', 'กรุณาใส่ API Key ในหน้าตั้งค่าก่อนครับ');
    
    stopClanPolling();
    
    // Initial Loader
    clanContentContainer.innerHTML = `
        <div class="loading-container">
            <div style="font-size:24px; margin-bottom:10px;">🛡️</div>
            <h3 style="color:#1e293b; margin:0;">กำลังดึงข้อมูลแคลนของฉัน...</h3>
            <div class="loading-bar-track">
                <div class="loading-bar-fill" style="width: 5%;"></div>
            </div>
            <div class="loading-text">กำลังเตรียมระบบ...</div>
        </div>
    `;
    
    const authRes = await fetchData('/clans/authorized');
    if (authRes.error || !authRes.length) {
        clanContentContainer.innerHTML = '<div style="text-align:center; color:red; padding:30px;">❌ บัญชีนี้ไม่ได้เข้าร่วมแคลนใดเลย</div>';
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
    
    clanContentContainer.innerHTML = `
        <div class="loading-container">
            <div style="font-size:24px; margin-bottom:10px;">🔍</div>
            <h3 style="color:#1e293b; margin:0;">กำลังค้นหาแคลน...</h3>
            <div class="loading-bar-track">
                <div class="loading-bar-fill" style="width: 10%;"></div>
            </div>
            <div class="loading-text">กำลังค้นหาชื่อ "${name}"...</div>
        </div>
    `;
    
    const searchRes = await fetchData(`/clans/search?name=${encodeURIComponent(name)}`);
    if (searchRes.error || !searchRes.length) {
        clanContentContainer.innerHTML = '<div style="text-align:center; color:red; padding:20px;">❌ ไม่พบแคลนที่ค้นหา</div>';
        return;
    }
    
    await fetchClanData(searchRes[0].id, false);
}

function startClanPolling(clanId, isMyClan) {
    if (clanPollingInterval) clearInterval(clanPollingInterval);
    
    currentViewingClanId = clanId;
    isCurrentViewMyClan = isMyClan;
    isFirstRender = true;

    console.log('[Auto-Update] Enabled (60s interval for everything).');
    
    clanPollingInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
            fetchClanData(clanId, isMyClan, true); 
        }
    }, 60000); 
}

function stopClanPolling() {
    if (clanPollingInterval) {
        clearInterval(clanPollingInterval);
        clanPollingInterval = null;
    }
    currentViewingClanId = null;
    isFirstRender = true;
}

async function fetchClanData(clanId, isMyClan = false, isBackground = false) {
    const totalSteps = isMyClan ? 14 : 9; 
    let currentStep = 0;

    const updateProgress = (text) => {
        if(!isBackground) {
            currentStep++;
            const percent = Math.min(100, Math.round((currentStep / totalSteps) * 100));
            
            const loaderHtml = `
                <div class="loading-container">
                    <div style="font-size:24px; margin-bottom:10px; animation: bounce 1s infinite;">🛡️</div>
                    <h3 style="color:#1e293b; margin:0;">กำลังโหลดข้อมูลแคลน...</h3>
                    <div class="loading-bar-track">
                        <div class="loading-bar-fill" style="width: ${percent}%;"></div>
                    </div>
                    <div class="loading-text">${text} (${percent}%)</div>
                </div>
            `;
            clanContentContainer.innerHTML = loaderHtml;
        }
    };

    if(!isBackground) {
        isFirstRender = true;
        updateProgress('กำลังเตรียมระบบ...');
    }
    
    await Promise.all([
        fetchAndCacheEmojis(),
        fetchAndCacheAvatarItems() 
    ]);
    
    updateProgress('กำลังดึงข้อมูลทั่วไป...');
    const info = await fetchData(`/clans/${clanId}/info`);
    if (info.error) {
        if(!isBackground) clanContentContainer.innerHTML = `<div style="text-align:center; color:red; padding:30px;">ข้อผิดพลาด: ${info.message}</div>`;
        return;
    }

    updateProgress('กำลังดึงรายชื่อสมาชิก...');
    let membersRaw = await fetchData(`/clans/${clanId}/members/detailed`);
    if (membersRaw.error) {
         membersRaw = await fetchData(`/clans/${clanId}/members`);
    }
    
    if (!membersRaw.error && Array.isArray(membersRaw)) {
        clanMembersDetailedMap.clear();
        membersRaw.forEach(m => clanMembersDetailedMap.set(m.playerId, m));
    }
    
    updateProgress('กำลังดึงข้อมูลเควสที่เปิดอยู่...');
    const quests = await fetchData(`/clans/${clanId}/quests/active`);

    updateProgress('กำลังดึงประวัติแชทแคลน...');
    const chat = await fetchData(`/clans/${clanId}/chat`);

    updateProgress('กำลังดึงบันทึกกิจกรรม (Logs)...');
    const logs = await fetchData(`/clans/${clanId}/logs`);

    updateProgress('กำลังดึงบัญชีแคลน (Ledger)...');
    const ledger = await fetchData(`/clans/${clanId}/ledger`);

    updateProgress('กำลังดึงประวัติเควส...');
    const history = await fetchData(`/clans/${clanId}/quests/history`);

    updateProgress('กำลังดึงประกาศแคลน...');
    const announcements = await fetchData(`/clans/${clanId}/announcements`);

    let blockedMembers = { error: true };
    let availableQuests = { error: true };
    let votesData = { error: true }; // เอาระบบโหวตกลับมาใส่ตรงนี้

    if(isMyClan) {
        updateProgress('กำลังดึงรายชื่อที่ถูกบล็อค...');
        const blocklistRes = await fetchData(`/clans/${clanId}/blocklist`);

        if (!blocklistRes.error && Array.isArray(blocklistRes)) {
            const extractId = (item) => {
                if (typeof item === 'string') return item;
                return item.playerId || item.id || item.targetPlayerId;
            };
            
            const playersData = [];
            updateProgress('กำลังประมวลผลข้อมูลคนถูกบล็อค...');
            for (const item of blocklistRes.slice(0, 50)) {
                const pid = extractId(item);
                if (pid) {
                    const pData = await fetchData(`/players/${pid}`);
                    playersData.push(pData);
                } else {
                    playersData.push({ error: true });
                }
            }
            
            blockedMembers = playersData.map((p, idx) => {
                const originalItem = blocklistRes[idx];
                const originalId = extractId(originalItem) || 'ไม่ทราบ ID';
                if (p.error) return { id: originalId, username: 'ไม่ทราบชื่อ', error: true };
                return p;
            });
        } else {
             blockedMembers = blocklistRes;
        }

        updateProgress('กำลังดึงข้อมูลเควสที่มีให้ซื้อ...');
        availableQuests = await fetchData(`/clans/${clanId}/quests/available`);
        if (Array.isArray(availableQuests)) {
            availableQuests.forEach(q => questDetailsCache.set(q.id, q));
        }

        updateProgress('กำลังดึงผลการโหวตเควส...');
        votesData = await fetchData(`/clans/${clanId}/quests/votes`);
        clanVotesCache = votesData;
    }

    let members = membersRaw;
    if (!membersRaw.error && Array.isArray(membersRaw)) {
        updateProgress(`กำลังโหลดรูปโปรไฟล์ (${membersRaw.length} คน)...`);
        const membersList = [];
        for (const m of membersRaw) {
            if (playerAvatarCache.has(m.playerId)) {
                membersList.push({ ...m, ...playerAvatarCache.get(m.playerId) });
            } else {
                const detail = await fetchData(`/players/${m.playerId}`);
                if (!detail.error) {
                    playerAvatarCache.set(m.playerId, detail);
                    membersList.push({ ...m, ...detail });
                } else {
                    membersList.push(m);
                }
            }
        }
        members = membersList;
    }

    if (Array.isArray(members)) {
        members.forEach(m => {
            clanMembersCache[m.playerId] = m.username;
        });
    }

    let participatingMemberCount = 0;
    if (Array.isArray(members)) {
        participatingMemberCount = members.filter(m => m.participateInClanQuests).length;
    }
    currentParticipatingCount = participatingMemberCount;

    updateProgress('กำลังสร้างหน้าแดชบอร์ด...');
    setTimeout(() => {
        // ส่ง votesData เข้าไปใน renderClanDashboard
        renderClanDashboard(info, members, quests, chat, logs, ledger, history, announcements, blockedMembers, availableQuests, votesData, clanId, isMyClan, isBackground, participatingMemberCount);
    }, 500); 
}

function renderClanDashboard(info, members, quests, chat, logs, ledger, history, announcements, blockedMembers, availableQuests, votesData, clanId, canEdit = false, isBackground = false, participatingMemberCount = 0) { 
    const memberMap = {};
    if (!members.error && Array.isArray(members)) {
        members.forEach(m => {
            memberMap[m.playerId] = m.username;
        });
    }

    // 1. ACTIVE QUEST HTML
    let questsHtml = '<div style="text-align:center; color:#ccc; padding:20px;">ยังไม่มีเควสที่กำลังดำเนินการในตอนนี้</div>';
    let hasActiveQuest = false;
    
    if (!quests.error && (quests.quest || (quests.id && (quests.promoImageUrl || quests.rewards)))) {
        hasActiveQuest = true;
        const qData = quests.quest ? quests : { quest: quests, ...quests }; 
        const qInfo = qData.quest || qData; 

        // -------------------------------------------------------------
        // ส่วนที่แก้ไข: สูตรคำนวณตัดทีละช่องและเป้าหมาย XP ใหม่
        // -------------------------------------------------------------
        const activeParticipants = members.filter(m => m.participateInClanQuests).length;
        const isGemQuest = qInfo.purchasableWithGems === true;

        // คำนวณ XP เป้าหมายต่อด่าน
        // เควสเพชร (8 ด่าน): 1125 + (175 * จำนวนคน)
        // เควสปกติ (6 ด่าน): 2000 + (500 * จำนวนคน)
        const targetXp = isGemQuest 
            ? (1125 + (175 * activeParticipants)) 
            : (2000 + (500 * activeParticipants));

        const currentTierIndex = (qData.tier !== undefined ? qData.tier : (qInfo.tier || 0));
        const displayTier = currentTierIndex + 1;

        // XP รวมทั้งหมดที่ API ส่งมา (มันจะบวกสะสมไปเรื่อยๆ ทุกด่าน)
        let totalXp = qData.xp !== undefined ? qData.xp : (qInfo.xp || 0);
        
        // หักลบ XP ของด่านที่ผ่านมาแล้ว เพื่อให้เหลือแค่เศษของด่านปัจจุบัน
        let currentXpInTier = totalXp - (currentTierIndex * targetXp);

        // ป้องกันกรณีคำนวณผิดพลาดแล้วค่าติดลบ หรือค่าเกินเป้าหมาย (กันหลอดทะลุ)
        if (currentXpInTier < 0) currentXpInTier = 0;
        if (currentXpInTier > targetXp) currentXpInTier = targetXp;

        const actionCost = 300 + (30 * activeParticipants);

        let rewardsTrackHtml = '';
        if (qInfo.rewards && Array.isArray(qInfo.rewards)) {
            const totalSegments = Math.max(1, qInfo.rewards.length - 1);
            
            // คำนวณความยาวหลอด Progress Bar หลัก
            let relativeProgress = currentTierIndex + (currentXpInTier / targetXp);
            if (relativeProgress > totalSegments) relativeProgress = totalSegments;
            const trackWidthPercent = Math.min(100, (relativeProgress / totalSegments) * 100);

            rewardsTrackHtml = `
                <div class="battle-pass-hub">
                    <div class="xp-progress-wrapper">
                        <div class="xp-progress-fill" style="width:${trackWidthPercent}%;"></div>
                    </div>
                    <div class="battle-pass-track">
            `;
            
            qInfo.rewards.forEach((r, idx) => {
                let imgUrl = 'https://via.placeholder.com/60?text=?';
                if(r.type === 'AVATAR_ITEM') {
                    const item = avatarItemsCache.get(r.avatarItemId);
                    if (item && item.imageUrl) imgUrl = item.imageUrl;
                    else imgUrl = `https://cdn.wolvesville.com/avatarItems/png/256x/${r.avatarItemId}.png`;
                }
                else if(r.type === 'GOLD') imgUrl = EMBEDDED_ICONS.GOLD;
                else if(r.type === 'GEM' || r.type === 'GEMS') imgUrl = EMBEDDED_ICONS.GEM;
                else if(r.type === 'ROSE' || r.type === 'ROSES' || r.type === 'ROSE_PACKAGE') imgUrl = EMBEDDED_ICONS.ROSE;
                
                let statusClass = '';
                if (idx < currentTierIndex) statusClass = 'completed-tier';
                else if (idx === currentTierIndex) statusClass = 'active-tier';

                rewardsTrackHtml += `
                    <div class="reward-step ${statusClass}">
                        <div class="reward-icon-box">
                            ${idx === currentTierIndex ? `<div class="xp-label-floating">${currentXpInTier.toLocaleString()} / ${targetXp.toLocaleString()} XP</div>` : ''}
                            <img src="${imgUrl}" referrerpolicy="no-referrer" onerror="this.src='${EMBEDDED_ICONS.UNKNOWN}'" style="background:#f1f5f9; border-radius:10px;">
                            ${r.amount > 1 ? `<span class="reward-badge">x${r.amount}</span>` : ''}
                        </div>
                        <div class="tier-label">ด่านที่ ${idx + 1}</div>
                    </div>
                `;
            });
            rewardsTrackHtml += '</div></div>';
        }

        let actionsHtml = '';
        if (canEdit) {
            // เช็คว่า XP ด่านปัจจุบันเต็มหรือยัง ถ้าเต็มแล้วให้แสดงปุ่ม Skip Wait
            const isTierFinished = currentXpInTier >= targetXp;
            
            actionsHtml = `
                <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:15px;">
                    <button onclick="window.claimQuestExtraTime('${clanId}')" title="ขยายเวลาทำเควส" style="background:#3b82f6; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.85rem; display:flex; align-items:center; gap:5px;">
                        <span class="material-icons" style="font-size:18px;">alarm_add</span> 
                        เพิ่มเวลา (<span class="dynamic-action-price">${actionCost}</span>)
                    </button>
                    ${isTierFinished ? `
                    <button onclick="window.skipQuestWaitingTime('${clanId}')" title="ข้ามการรอคอย" style="background:#8b5cf6; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.85rem; display:flex; align-items:center; gap:5px;">
                        <span class="material-icons" style="font-size:18px;">fast_forward</span> 
                        ข้ามเวลาการรอ (<span class="dynamic-action-price">${actionCost}</span>)
                    </button>
                    ` : ''}
                    <button onclick="window.cancelActiveQuest('${clanId}')" title="ยกเลิกเควสนี้" style="background:#ef4444; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.85rem; display:flex; align-items:center; gap:5px;">
                        <span class="material-icons" style="font-size:18px;">cancel</span> ยกเลิกเควส
                    </button>
                </div>
            `;
        }

        // ADD PARTICIPANTS HTML HERE
        let participantsHtml = '';
        if (qData.participants && Array.isArray(qData.participants) && qData.participants.length > 0) {
            const sortedParts = [...qData.participants].sort((a, b) => b.xp - a.xp);
            const listHtml = sortedParts.map((p, index) => {
                const medal = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : `${index + 1}.`));
                const safeUsername = escapeJsString(p.username || 'ไม่ทราบชื่อ');
                return `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px dashed #e2e8f0; font-size:0.9rem;">
                        <div>
                            <span style="display:inline-block; width:24px; color:#64748b; font-weight:bold; text-align:center;">${medal}</span>
                            <strong style="cursor:pointer; color:var(--primary-color); margin-left:5px;" onclick="window.goToPlayerSearch('${safeUsername}')">${p.username || 'ไม่ทราบชื่อ'}</strong>
                        </div>
                        <span style="color:#16a34a; font-weight:bold; background:#dcfce7; padding:2px 8px; border-radius:12px; font-size:0.8rem;">
                            ${(p.xp || 0).toLocaleString()} XP
                        </span>
                    </div>
                `;
            }).join('');
            
            participantsHtml = `
                <div style="margin-top:25px; border-top:1px dashed #e2e8f0; padding-top:15px;">
                    <h5 style="margin:0 0 10px 0; color:#475569; display:flex; align-items:center; font-size:1rem;">
                        <span class="material-icons" style="font-size:20px; margin-right:5px; color:#3b82f6;">leaderboard</span> 
                        ผู้เข้าร่วมสูงสุด (Top Participants)
                    </h5>
                    <div style="max-height:200px; overflow-y:auto; padding-right:5px; border:1px solid #f1f5f9; border-radius:8px; padding:10px; background:#f8fafc;" class="clan-scroll-area">
                        ${listHtml}
                    </div>
                </div>
            `;
        }

        questsHtml = `
            <div class="active-quest-container">
                <div class="active-quest-banner" style="background-image: url('${qInfo.promoImageUrl || 'https://via.placeholder.com/800x300'}')">
                    <div class="active-quest-overlay">
                        <h2 class="active-quest-title-lg" style="color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">${qInfo.title || 'เควสแคลน'} (ด่านที่ ${displayTier})</h2>
                        <div class="active-quest-meta-lg">
                            <span class="material-icons" style="font-size:16px;">schedule</span> หมดเวลา: ${formatDateThai(qData.tierEndTime || qInfo.tierEndTime)}
                        </div>
                    </div>
                </div>
                
                <div class="active-quest-body">
                    <h4 style="margin:0; color:#475569; font-size:0.9rem; display:flex; align-items:center;">
                        <span class="material-icons" style="font-size:18px; margin-right:5px; color:#f59e0b;">emoji_events</span> 
                        ความคืบหน้าของรางวัลเควส
                    </h4>

                    ${rewardsTrackHtml}
                    ${actionsHtml}
                    ${participantsHtml}
                </div>
            </div>
        `;
    } 

    // 2. AVAILABLE QUESTS
    let availableQuestsHtml = '';
    if (canEdit && !availableQuests.error && Array.isArray(availableQuests) && availableQuests.length > 0) {
        
        let shuffleVotesHtml = '';
        if (votesData && !votesData.error && votesData.shuffleVotes && Array.isArray(votesData.shuffleVotes) && votesData.shuffleVotes.length > 0) {
             const voterIds = votesData.shuffleVotes;
             const voterNames = voterIds.map(vid => memberMap[vid] || 'ไม่ทราบชื่อ').join(', ');
             shuffleVotesHtml = `
                <div style="font-size:0.75rem; color:#64748b; margin-top:4px; text-align:right; background:#f1f5f9; padding:2px 8px; border-radius:4px; display:inline-block;">
                    <span style="font-weight:bold;">🗳️ โหวตสุ่มเควส (${voterIds.length}):</span> ${voterNames}
                </div>
             `;
        }

        availableQuestsHtml = `
        <div style="margin:30px 0 15px 0; border-top:1px dashed #e2e8f0; padding-top:20px;">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <h3 style="margin:0; color:#334155; font-size:1.1rem; align-self:center;">🛒 เควสที่มีให้ซื้อ (Available Quests)</h3>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:5px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${getQuestResetTimeDisplay()}
                        
                        <button onclick="window.viewAllQuests()" style="background:#3b82f6; color:white; border:none; padding:6px 12px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.85rem; display:flex; align-items:center; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                            <span class="material-icons" style="font-size:18px; margin-right:5px;">menu_book</span> สารานุกรมเควส
                        </button>

                        <button onclick="window.shuffleClanQuests('${clanId}')" style="background:#f59e0b; color:white; border:none; padding:6px 12px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.85rem; display:flex; align-items:center; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                            <span class="material-icons" style="font-size:18px; margin-right:5px;">shuffle</span> สุ่มใหม่ (500 💰)
                        </button>
                    </div>
                    ${shuffleVotesHtml}
                </div>
            </div>
        </div>
        `;
        
        availableQuestsHtml += '<div class="quest-grid">';
        
        availableQuestsHtml += availableQuests.map(q => {
            const isGem = q.purchasableWithGems;
            const currencyIcon = isGem ? 'diamond' : 'monetization_on';
            const currencyColor = isGem ? '#d8b4fe' : '#fcd34d';
            
            let buyCost = 0;
            if (isGem) {
                buyCost = 350 + (135 * participatingMemberCount);
            } else {
                buyCost = 2000 + (400 * participatingMemberCount);
            }

            let voteHtml = '';
            if (votesData && !votesData.error && votesData.votes && votesData.votes[q.id]) {
                const voterIds = votesData.votes[q.id]; 
                const voteCount = voterIds.length;
                if (voteCount > 0) {
                    voteHtml = `
                        <div class="quest-votes-badge">
                            <span class="material-icons" style="font-size:14px;">how_to_vote</span> ${voteCount}
                        </div>
                    `;
                }
            }

            const rewardCount = q.rewards ? q.rewards.length : 0;
            const safeTitle = (q.title || 'เควส').replace(/'/g, "\\'");
            
            let claimBtn = '';
            if (!hasActiveQuest) {
                claimBtn = `
                    <button onclick="event.stopPropagation(); window.claimClanQuest('${clanId}', '${q.id}', '${safeTitle}')" 
                            style="background:#22c55e; color:white; border:none; padding:6px 16px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.9rem; display:flex; align-items:center; margin-top:10px; width:100%; justify-content:center;">
                        <span class="material-icons" style="font-size:18px; margin-right:4px;">shopping_cart</span> ซื้อเควส
                    </button>
                `;
            }

            // CLEAN WHITE CARD (WITH VOTES BADGE)
            return `
                <div class="quest-card-large" onclick="window.showQuestModal('${q.id}')">
                    <img src="${q.promoImageUrl}" referrerpolicy="no-referrer" class="quest-card-large-img">
                    ${voteHtml}
                    <div class="quest-card-footer" style="flex-direction:column; align-items:stretch;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div class="quest-price-tag" style="color: ${currencyColor}; border: 1px solid #e2e8f0; background: #f8fafc; padding: 4px 8px; border-radius: 8px; display: inline-flex; align-items: center; gap: 4px; font-weight: bold; font-size: 0.85rem;">
                                <span class="material-icons" style="font-size:16px;">${currencyIcon}</span>
                                <span class="dynamic-buy-price" data-currency="${isGem?'gem':'gold'}">${buyCost.toLocaleString()}</span>
                            </div>
                            <div style="font-size:0.8rem; font-weight:bold; color:#64748b; background:#f1f5f9; padding:4px 8px; border-radius:6px;">
                                ${rewardCount} รางวัล
                            </div>
                        </div>
                        ${claimBtn}
                    </div>
                </div>
            `;
        }).join('');
        
        availableQuestsHtml += '</div>';
    }

    // 3. ANNOUNCEMENTS
    let announceSectionHtml = '';
    let announceListContent = ''; 
    
    if (canEdit) {
        const formHtml = `
            <div style="background:white; padding:15px; border-radius:12px; border:1px solid #e2e8f0; margin-bottom:20px; box-shadow: var(--shadow-sm);">
                <div style="font-weight:bold; color:var(--primary-color); margin-bottom:10px; display:flex; align-items:center;">
                    <span class="material-icons" style="margin-right:5px;">campaign</span> เขียนประกาศแคลน
                </div>
                <div style="display:flex; gap:10px;">
                    <textarea id="clan-announcement-input" placeholder="พิมพ์ข้อความประกาศของคุณที่นี่..." style="flex:1; padding:10px; border:1px solid #cbd5e1; border-radius:6px; resize:vertical; min-height:60px; font-family:inherit;"></textarea>
                    <button onclick="window.sendClanAnnouncement('${clanId}')" style="background:var(--primary-color); color:white; border:none; padding:0 20px; border-radius:6px; cursor:pointer; align-self:flex-end; height:40px; font-weight:bold;">โพสต์</button>
                </div>
            </div>
        `;

        if (!announcements.error && Array.isArray(announcements) && announcements.length > 0) {
             announceListContent = announcements.map(a => `
                <div style="background:#fefce8; border-left:4px solid #eab308; padding:15px; border-radius:8px; box-shadow:var(--shadow-sm); margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <strong style="color:#854d0e;">${a.author || a.playerUsername || 'หัวหน้าแคลน'}</strong>
                        <span style="font-size:0.75rem; color:#a16207;">${formatDateThai(a.timestamp || a.creationTime)}</span>
                    </div>
                    <div style="color:#4b5563; font-size:0.95rem;">${linkify(a.content || a.msg || a.message)}</div>
                </div>
            `).join('');
        } else {
            announceListContent = '<div style="color:#94a3b8; text-align:center; padding:10px;">ยังไม่มีประกาศในแคลนนี้ครับ</div>';
        }

        announceSectionHtml = `
            ${formHtml}
            <div style="margin-bottom:20px;">
                <h3 class="stats-section-title"><span class="material-icons">history_edu</span> ประกาศล่าสุด</h3>
                <div id="clan-announcements-container">
                    ${announceListContent}
                </div>
            </div>
        `;
    }

    // 4. MEMBERS
    let membersHtml = '<div style="text-align:center; padding:20px;">ไม่พบข้อมูลสมาชิก</div>';
    if (!members.error && Array.isArray(members)) {
        membersHtml = members.map(m => {
            let statusColor = '#ccc';
            let statusText = m.playerStatus || m.status || 'OFFLINE';
            if (statusText === 'ONLINE' || statusText === 'DEFAULT') { statusColor = 'var(--success)'; statusText = 'ออนไลน์'; }
            else if (statusText === 'PLAY') { statusColor = '#1e40af'; statusText = 'กำลังเล่น'; }
            else if (statusText === 'DND' || statusText === 'DO_NOT_DISTURB') { statusColor = '#ef4444'; statusText = 'ห้ามรบกวน'; }
            else if (statusText === 'OFFLINE') { statusColor = '#ccc'; statusText = 'ออฟไลน์'; }

            const avatar = m.equippedAvatar?.url || (m.profileIconId ? `https://cdn-avatars.wolvesville.com/${m.profileIconId}` : 'https://via.placeholder.com/40');
            const avatarElemId = `member-avatar-${m.playerId}`;

            let roleBadge = '';
            let cardClass = '';
            if (info.leaderId === m.playerId) { roleBadge = '<span class="role-badge leader">หัวหน้า</span>'; cardClass = 'leader'; }
            else if (m.isCoLeader) { roleBadge = '<span class="role-badge coleader">รองหัวหน้า</span>'; cardClass = 'coleader'; }

            const isQuest = m.participateInClanQuests;
            let questIconHtml = '';
            if (canEdit) {
                questIconHtml = `
                    <span class="material-icons quest-inline-icon clickable ${isQuest ? 'on' : 'off'}" 
                        onclick="event.stopPropagation(); window.toggleQuestFromList('${clanId}', '${m.playerId}', ${isQuest}, this)"
                        title="เปิด/ปิดการเข้าร่วมเควส">
                        ${isQuest ? 'check_circle' : 'cancel'}
                    </span>
                `;
            } else {
                questIconHtml = `
                    <span class="material-icons quest-inline-icon ${isQuest ? 'on' : 'off'}" title="สถานะการทำเควส">
                        ${isQuest ? 'check_circle' : 'cancel'}
                    </span>
                `;
            }

            const safeFlair = escapeJsString(m.flair);
            let flairHtml = '';
            const displayFlair = m.flair ? m.flair : '<span style="opacity:0.5; font-style:italic;">ไม่มีฉายา</span>';
            
            if (canEdit) {
                flairHtml = `
                    <span class="member-flair flair-editable" 
                        onclick="event.stopPropagation(); window.editFlairFromList('${clanId}', '${m.playerId}', '${safeFlair}')"
                        title="คลิกเพื่อแก้ไขฉายา">
                        ${displayFlair} <span class="material-icons" style="font-size:12px; vertical-align:middle; opacity:0.5;">edit</span>
                    </span>
                `;
            } else {
                flairHtml = m.flair ? `<span class="member-flair">${m.flair}</span>` : '';
            }

            let adminActionsHtml = '';
            if (canEdit && m.playerId !== info.leaderId) {
                adminActionsHtml = `
                    <span class="material-icons action-icon kick-icon" 
                        onclick="event.stopPropagation(); window.kickMemberFromList('${clanId}', '${m.playerId}', '${m.username}')"
                        title="เตะออกจากแคลน">
                        person_remove
                    </span>
                    <span class="material-icons action-icon block-icon" 
                        onclick="event.stopPropagation(); window.blockMemberFromList('${clanId}', '${m.playerId}', '${m.username}')"
                        title="บล็อคผู้เล่น">
                        block
                    </span>
                `;
            }

            const safeUsername = escapeJsString(m.username);

            return `
                <div class="member-card ${cardClass}" onclick="fetchMemberDetails('${clanId}', '${m.playerId}', ${canEdit})" title="คลิกเพื่อดูรายละเอียด">
                    <div id="${avatarElemId}" class="member-avatar" style="background-image: url('${avatar}'); background-size: cover;"></div>
                    <div class="member-details">
                        <div style="display:flex; align-items:center; flex-wrap:wrap; gap:5px;">
                            <span style="font-weight:bold; font-size:1rem; color:#1e293b; cursor:pointer;" 
                                  onclick="event.stopPropagation(); window.goToPlayerSearch('${safeUsername}')" 
                                  title="ค้นหาโปรไฟล์">
                                ${m.username || 'ไม่ทราบชื่อ'}
                            </span> 
                            ${roleBadge}
                            ${questIconHtml}
                            ${adminActionsHtml}
                        </div>
                        <div class="member-meta">
                            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${statusColor};"></span>
                            ${statusText}
                            ${flairHtml}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 5. CHAT
    let chatHtml = '<div style="padding:15px; color:#ccc;">(คุณไม่มีสิทธิ์เข้าถึงแชทแคลน)</div>';
    if (!chat.error && Array.isArray(chat)) {
        chatHtml = chat.reverse().map(msg => {
            const isBot = !!msg.playerBotId;
            const username = isBot ? `[บอท] ${msg.playerBotOwnerUsername}` : (msg.player?.username || memberMap[msg.playerId] || 'ไม่ทราบชื่อ');
            const botStyle = isBot ? 'background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:4px;' : '';
            
            let content = '';
            if (msg.emojiId) {
                const emojiData = globalEmojiMap.get(msg.emojiId);
                const emojiUrl = emojiData?.preview || `https://cdn.wolvesville.com/emojis/previews/emoji_${msg.emojiId}.png`; 
                content = `<img src="${emojiUrl}" referrerpolicy="no-referrer" class="chat-emoji-img" alt="Emoji" loading="lazy" onerror="this.style.display='none';this.insertAdjacentHTML('afterend', '[${msg.emojiId}]')">`;
            } else {
                content = linkify(msg.msg || '');
            }

            const safeUsername = escapeJsString(username);
            const nameStyle = isBot ? `color:var(--primary-color); ${botStyle}` : `color:var(--primary-color); ${botStyle}; cursor:pointer; text-decoration:underline;`;
            const clickAttr = isBot ? '' : `onclick="window.goToPlayerSearch('${safeUsername}')"`;

            return `
            <div style="margin-bottom:8px; border-bottom:1px solid #f1f5f9; padding-bottom:5px;">
                <strong style="${nameStyle}" ${clickAttr}>${username}</strong>: 
                <span style="color:${msg.isSystem?'#64748b':'#334155'}">${content}</span>
                <div style="font-size:0.7rem; color:#94a3b8;">${formatDateThai(msg.creationTime || msg.date)}</div>
            </div>
        `}).join('');
    }

    // 6. LOGS
    let logsHtml = '<div style="padding:15px; color:#ccc;">(คุณไม่มีสิทธิ์ในการดูบันทึกกิจกรรม)</div>';
    if (!logs.error && Array.isArray(logs)) {
        logsHtml = logs.map(l => `
            <div style="margin-bottom:5px; font-size:0.85rem;">
                <span style="color:#64748b;">[${formatDateThai(l.creationTime)}]</span> 
                <strong>${l.playerUsername || 'ระบบ'}</strong>: ${l.action || l.type} 
                ${l.targetPlayerUsername ? `-> ${l.targetPlayerUsername}` : ''}
            </div>
        `).join('');
    }

    // 7. LEDGER
    let ledgerHtml = '<div style="padding:15px; color:#ccc;">(คุณไม่มีสิทธิ์ในการดูบัญชีแคลน)</div>';
    if (!ledger.error && Array.isArray(ledger)) {
        ledgerHtml = '<div class="ledger-list">';
        ledgerHtml += ledger.slice(0, 50).map(l => `
            <div class="ledger-item">
                <div class="ledger-meta">
                    <strong>${l.playerUsername || 'ระบบ'}</strong>
                    <span class="ledger-time">${formatDateThai(l.creationTime)}</span>
                </div>
                <div class="ledger-amount ${l.gold > 0 || l.gems > 0 ? 'income' : 'expense'}">
                    ${l.gold ? `<span>${l.gold > 0 ? '+' : ''}${l.gold.toLocaleString()} ทอง</span>` : ''}
                    ${l.gems ? `<span>${l.gems > 0 ? '+' : ''}${l.gems.toLocaleString()} เพชร</span>` : ''}
                </div>
            </div>
        `).join('');
        ledgerHtml += '</div>';
    }

    // 8. HISTORY
    let historyHtml = '<div style="padding:15px; color:#ccc; text-align:center;">ไม่มีเควสที่ค้างรับรางวัล</div>';
    if (!history.error && Array.isArray(history) && history.length > 0) {
        const unclaimedQuests = history.filter(h => !h.claimedTime);
        if (unclaimedQuests.length > 0) { 
            historyHtml = '<div class="history-list">';
            historyHtml += unclaimedQuests.map(h => {
                 const questTitle = h.quest?.title || `เควสด่านที่ ${h.tier}`;
                 const endDate = h.tierEndTime || h.endTime;
                 const questImage = h.quest?.promoImageUrl || 'https://via.placeholder.com/40';

                 let participantsHtml = '';
                 if (h.participants && Array.isArray(h.participants)) {
                     const sortedParts = [...h.participants].sort((a, b) => b.xp - a.xp);
                     participantsHtml = sortedParts.map((p, index) => {
                         const medal = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : ''));
                         const safeUsername = escapeJsString(p.username);
                         return `
                             <div style="display:flex; justify-content:space-between; font-size:0.85rem; padding:4px 0; border-bottom:1px dashed #eee;">
                                 <span>${medal} <strong style="cursor:pointer; text-decoration:underline;" onclick="window.goToPlayerSearch('${safeUsername}')">${p.username || 'ไม่ทราบชื่อ'}</strong></span>
                                 <span style="color:var(--primary-color);">${p.xp.toLocaleString()} XP</span>
                             </div>
                          `;
                      }).join('');
                 }

                 return `
                    <div class="history-item" style="border-left:4px solid var(--warning); display:block;">
                        <div style="display:flex; align-items:center;">
                            <img src="${questImage}" style="width:40px; height:40px; border-radius:4px; margin-right:10px; object-fit:cover;">
                            <div style="display:flex; flex-direction:column; flex:1;">
                                <div style="font-weight:600; color:#334155;">${questTitle}</div>
                                <div style="font-size:0.75rem; color:#94a3b8;">หมดเวลา: ${formatDateThai(endDate)}</div>
                            </div>
                        </div>
                        <details style="margin-top:10px; border-top:1px dashed #eee; padding-top:5px;">
                            <summary style="cursor:pointer; font-size:0.8rem; color:var(--primary-color); font-weight:600; margin-bottom:5px;">รายชื่อผู้เข้าร่วม (Participants)</summary>
                            <div style="max-height:200px; overflow-y:auto; padding-right:5px;">
                                ${participantsHtml || '<div style="color:#ccc; font-size:0.8rem;">ไม่มีข้อมูลผู้เข้าร่วม</div>'}
                            </div>
                        </details>
                    </div>
                 `;
            }).join('');
            historyHtml += '</div>';
        }
    }

    if (isBackground && isFirstRender === false) {
        const chatContainer = document.getElementById('clan-chat-container');
        if (chatContainer && chatContainer.innerHTML !== chatHtml) {
            const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 100;
            chatContainer.innerHTML = chatHtml;
            if (isAtBottom) chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        const announceContainer = document.getElementById('clan-announcements-container');
        if (announceContainer && announceContainer.innerHTML !== announceListContent) {
            announceContainer.innerHTML = announceListContent;
        }

        const membersContainer = document.getElementById('clan-members-list');
        if (membersContainer && membersContainer.innerHTML !== membersHtml) {
            membersContainer.innerHTML = membersHtml;
        }

        const logsContainer = document.getElementById('clan-logs-list');
        if (logsContainer && logsContainer.innerHTML !== logsHtml) {
            logsContainer.innerHTML = logsHtml;
        }

        const questsContainer = document.getElementById('clan-quests-container');
        const questsContent = `${questsHtml}${availableQuestsHtml}`; 
        if (questsContainer && questsContainer.innerHTML !== questsContent) {
            questsContainer.innerHTML = questsContent;
        }

        const timerContainer = document.getElementById('quest-reset-timer');
        if (timerContainer) timerContainer.outerHTML = getQuestResetTimeDisplay();

        const ledgerContainer = document.getElementById('clan-ledger-list');
        if (ledgerContainer && ledgerContainer.innerHTML !== ledgerHtml) {
            ledgerContainer.innerHTML = ledgerHtml;
        }

        const historyContainer = document.getElementById('clan-history-list');
        if (historyContainer && historyContainer.innerHTML !== historyHtml) {
            historyContainer.innerHTML = historyHtml;
        }
        return; 
    }

    isFirstRender = false;
    
    const profileHeader = `
        <div class="profile-header-card" style="border-left-color:#eab308;">
            <div class="profile-avatar-wrapper" style="display:flex; justify-content:center; align-items:center; width:100px; height:100px; background:#fefce8; border-radius:50%; font-size:50px; border:4px solid #eab308;">
                ${info.tag || '🛡️'}
            </div>
            <div class="profile-main-info">
                <h2 class="player-name">[${info.tag}] ${info.name}</h2>
                <div class="clan-wallet">
                    <span class="currency-badge gold"><span class="material-icons" style="font-size:16px; margin-right:5px; color:#d97706;">monetization_on</span> ${info.gold?.toLocaleString() || 0}</span>
                    <span class="currency-badge gems"><span class="material-icons" style="font-size:16px; margin-right:5px; color:#9333ea;">diamond</span> ${info.gems?.toLocaleString() || 0}</span>
                </div>
                <div class="clan-bio">${linkify(info.description || 'ไม่มีคำอธิบาย')}</div>
                <div style="margin-top:15px; font-size:0.85rem; color:#64748b; border-top:1px dashed #e2e8f0; padding-top:10px;">
                    ภาษา: <strong>${info.language}</strong> | จำนวนสมาชิก: <strong>${info.memberCount}</strong> | XP แคลน: <strong>${info.xp?.toLocaleString()}</strong> | สร้างเมื่อ: ${formatDateThai(info.creationTime)}
                </div>
            </div>
        </div>
    `;

    const apiConsole = `
        <div class="api-console" style="margin-top:30px; border-top:1px dashed #e2e8f0; padding-top:20px;">
            <details>
                <summary style="cursor:pointer; background:#f1f5f9; padding:10px; border-radius:8px; font-weight:600; color:#475569;">
                    <span class="material-icons" style="vertical-align:bottom; margin-right:5px; font-size:20px;">data_object</span>
                    🔧 ข้อมูลดิบของแคลน (Raw JSON Data)
                </summary>
                <pre class="json-output">${JSON.stringify({ info, members, quests, chat, logs, ledger, history, announcements }, null, 4)}</pre>
            </details>
        </div>
    `;

    let mainContent = `
        ${announceSectionHtml}

        <div class="stats-grid stats-grid-row2">
            <div>
                <h3 class="stats-section-title" style="display:flex; justify-content:space-between; align-items:center;">
                    <span><span class="material-icons">flag</span> เควสที่กำลังดำเนินการอยู่</span>
                </h3>
                <div id="clan-quests-container">
                    ${questsHtml}
                    ${availableQuestsHtml} 
                </div>
            </div>
            <div>
                <h3 class="stats-section-title" style="display:flex; justify-content:space-between; align-items:center;">
                    <span><span class="material-icons">group</span> สมาชิก (${info.memberCount})</span>
                    <div style="font-size:0.75rem;">
                        เควส: 
                        <button onclick="window.toggleAllQuestParticipation('${clanId}', true)" style="background:#dcfce7; color:#166534; border:1px solid #bbf7d0; padding:2px 8px; border-radius:4px; cursor:pointer; margin-right:5px;">เปิดทุกคน</button>
                        <button onclick="window.toggleAllQuestParticipation('${clanId}', false)" style="background:#fee2e2; color:#991b1b; border:1px solid #fecaca; padding:2px 8px; border-radius:4px; cursor:pointer;">ปิดทุกคน</button>
                    </div>
                </h3>
                <div id="clan-members-list" class="member-list" style="max-height:500px; overflow-y:auto; padding-right:5px;">
                    ${membersHtml}
                </div>
            </div>
        </div>

        <div class="stats-grid stats-grid-row2" style="margin-top:20px; align-items: start;">
            <div style="background:white; padding:20px; border-radius:12px; border:1px solid #e2e8f0;">
                <div style="font-weight:bold; color:var(--primary-color); margin-bottom:10px; font-size:1.1rem;">💬 แชทแคลน (ล่าสุด)</div>
                <div id="clan-chat-container" class="clan-scroll-area">${chatHtml}</div>
                    <div style="display:flex; gap:10px; margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
                    <input type="text" id="clan-chat-input" placeholder="พิมพ์ข้อความ..." style="flex:1; padding:8px; border:1px solid #cbd5e1; border-radius:6px;" onkeydown="if(event.key==='Enter') window.sendClanChatMessage('${clanId}')">
                    <button onclick="window.sendClanChatMessage('${clanId}')" style="background:var(--primary-color); color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer;"><span class="material-icons">send</span></button>
                </div>
            </div>
            <div style="background:white; padding:20px; border-radius:12px; border:1px solid #e2e8f0;">
                <div style="font-weight:bold; color:var(--primary-color); margin-bottom:10px; font-size:1.1rem;">📜 บันทึกกิจกรรมแคลน (Logs)</div>
                <div id="clan-logs-list" class="clan-scroll-area">${logsHtml}</div>
            </div>
        </div>

        <div class="stats-grid stats-grid-row2" style="margin-top:20px; align-items: start;">
            <div style="background:white; padding:20px; border-radius:12px; border:1px solid #e2e8f0;">
                <div style="font-weight:bold; color:var(--primary-color); margin-bottom:10px; font-size:1.1rem;">💰 บัญชีรายรับรายจ่ายแคลน (Ledger)</div>
                <div id="clan-ledger-list" class="clan-scroll-area">${ledgerHtml}</div>
            </div>
            <div style="background:white; padding:20px; border-radius:12px; border:1px solid #e2e8f0;">
                <div style="font-weight:bold; color:var(--primary-color); margin-bottom:10px; font-size:1.1rem;">📜 ประวัติเควส (ที่ยังไม่ได้กดรับรางวัล)</div>
                <div id="clan-history-list" class="clan-scroll-area">${historyHtml}</div>
            </div>
        </div>

        ${canEdit ? `
        <div style="margin-top:20px; background:white; padding:20px; border-radius:12px; border:1px solid #e2e8f0;">
            <h3 class="stats-section-title" style="color:#ef4444;"><span class="material-icons">block</span> ระบบจัดการรายชื่อแบล็คลิสต์ (Blocklist)</h3>
            <div style="display:flex; gap:10px; margin-bottom:15px;">
                <input type="text" id="manual-block-input" placeholder="ระบุ Player ID (UUID) ที่ต้องการบล็อค..." style="flex:1; padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
                <button onclick="window.manualAddToBlocklist('${clanId}')" style="background:#ef4444; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">บล็อคไอดี</button>
            </div>
            <div class="blocklist-grid">
                ${blockedMembers.length > 0 && !blockedMembers.error 
                    ? blockedMembers.map(m => {
                        const safeUsername = escapeJsString(m.username);
                        let avatarUrl = 'https://via.placeholder.com/40';
                        if(m.equippedAvatar?.url) avatarUrl = m.equippedAvatar.url;
                        else if(m.profileIconId) avatarUrl = `https://cdn-avatars.wolvesville.com/${m.profileIconId}`;
                        
                        return `
                        <div class="blocked-member-card">
                            <div class="blocked-member-info">
                                <img src="${avatarUrl}" class="blocked-avatar" onerror="this.src='https://via.placeholder.com/40'">
                                <span class="blocked-name" onclick="event.stopPropagation(); window.goToPlayerSearch('${safeUsername}')" title="ดูโปรไฟล์">${m.username || 'ไม่ทราบชื่อ'}</span>
                            </div>
                            <button class="btn-unblock-icon" onclick="window.unblockMember('${clanId}', '${m.id}')" title="ปลดบล็อค">
                                <span class="material-icons" style="font-size:18px;">lock_open</span>
                            </button>
                        </div>
                      `;
                    }).join('') 
                    : '<div style="grid-column:1/-1; text-align:center; color:#94a3b8; padding:20px;">ไม่มีใครถูกบล็อคอยู่</div>'}
            </div>
        </div>
        ` : ''}
    `;

    clanContentContainer.innerHTML = profileHeader + mainContent + apiConsole;

    const finalChatContainer = document.getElementById('clan-chat-container');
    if (finalChatContainer) finalChatContainer.scrollTop = finalChatContainer.scrollHeight;
}

// Function to Show Role Modal (New)
window.showRoleModal = (roleId) => {
    const role = rolesCache.get(roleId);
    if (!role) return showCustomAlert('แจ้งเตือน', 'ไม่พบรายละเอียดบทบาทนี้ครับ');

    const imgUrl = role.image?.url || EMBEDDED_ICONS.UNKNOWN;
    
    let advancedHtml = '';
    if (advancedRolesMappingCache[role.id] && advancedRolesMappingCache[role.id].length > 0) {
        const advRoles = advancedRolesMappingCache[role.id].map(id => {
            const r = rolesCache.get(id);
            return r ? r.name : id.replace(/-/g, ' ');
        }).join(', ');
        advancedHtml = `<div style="margin-top:15px; font-size:0.9rem; color:#475569; background:#f8fafc; padding:10px; border-radius:8px; border:1px solid #e2e8f0;"><strong>🌟 บทบาทขั้นสูง (อัปเกรด):</strong> ${advRoles}</div>`;
    }

    let randomHtml = '';
    if (randomRolesMappingCache[role.id] && randomRolesMappingCache[role.id].length > 0) {
         const subRoles = randomRolesMappingCache[role.id].map(id => {
            const r = rolesCache.get(id);
            return r ? r.name : id.replace(/-/g, ' ');
         }).join(', ');
         randomHtml = `<div style="margin-top:10px; font-size:0.9rem; color:#475569; background:#f8fafc; padding:10px; border-radius:8px; border:1px solid #e2e8f0;"><strong>🎲 สามารถสุ่มเกิดเป็น:</strong> ${subRoles}</div>`;
    }

    let isRankedExcluded = rankedRandomExcludedRolesCache.includes(role.id) ? 
        `<span style="background:#fee2e2; color:#991b1b; padding:2px 8px; border-radius:12px; font-size:0.75rem; font-weight:bold; margin-left:5px;">ไม่สุ่มในโหมดจัดอันดับ</span>` : '';

    let teamColor = '#64748b'; 
    if(role.team === 'VILLAGER') teamColor = '#3b82f6';
    else if(role.team === 'WEREWOLF') teamColor = '#ef4444';
    else if(role.team === 'SOLO') teamColor = '#f59e0b';
    else if(role.team === 'RANDOM') teamColor = '#a855f7';

    const content = `
        <div style="text-align:center; padding:10px;">
            <img src="${imgUrl}" referrerpolicy="no-referrer" style="width:120px; height:120px; object-fit:contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2)); margin-bottom:15px;" onerror="this.src='${EMBEDDED_ICONS.UNKNOWN}'">
            <h2 style="margin:0 0 10px 0; color:#1e293b; font-size:1.8rem;">${role.name}</h2>
            <div style="display:flex; justify-content:center; flex-wrap:wrap; gap:8px;">
                <span style="background:${teamColor}20; color:${teamColor}; border:1px solid ${teamColor}50; padding:4px 10px; border-radius:12px; font-weight:bold; font-size:0.85rem;">ฝ่าย: ${role.team}</span>
                <span style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding:4px 10px; border-radius:12px; font-weight:bold; font-size:0.85rem;">ออร่า: ${role.aura}</span>
                ${isRankedExcluded}
            </div>
        </div>
        <div style="background:#f1f5f9; padding:15px; border-radius:8px; margin-top:20px; text-align:center; font-size:1rem; color:#334155; line-height:1.6;">
            "${role.description}"
        </div>
        ${advancedHtml}
        ${randomHtml}
    `;
    showCustomInfoModal('รายละเอียดบทบาท', content);
};

// Function to View All Roles (New)
async function initRoleWiki() {
    const container = document.getElementById('role-wiki-container');
    const searchInput = document.getElementById('role-search-input');
    
    if (rolesCache.size === 0) {
        container.innerHTML = `
            <div style="text-align:center; color:#888; padding:60px;">
                <span class="material-icons loading-spinner" style="font-size:50px; color:#cbd5e1;">sync</span>
                <div style="margin-top:15px; font-size:1.1rem;">กำลังโหลดข้อมูลบทบาท...</div>
            </div>
        `;
        await fetchAndCacheRoles();
    }

    if (rolesCache.size === 0) {
        container.innerHTML = `<div style="text-align:center; color:red; padding:20px;">ไม่สามารถโหลดข้อมูลบทบาทได้</div>`;
        return;
    }

    const rolesArray = Array.from(rolesCache.values());
    renderRoleGrid(rolesArray);

    if (searchInput) {
        searchInput.onkeyup = (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = rolesArray.filter(r => 
                (r.name && r.name.toLowerCase().includes(term)) || 
                (r.team && r.team.toLowerCase().includes(term)) ||
                (r.id && r.id.toLowerCase().includes(term))
            );
            renderRoleGrid(filtered);
        };
    }
}

function renderRoleGrid(roles) {
    const container = document.getElementById('role-wiki-container');
    
    if (!roles || roles.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#888; padding:40px;">ไม่พบบทบาทที่ค้นหา</div>`;
        return;
    }

    const html = roles.map(r => {
        const imgUrl = r.image?.url || EMBEDDED_ICONS.UNKNOWN;
        
        let teamColor = '#64748b'; 
        if(r.team === 'VILLAGER') teamColor = '#3b82f6';
        else if(r.team === 'WEREWOLF') teamColor = '#ef4444';
        else if(r.team === 'SOLO') teamColor = '#f59e0b';
        else if(r.team === 'RANDOM') teamColor = '#a855f7';

        return `
            <div class="quest-card-large" style="cursor:pointer; min-height:160px; justify-content:flex-start;" onclick="window.showRoleModal('${r.id}')">
                <div style="background:${teamColor}; width:100%; height:8px; border-top-left-radius:12px; border-top-right-radius:12px; position:absolute; top:0; left:0;"></div>
                <img src="${imgUrl}" referrerpolicy="no-referrer" style="height:70px; object-fit:contain; margin:25px auto 10px auto; display:block; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2));" loading="lazy" onerror="this.src='${EMBEDDED_ICONS.UNKNOWN}'">
                <div style="text-align:center; padding:0 10px 15px 10px; width:100%;">
                    <strong style="font-size:1.05rem; color:#1e293b; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${r.name}">${r.name}</strong>
                    <div style="font-size:0.75rem; font-weight:bold; color:${teamColor}; margin-top:4px;">${r.team}</div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `<div class="quest-grid" style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px;">${html}</div>`;
}

// Function to View All Clan Quests (Wiki)
async function initQuestWiki() {
    const container = document.getElementById('quest-wiki-container');
    
    if (allQuestsCache.length > 0) {
        renderWikiGrid(allQuestsCache);
        return;
    }

    container.innerHTML = `
        <div style="text-align:center; color:#888; grid-column:1/-1; padding:60px;">
            <span class="material-icons loading-spinner" style="font-size:50px; color:#cbd5e1;">sync</span>
            <div style="margin-top:15px; font-size:1.1rem;">กำลังดึงข้อมูลเควสและไอเทม...</div>
        </div>
    `;

    try {
        const [res, _] = await Promise.all([
            fetchData('/clans/quests/all'),
            fetchAndCacheAvatarItems() 
        ]);

        if (res.error) {
            container.innerHTML = `<div style="text-align:center; color:red; grid-column:1/-1;">เกิดข้อผิดพลาด: ${res.message}</div>`;
            return;
        }

        if (Array.isArray(res)) {
            allQuestsCache = res; 
            renderWikiGrid(allQuestsCache); 
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = `<div style="text-align:center; color:red; grid-column:1/-1;">เกิดข้อผิดพลาดร้ายแรงในการโหลดสารานุกรม</div>`;
    }
}

// เผื่อฟังก์ชันการเรียกดูเควสผ่านปุ่มใน Dashboard ยิงมาที่เดิม 
window.viewAllQuests = async () => {
    document.querySelector('.nav-link[data-page="quest-wiki"]')?.click();
}

function renderWikiGrid(quests) {
    const container = document.getElementById('quest-wiki-container');
    
    if (!quests || quests.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#888; grid-column:1/-1; padding:20px;">ไม่พบข้อมูลเควส</div>`;
        return;
    }

    const html = quests.map(q => {
        const isGem = q.purchasableWithGems;
        const currencyIcon = isGem ? 'diamond' : 'monetization_on';
        const currencyColor = isGem ? '#d8b4fe' : '#fcd34d';
        const imgUrl = q.promoImageUrl || 'https://via.placeholder.com/300x150?text=No+Image';
        const rewardCount = q.rewards ? q.rewards.length : 0;

        // CLEAN WHITE CARD STYLE
        return `
            <div class="quest-card-large" onclick="window.showQuestModal('${q.id}')">
                <img src="${imgUrl}" class="quest-card-large-img" loading="lazy">
                <div class="quest-card-footer">
                    <div class="quest-price-tag" style="color: ${currencyColor}; border: 1px solid #e2e8f0; background: #f8fafc; padding: 4px 8px; border-radius: 8px; display: inline-flex; align-items: center; gap: 4px; font-weight: bold; font-size: 0.85rem;">
                        <span class="material-icons" style="font-size:16px;">${currencyIcon}</span>
                        <span style="margin-left:4px;">${isGem ? 'เควสเพชร' : 'เควสทอง'}</span>
                    </div>
                    <div style="font-size:0.8rem; font-weight:bold; color:#64748b; background:#f1f5f9; padding:4px 8px; border-radius:6px;">
                        ${rewardCount} รางวัล
                    </div>
                </div>
                ${(() => { questDetailsCache.set(q.id, q); return ''; })()} 
            </div>
        `;
    }).join('');

    const rawJson = JSON.stringify(quests, null, 4);
    const debugHtml = `
        <div class="api-console" style="grid-column: 1 / -1; margin-top:30px; border-top:1px dashed #e2e8f0; padding-top:20px;">
            <details>
                <summary style="cursor:pointer; background:#f1f5f9; padding:10px; border-radius:8px; font-weight:600; color:#475569;">
                    <span class="material-icons" style="vertical-align:bottom; margin-right:5px; font-size:20px;">data_object</span>
                    🔧 ข้อมูลดิบของเควสทั้งหมด (Raw JSON Data)
                </summary>
                <pre class="json-output">${rawJson}</pre>
            </details>
        </div>
    `;

    container.innerHTML = html + debugHtml;
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    sendIncrementSignal('visitors');
    fetchAndDisplayData();

    const k = localStorage.getItem('wolvesville_api_key');
    if(k) { apiKeyInput.value = k; if(apiKeyStatus) apiKeyStatus.innerHTML = '✅ บันทึกแล้ว'; }

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
            else if(t==='role-wiki') initRoleWiki(); 
            else if(t==='quest-wiki') initQuestWiki(); 
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
        if(v.length>10) { 
            localStorage.setItem('wolvesville_api_key',v); 
            showCustomAlert('สำเร็จ', '✅ บันทึก API Key เรียบร้อยแล้วครับ!'); 
            fetchAndDisplayData(); 
        }
        else showCustomAlert('แจ้งเตือน', '❌ API Key สั้นเกินไปหรือไม่ถูกต้องครับ');
    });

    // ส่วนจัดการปุ่มบันทึกภาษา
    const savedLocale = localStorage.getItem('wolvesville_api_locale');
    const localeSelect = document.getElementById('api-locale-select');
    if (savedLocale && localeSelect) {
        localeSelect.value = savedLocale;
    }

    const saveLocaleBtn = document.getElementById('save-locale-btn');
    if (saveLocaleBtn) {
        saveLocaleBtn.addEventListener('click', () => {
            if (localeSelect) {
                localStorage.setItem('wolvesville_api_locale', localeSelect.value);
                const status = document.getElementById('api-locale-status');
                if (status) {
                    status.style.display = 'block';
                    setTimeout(() => status.style.display = 'none', 3000);
                }
                
                // ล้างแคชเพื่อให้ระบบโหลดข้อมูลภาษาใหม่
                rolesCache.clear();
                avatarItemsCache.clear();
                questDetailsCache.clear();
                allQuestsCache = [];
                
                // โหลดข้อมูล Dashboard และหน้าปัจจุบันใหม่เพื่อให้ภาษาเปลี่ยนทันที
                fetchAndDisplayData();
                if (document.getElementById('role-wiki-container') && document.getElementById('role-wiki-container').innerHTML.trim() !== '') {
                    initRoleWiki();
                }
                if (document.getElementById('quest-wiki-container') && document.getElementById('quest-wiki-container').innerHTML.trim() !== '') {
                    initQuestWiki();
                }
            }
        });
    }

    if(searchPlayerBtn) searchPlayerBtn.addEventListener('click', searchAndDisplayPlayer);
    if(usernameInput) usernameInput.addEventListener('keydown', (e) => { if(e.key==='Enter') searchAndDisplayPlayer(); });

    if(searchClanBtn) searchClanBtn.addEventListener('click', searchClan);
    if(myClanBtn) myClanBtn.addEventListener('click', fetchMyClan);
    if(clanNameInput) clanNameInput.addEventListener('keydown', (e) => { if(e.key==='Enter') searchClan(); });

    // Inject API Hat Button in Settings
    const settingsPage = document.getElementById('settings');
    if (settingsPage) {
        const hatGroup = document.createElement('div');
        hatGroup.className = 'settings-group';
        hatGroup.style.marginTop = '20px';
        hatGroup.innerHTML = `
            <h3><span class="material-icons" style="vertical-align: middle; color: #a855f7;">checkroom</span> รับหมวก API Hat</h3>
            <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 10px;">รับหมวก API Hat แบบสุดพิเศษได้ฟรี! (เฉพาะไอดีเจ้าของบอทเท่านั้น)</p>
            <button onclick="window.redeemApiHat()" style="background: #a855f7; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <span class="material-icons" style="font-size: 18px;">auto_awesome</span> รับหมวก API Hat
            </button>
        `;
        settingsPage.appendChild(hatGroup);
    }

    // --- FEEDBACK SYSTEM (FLOATING BUTTON & DISCORD WEBHOOK WITH IMAGE) ---
    const fabBtn = document.getElementById('floating-feedback-btn');
    const feedbackModal = document.getElementById('feedback-modal');
    const closeFeedbackBtn = document.getElementById('close-feedback-modal');
    const submitFeedbackBtn = document.getElementById('submit-feedback-btn');

    // เปิด/ปิด Modal
    if (fabBtn && feedbackModal && closeFeedbackBtn) {
        fabBtn.addEventListener('click', () => {
            feedbackModal.style.display = 'flex';
        });
        
        closeFeedbackBtn.addEventListener('click', () => {
            feedbackModal.style.display = 'none';
        });

        feedbackModal.addEventListener('click', (e) => {
            if (e.target === feedbackModal) feedbackModal.style.display = 'none';
        });
    }

    // ฟังก์ชันส่งข้อมูลเข้า Webhook
    if (submitFeedbackBtn) {
        submitFeedbackBtn.addEventListener('click', async () => {
            const topic = document.getElementById('feedback-topic').value;
            const msg = document.getElementById('feedback-msg').value.trim();
            const imageInput = document.getElementById('feedback-image');

            // เช็คว่ามีข้อความ หรือมีการแนบรูปภาพ อย่างใดอย่างหนึ่ง
            if (!msg && imageInput.files.length === 0) {
                if (typeof showCustomAlert === 'function') {
                    showCustomAlert('แจ้งเตือน', 'กรุณาพิมพ์ข้อความ หรือแนบรูปภาพก่อนกดส่งครับ 😅');
                } else {
                    alert('กรุณาพิมพ์ข้อความ หรือแนบรูปภาพก่อนกดส่งครับ 😅');
                }
                return;
            }

            // เปลี่ยนปุ่มเป็นสถานะกำลังโหลด
            const originalText = submitFeedbackBtn.innerHTML;
            submitFeedbackBtn.innerHTML = '<span class="material-icons loading-spinner" style="font-size: 20px;">sync</span> กำลังส่ง...';
            submitFeedbackBtn.disabled = true;

            try {
                // ⚠️ DISCORD WEBHOOK URL ⚠️
                const WEBHOOK_URL = 'https://discord.com/api/webhooks/1474347018989080702/rUWUi5RJ41LvhcezeInrYbg-7mqP1OuH0dFu6ROB_E8FzHSZaRBnb5p8ka-dydMuyxwk'; 

                let embedColor = 3447003; 
                let embedTitle = '📝 ข้อเสนอแนะอื่นๆ';
                if (topic === 'bug') { embedColor = 16711680; embedTitle = '🐛 แจ้งปัญหาบัค'; } 
                else if (topic === 'suggestion') { embedColor = 16776960; embedTitle = '💡 ข้อเสนอแนะฟีเจอร์'; } 

                // การส่งรูปภาพผ่าน Webhook ต้องใช้ FormData
                const formData = new FormData();

                // สร้างโครงสร้าง Embed ของ Discord
                const payload = {
                    username: "Wolvesville API Feedback",
                    avatar_url: "https://cdn-icons-png.flaticon.com/512/3592/3592869.png",
                    embeds: [{
                        title: embedTitle,
                        description: msg || "*ไม่มีข้อความ (แนบรูปภาพมาอย่างเดียว)*",
                        color: embedColor,
                        timestamp: new Date().toISOString()
                    }]
                };

                // ถ้ามีการแนบไฟล์
                if (imageInput.files.length > 0) {
                    const file = imageInput.files[0];
                    // เพิ่มไฟล์เข้า form data
                    formData.append('file', file, file.name);
                    // สั่งให้ Embed ดึงรูปจากไฟล์ที่แนบไป
                    payload.embeds[0].image = { url: `attachment://${file.name}` };
                }

                // ใส่ข้อมูล JSON ลงในฟิลด์ payload_json
                formData.append('payload_json', JSON.stringify(payload));

                // ส่งคำสั่งยิง Webhook
                const response = await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    body: formData // ไม่ต้องใส่ Content-Type เพราะเบราว์เซอร์จะจัดการ Boundary ให้อัตโนมัติเมื่อใช้ FormData
                });

                if (!response.ok) {
                    throw new Error(`เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ดิสคอร์ด: ${response.status}`);
                }

                // แจ้งเตือนเมื่อส่งสำเร็จ
                if (typeof showCustomAlert === 'function') {
                    showCustomAlert('สำเร็จ', '✅ ขอบคุณสำหรับฟีดแบคครับ! เราได้รับข้อความของคุณเรียบร้อยแล้ว');
                } else {
                    alert('✅ ขอบคุณสำหรับฟีดแบคครับ! เราได้รับข้อความของคุณเรียบร้อยแล้ว');
                }
                
                // เคลียร์กล่องข้อความและหน้าต่าง
                document.getElementById('feedback-msg').value = ''; 
                imageInput.value = '';
                feedbackModal.style.display = 'none';
                
            } catch (e) {
                console.error("Feedback Error:", e);
                if (typeof showCustomAlert === 'function') {
                    showCustomAlert('เกิดข้อผิดพลาด', '❌ ไม่สามารถส่งฟีดแบคได้: ' + e.message);
                } else {
                    alert('❌ ไม่สามารถส่งฟีดแบคได้: ' + e.message);
                }
            } finally {
                // คืนค่าปุ่มให้กลับมาเป็นแบบเดิม
                submitFeedbackBtn.innerHTML = originalText;
                submitFeedbackBtn.disabled = false;
            }
        });
    }

    document.querySelector('.nav-link[data-page="dashboard"]')?.click();
});

console.log('--- script.js: Loading Finished ---');
