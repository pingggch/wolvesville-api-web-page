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

function showCustomInfoModal(title, contentHtml) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content" style="text-align:left;">
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
    
    // Donation Stats
    const don = data.donated || {};
    const xpDur = data.xpDurations || {};
    
    // Status Badge
    let statusClass = 'offline';
    let statusLabel = data.status || 'UNKNOWN';
    if(data.playerStatus === 'ONLINE' || data.status === 'ONLINE') { statusClass = 'online'; statusLabel = 'ONLINE'; }
    else if(data.playerStatus === 'PLAY' || data.status === 'PLAY') { statusClass = 'play'; statusLabel = 'PLAYING'; }
    
    const content = `
        <div style="display:flex; flex-direction:column; align-items:center; margin-bottom:20px;">
            <img src="${avatarUrl}" style="width:100px; height:100px; border-radius:25%; border:4px solid #e2e8f0; margin-bottom:10px; background:#f1f5f9; object-fit:contain;">
            <!-- Clickable Name -->
            <h2 style="margin:0; font-size:1.5rem; color:#1e293b; cursor:pointer; text-decoration:underline;" 
                onclick="document.querySelectorAll('.modal-overlay').forEach(el => el.remove()); window.goToPlayerSearch('${data.username}')"
                title="Click to view full profile">
                ${data.username}
            </h2>
            <div style="color:#64748b; font-size:0.9rem;">${data.flair ? `"${data.flair}"` : '-'}</div>
            <div style="margin-top:5px;">
                <span class="status-badge ${statusClass}" style="font-size:0.7rem; padding:2px 8px;">${statusLabel}</span>
                <span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:12px; font-size:0.7rem; font-weight:bold;">LVL ${data.level || 0}</span>
                ${data.isCoLeader ? '<span style="background:#e0f2fe; color:#075985; padding:2px 8px; border-radius:12px; font-size:0.7rem; font-weight:bold;">CO-LEADER</span>' : ''}
            </div>
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
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:5px; text-align:center; margin-bottom:15px;">
            <div style="font-size:0.7rem; color:#94a3b8;">Period</div>
            <div style="font-size:0.7rem; color:#94a3b8;">Week</div>
            <div style="font-size:0.7rem; color:#94a3b8;">Month</div>
            <div style="font-size:0.7rem; color:#94a3b8;">All Time</div>
            
            <div style="font-weight:bold; color:#d97706; font-size:0.8rem;">Gold</div>
            <div style="font-size:0.85rem;">${(don.gold?.week||0).toLocaleString()}</div>
            <div style="font-size:0.85rem;">${(don.gold?.month||0).toLocaleString()}</div>
            <div style="font-size:0.85rem;">${(don.gold?.allTime||0).toLocaleString()}</div>

            <div style="font-weight:bold; color:#9333ea; font-size:0.8rem;">Gems</div>
            <div style="font-size:0.85rem;">${(don.gems?.week||0).toLocaleString()}</div>
            <div style="font-size:0.85rem;">${(don.gems?.month||0).toLocaleString()}</div>
            <div style="font-size:0.85rem;">${(don.gems?.allTime||0).toLocaleString()}</div>
        </div>

        <h4 style="margin:15px 0 10px 0; color:#334155; border-bottom:1px solid #eee; padding-bottom:5px;">⚔️ Activity</h4>
        <div style="background:#f0fdf4; padding:10px; border-radius:8px; border:1px solid #bbf7d0;">
             <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span style="color:#166534; font-size:0.9rem;">XP (Week/Month)</span>
                <strong>${(xpDur.week||0).toLocaleString()} / ${(xpDur.month||0).toLocaleString()}</strong>
             </div>
             <div style="display:flex; justify-content:space-between;">
                <span style="color:#166534; font-size:0.9rem;">Quests (Gold/Gem)</span>
                <strong>${data.goldQuests||0} / ${data.gemQuests||0}</strong>
             </div>
        </div>
        
        <div style="margin-top:15px; font-size:0.75rem; color:#94a3b8; text-align:center;">
            Player ID: <span style="font-family:monospace;">${data.playerId || data.id}</span>
        </div>
    `;
    
    showCustomInfoModal(data.username || 'Member Details', content);
}

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

            if (r.type === 'AVATAR_ITEM') {
                const itemId = r.avatarItemId;
                // Use Cached Item or Default Construction
                imgUrl = `https://cdn.wolvesville.com/avatarItems/png/256x/${itemId}.png`; 
                const cachedItem = avatarItemsCache.get(itemId);
                if (cachedItem && cachedItem.imageUrl) {
                    imgUrl = cachedItem.imageUrl; // Use API imageUrl if available
                }
                label = 'Avatar Item';
                subLabel = ''; // ID Removed as requested
            } else if (r.type === 'GOLD') {
                imgUrl = 'https://cdn.wolvesville.com/static/gold.png';
            } else if (r.type === 'GEM' || r.type === 'GEMS') {
                imgUrl = 'https://cdn.wolvesville.com/static/gem.png';
            }

            // Card Style for Grid - Image Centered, No Label Text
            return `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; background:#fff; padding:10px; border-radius:12px; border:1px solid #e2e8f0; position:relative; box-shadow: 0 1px 2px rgba(0,0,0,0.05); min-height:80px;">
                    <div style="position:absolute; top:0; right:0; background:#64748b; color:white; font-size:0.65rem; padding:2px 6px; border-bottom-left-radius:8px; font-weight:bold;">T${idx+1}</div>
                    <img src="${imgUrl}" title="${label}" onerror="this.src='https://cdn.wolvesville.com/static/items/calavera.png'" style="width:48px; height:48px; object-fit:contain; margin-top:5px;">
                    ${subLabel ? `<div style="font-size:0.75rem; font-weight:bold; color:#475569; margin-top:5px;">${subLabel}</div>` : ''}
                </div>
            `;
        }).join('');

        // Grid Layout: Determine columns to fit into 2 rows
        // e.g., 6 items -> 3 cols (3x2), 8 items -> 4 cols (4x2)
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
        <img src="${imageUrl}" style="width:100%; border-radius:8px; margin-bottom:15px; border:1px solid #e2e8f0; display:block;">
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

    // Show initial loading modal
    showCustomInfoModal(
        'Loading Member...', 
        '<div style="text-align:center; padding:20px;"><div class="quest-inline-icon loading" style="font-size:40px;">sync</div><br>Fetching details...</div>'
    );
    
    try {
        // Parallel Fetch: Detailed list + specific player (for safety)
        const [detailedRes, playerRes] = await Promise.all([
            fetchData(`/clans/${clanId}/members/detailed`),
            fetchData(`/players/${playerId}`)
        ]);

        let memberData = {};

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
        
        // Show actual data
        showMemberModal(memberData);

    } catch (e) {
        console.error('[MemberDetails] Error:', e);
        showCustomAlert('Error', 'Failed to load member details.');
    }
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
            return { error: true, status: res.status };
        }
    } catch (e) {
        return { error: true, message: e.message };
    }
}

async function sendPayload(endpoint, method, payload) {
    const key = localStorage.getItem('wolvesville_api_key');
    if (!key) return { error: true, message: 'Missing API Key' };

    const url = `${localServerUrl}/api/wolvesville`; 
    
    try {
        const res = await fetch(url, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint: endpoint,
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
                return { error: true, status: 404, message: 'Proxy Error: Your local server does not accept POST requests. Please add a POST handler to your server.js.' };
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

// **********************************************
// 7. DASHBOARD & PLAYER LOGIC
// **********************************************

// REMOVED REFRESH FUNCTIONS as requested

async function fetchAndDisplayData() {
    await fetchAndDisplayStatsOnly();
    if(availableItems) availableItems.textContent = '...';
    if(apiStatusText) apiStatusText.textContent = 'Checking...';
    if(apiStatusDot) apiStatusDot.style.backgroundColor = '#FFD700';

    const check = await fetchData('/announcements', true, false);
    if (!check.error) {
        if(apiStatusDot) { apiStatusDot.classList.add('connected'); apiStatusDot.style.backgroundColor = '#4CAF50'; }
        if(apiStatusText) apiStatusText.textContent = 'ออนไลน์ (200 OK)';
        
        const items = await fetchTotalItemsCount();
        if(availableItems) {
             availableItems.innerHTML = `
                ${items.error ? 'Error' : items.count.toLocaleString()}
                <!-- Removed Refresh Button -->
             `;
        }
    } else {
        if(apiStatusDot) { apiStatusDot.classList.remove('connected'); apiStatusDot.style.backgroundColor = '#D32F2F'; }
        if(apiStatusText) apiStatusText.textContent = 'เชื่อมต่อไม่ได้';
        if(availableItems) availableItems.textContent = '-';
    }
}

async function searchAndDisplayPlayer() {
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
            if (!clan.error) {
                data.clanName = clan.name;
                data.clanTag = clan.tag;
            }
        }
        renderPlayerProfile(data);
    } else {
        playerProfileContainer.innerHTML = '<div style="text-align:center; color:red; padding:20px;">ดึงข้อมูลล้มเหลว</div>';
    }
    fetchAndDisplayStatsOnly();
}

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

    const rawStatus = (data.status || 'OFFLINE').toUpperCase();
    let statusBadge = '';

    if (rawStatus === 'PLAY') {
        statusBadge = '<span class="status-badge play"><span class="material-icons">sports_esports</span> Playing</span>';
    } else if (rawStatus === 'ONLINE' || rawStatus === 'DEFAULT') { 
        statusBadge = '<span class="status-badge online"><span class="material-icons">fiber_manual_record</span> DEFAULT</span>';
    } else if (rawStatus === 'DO_NOT_DISTURB' || rawStatus === 'DND') { 
        statusBadge = '<span class="status-badge dnd"><span class="material-icons">do_not_disturb_on</span> Do Not Disturb</span>';
    } else if (rawStatus === 'OFFLINE') {
        statusBadge = '<span class="status-badge offline"><span class="material-icons">cloud_off</span> INVISIBLE</span>';
    } else {
        statusBadge = `<span class="status-badge offline">${data.status}</span>`;
    }

    let clanHtml = '';
    if (data.clanName) clanHtml = `<span class="clan-tag" title="${data.clanId}">[${data.clanTag||'CLAN'}] ${data.clanName}</span>`;
    else if (data.clanId) clanHtml = `<span class="clan-tag error">Clan ID Only</span>`;

    const achievements = stats.achievements || [];
    const topRoles = achievements
        .sort((a, b) => b.level - a.level || b.points - a.points)
        .slice(0, 3)
        .map(a => `
            <div class="achievement-tag">
                <strong>${a.roleId.replace(/-/g,' ').toUpperCase()}</strong>
                <span class="achievement-lvl">Lv.${a.level}</span>
            </div>
        `).join('');

    const cardsHtml = roles.map(c => {
        const advancedList = (c.roleIdsAdvanced || [])
            .map(id => `<span style="display:inline-block; background:#f1f5f9; padding:2px 6px; border-radius:4px; margin:2px 2px 2px 0; font-size:0.7rem; border:1px solid #e2e8f0; color:#475569;">${id.replace(/-/g, ' ')}</span>`)
            .join('');

        return `
        <div class="game-card">
            <div class="card-top rarity-${c.rarity}">
                <span class="material-icons" style="color:rgba(255,255,255,0.8);">style</span>
            </div>
            <div class="card-body">
                <div class="card-title">${c.roleId1.replace(/-/g,' ').toUpperCase()}</div>
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
                <div class="level-badge">LV. ${data.level}</div>
            </div>
            <div class="profile-main-info">
                <div class="player-name">${data.username} ${clanHtml}</div>
                <div style="margin-bottom:10px;">${statusBadge}</div>
                
                <div style="margin-bottom: 10px;">
                    <span class="rose-stat" title="Received"><span class="material-icons">favorite</span> ${data.receivedRosesCount?.toLocaleString() || 0}</span>
                    <span class="rose-stat" title="Sent"><span class="material-icons">volunteer_activism</span> ${data.sentRosesCount?.toLocaleString() || 0}</span>
                </div>

                <div class="player-bio">"${formatMessage(data.personalMessage)}"</div>
                <div style="font-size:0.8rem; color:#94a3b8; margin-top:10px;">
                    ID: ${data.id} <br>
                    Joined: ${formatDateThai(data.creationTime)} | Last: ${formatDateThai(data.lastOnline)}
                </div>
            </div>
        </div>

        <h3 class="stats-section-title"><span class="material-icons">analytics</span> สถิติ (Statistics)</h3>
        <div class="stats-grid-container">
            <div class="stat-box">
                <h4 class="box-title">Overview</h4>
                <div class="stat-row"><span class="stat-label">Games</span><span class="stat-val">${total.toLocaleString()}</span></div>
                <div class="stat-row"><span class="stat-label">Time</span><span class="stat-val">${((stats.totalPlayTimeInMinutes||0)/60).toFixed(1)} hrs</span></div>
                <div class="progress-container">
                    <div class="progress-label"><span>Win Rate</span><span>${winRate}%</span></div>
                    <div class="progress-track"><div class="progress-fill fill-win" style="width:${winRate}%"></div></div>
                </div>
                
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #eee;">
                    <span class="stat-label" style="display:block; margin-bottom:5px;">Top Roles (Best Level):</span>
                    <div class="achievements-list">${topRoles}</div>
                </div>
            </div>

            <div class="stat-box">
                <h4 class="box-title">Ranked Season</h4>
                ${rankTotal > 0 ? `
                    <div class="stat-row"><span class="stat-label">Skill / Max</span><span class="stat-val">${rankSkill} / ${rankMaxSkill}</span></div>
                    <div class="stat-row"><span class="stat-label">Best Rank</span><span class="stat-val" style="color:var(--warning)">${bestRank}</span></div>
                    <div class="stat-row"><span class="stat-label">Wins / Loss</span><span class="stat-val"><span class="value-green">${data.rankedWins}</span> / <span class="value-red">${data.rankedLosses}</span></span></div>
                    <div class="progress-container">
                        <div class="progress-label"><span>Win Rate</span><span>${rankWR}%</span></div>
                        <div class="progress-track"><div class="progress-fill fill-solo" style="width:${rankWR}%"></div></div>
                    </div>
                ` : '<div style="padding:20px; text-align:center; color:#ccc">No Ranked Data</div>'}
            </div>

            <div class="stat-box">
                <h4 class="box-title">Performance</h4>
                <div class="progress-container" style="margin-bottom:8px">
                    <div class="progress-label"><span>Village</span><span>${vilWR}%</span></div>
                    <div class="progress-track"><div class="progress-fill fill-win" style="width:${vilWR}%"></div></div>
                </div>
                <div class="progress-container">
                    <div class="progress-label"><span>Werewolf</span><span>${wolfWR}%</span></div>
                    <div class="progress-track"><div class="progress-fill fill-wolf" style="width:${wolfWR}%"></div></div>
                </div>
                <div class="progress-container">
                    <div class="progress-label"><span>Voting / Solo</span><span>${voteWR}%</span></div>
                    <div class="progress-track"><div class="progress-fill fill-solo" style="width:${voteWR}%"></div></div>
                </div>
            </div>
        </div>

        ${roles.length ? `<h3 class="stats-section-title"><span class="material-icons">style</span> Role Cards (${roles.length})</h3><div class="role-cards-wrapper">${cardsHtml}</div>` : ''}

        <div class="api-console" style="margin-top:30px; border-top:1px dashed #e2e8f0; padding-top:20px;">
            <details>
                <summary style="cursor:pointer; background:#f1f5f9; padding:10px; border-radius:8px; font-weight:600; color:#475569;">
                    <span class="material-icons" style="vertical-align:bottom; margin-right:5px; font-size:20px;">data_object</span>
                    Debug: Raw Player Data (JSON)
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
    if (!localStorage.getItem('wolvesville_api_key')) return showCustomAlert('Error', 'Missing API Key');
    
    stopClanPolling();
    
    // Initial Loader
    clanContentContainer.innerHTML = `
        <div class="loading-container">
            <div style="font-size:24px; margin-bottom:10px;">🛡️</div>
            <h3 style="color:#1e293b; margin:0;">Loading My Clan...</h3>
            <div class="loading-bar-track">
                <div class="loading-bar-fill" style="width: 5%;"></div>
            </div>
            <div class="loading-text">Initializing...</div>
        </div>
    `;
    
    const authRes = await fetchData('/clans/authorized');
    if (authRes.error || !authRes.length) {
        clanContentContainer.innerHTML = '<div style="text-align:center; color:red; padding:30px;">❌ คุณไม่ได้อยู่ในแคลน</div>';
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
            <h3 style="color:#1e293b; margin:0;">Searching Clan...</h3>
            <div class="loading-bar-track">
                <div class="loading-bar-fill" style="width: 10%;"></div>
            </div>
            <div class="loading-text">Looking for "${name}"...</div>
        </div>
    `;
    
    const searchRes = await fetchData(`/clans/search?name=${encodeURIComponent(name)}`);
    if (searchRes.error || !searchRes.length) {
        clanContentContainer.innerHTML = '<div style="text-align:center; color:red; padding:20px;">❌ ไม่พบแคลนนี้</div>';
        return;
    }
    
    await fetchClanData(searchRes[0].id, false);
}

// Global polling functions
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

// [UPDATED] Sequential Loading Function with Progress Bar
async function fetchClanData(clanId, isMyClan = false, isBackground = false) {
    const totalSteps = isMyClan ? 14 : 9; // Approximate steps
    let currentStep = 0;

    // Helper to update progress bar
    const updateProgress = (text) => {
        if(!isBackground) {
            currentStep++;
            const percent = Math.min(100, Math.round((currentStep / totalSteps) * 100));
            
            const loaderHtml = `
                <div class="loading-container">
                    <div style="font-size:24px; margin-bottom:10px; animation: bounce 1s infinite;">🛡️</div>
                    <h3 style="color:#1e293b; margin:0;">Loading Clan Data...</h3>
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
        updateProgress('Initializing...');
    }
    
    // Parallel fetching for assets
    await Promise.all([
        fetchAndCacheEmojis(),
        fetchAndCacheAvatarItems() // NEW: Fetch Avatar Items
    ]);
    
    // 1. Info
    updateProgress('Fetching Clan Info...');
    const info = await fetchData(`/clans/${clanId}/info`);
    if (info.error) {
        if(!isBackground) clanContentContainer.innerHTML = `<div style="text-align:center; color:red; padding:30px;">Error: ${info.message}</div>`;
        return;
    }

    // 2. Members
    updateProgress('Fetching Members List...');
    const membersRaw = await fetchData(`/clans/${clanId}/members`);
    
    // 3. Active Quests
    updateProgress('Fetching Active Quests...');
    const quests = await fetchData(`/clans/${clanId}/quests/active`);

    // 4. Chat
    updateProgress('Fetching Chat History...');
    const chat = await fetchData(`/clans/${clanId}/chat`);

    // 5. Logs
    updateProgress('Fetching Logs...');
    const logs = await fetchData(`/clans/${clanId}/logs`);

    // 6. Ledger
    updateProgress('Fetching Ledger...');
    const ledger = await fetchData(`/clans/${clanId}/ledger`);

    // 7. History
    updateProgress('Fetching Quest History...');
    const history = await fetchData(`/clans/${clanId}/quests/history`);

    // 8. Announcements
    updateProgress('Fetching Announcements...');
    const announcements = await fetchData(`/clans/${clanId}/announcements`);

    let blockedMembers = { error: true };
    let availableQuests = { error: true };
    let votesData = { error: true };

    if(isMyClan) {
        updateProgress('Fetching Blocklist...');
        const blocklistRes = await fetchData(`/clans/${clanId}/blocklist`);

        // Handle Blocklist Logic (Moved from original array access)
        if (!blocklistRes.error && Array.isArray(blocklistRes)) {
            const extractId = (item) => {
                if (typeof item === 'string') return item;
                return item.playerId || item.id || item.targetPlayerId;
            };
            
            const playersData = [];
            // Update loading for blocklist processing
            updateProgress('Processing Blocked Players...');
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
                const originalId = extractId(originalItem) || 'Unknown ID';
                if (p.error) return { id: originalId, username: 'Unknown ID', error: true };
                return p;
            });
        } else {
             blockedMembers = blocklistRes;
        }

        updateProgress('Fetching Available Quests...');
        availableQuests = await fetchData(`/clans/${clanId}/quests/available`);
        // Cache Available Quests
        if (Array.isArray(availableQuests)) {
            availableQuests.forEach(q => questDetailsCache.set(q.id, q));
        }

        updateProgress('Fetching Votes...');
        votesData = await fetchData(`/clans/${clanId}/quests/votes`);
        clanVotesCache = votesData;
    }

    // Process Members (Heavy lifting)
    let members = membersRaw;
    if (!membersRaw.error && Array.isArray(membersRaw)) {
        updateProgress(`Processing Member Avatars (${membersRaw.length})...`);
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

    // Cache Members for Vote Name Resolution
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

    // Final Render
    updateProgress('Rendering Dashboard...');
    setTimeout(() => {
        renderClanDashboard(info, members, quests, chat, logs, ledger, history, announcements, blockedMembers, availableQuests, votesData, clanId, isMyClan, isBackground, participatingMemberCount);
    }, 500); 
}

async function fetchMemberDetails(clanId, playerId, canEdit) {
    if (!playerId) return;
    const modalId = 'member-modal';
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    const mem = (await fetchData(`/players/${playerId}`)) || {};
    
    // Basic modal construction (simplified for this context)
    window.goToPlayerSearch(mem.username);
}

function renderClanDashboard(info, members, quests, chat, logs, ledger, history, announcements, blockedMembers, availableQuests, votesData, clanId, canEdit = false, isBackground = false, participatingMemberCount = 0) { 
    const memberMap = {};
    if (!members.error && Array.isArray(members)) {
        members.forEach(m => {
            memberMap[m.playerId] = m.username;
        });
    }

    // 1. ACTIVE QUEST HTML (BATTLE PASS STYLE - UPDATED)
    let questsHtml = '<div style="text-align:center; color:#ccc; padding:20px;">No Active Quests</div>';
    let hasActiveQuest = false;
    
    if (!quests.error && (quests.quest || (quests.id && (quests.promoImageUrl || quests.rewards)))) {
        hasActiveQuest = true;
        const qData = quests.quest ? quests : { quest: quests, ...quests }; 
        const qInfo = qData.quest || qData; 
        
        const progress = qData.xp !== undefined ? qData.xp : (qInfo.xp || 0);
        const target = qData.xpPerReward || qInfo.xpPerReward || 1;
        const percent = Math.min(100, Math.round((progress / target) * 100));
        const tier = (qData.tier !== undefined ? qData.tier + 1 : (qInfo.tier !== undefined ? qInfo.tier + 1 : 1));
        const activeParticipants = members.filter(m => m.participateInClanQuests).length;
        const actionCost = 300 + (30 * activeParticipants);

        // --- BATTLE PASS TRACK (UNIFIED) ---
        let rewardsTrackHtml = '';
        if (qInfo.rewards && Array.isArray(qInfo.rewards)) {
            const currentTierIndex = (qData.tier || 0);
            
            // [FIXED] PROGRESS BAR LOGIC
            const totalSegments = Math.max(1, qInfo.rewards.length - 1);
            let relativeProgress = currentTierIndex + (progress / target);
            
            // Cap progress at 100% of the track
            if (relativeProgress > totalSegments) relativeProgress = totalSegments;
            
            const trackWidthPercent = Math.min(100, (relativeProgress / totalSegments) * 100);

            rewardsTrackHtml = `
                <div class="battle-pass-hub">
                    <!-- The Progress Bar is now inside the Track Hub -->
                    <div class="xp-progress-wrapper">
                        <div class="xp-progress-fill" style="width:${trackWidthPercent}%;"></div>
                    </div>

                    <div class="battle-pass-track">
            `;
            
            qInfo.rewards.forEach((r, idx) => {
                let imgUrl = 'https://via.placeholder.com/60?text=?';
                if(r.type === 'AVATAR_ITEM') {
                    // Try to get from cache first
                    const item = avatarItemsCache.get(r.avatarItemId);
                    if (item && item.imageUrl) {
                        imgUrl = item.imageUrl; // Use the image URL from API
                    } else {
                        imgUrl = `https://cdn.wolvesville.com/avatarItems/png/256x/${r.avatarItemId}.png`;
                    }
                }
                else if(r.type === 'GOLD') imgUrl = 'https://cdn.wolvesville.com/static/gold.png';
                else if(r.type === 'GEM' || r.type === 'GEMS') imgUrl = 'https://cdn.wolvesville.com/static/gem.png';
                
                let statusClass = '';
                if (idx < currentTierIndex) statusClass = 'completed-tier';
                else if (idx === currentTierIndex) statusClass = 'active-tier';

                rewardsTrackHtml += `
                    <div class="reward-step ${statusClass}">
                        <div class="reward-icon-box">
                            ${idx === currentTierIndex ? `<div class="xp-label-floating">${progress.toLocaleString()} / ${target.toLocaleString()} XP</div>` : ''}
                            <img src="${imgUrl}" onerror="this.src='https://cdn.wolvesville.com/static/items/calavera.png'" style="background:#f1f5f9; border-radius:10px;">
                            ${r.amount > 1 ? `<span class="reward-badge">x${r.amount}</span>` : ''}
                        </div>
                        <div class="tier-label">Tier ${idx + 1}</div>
                    </div>
                `;
            });
            rewardsTrackHtml += '</div></div>';
        }

        let actionsHtml = '';
        if (canEdit) {
            actionsHtml = `
                <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:15px;">
                    <button onclick="window.claimQuestExtraTime('${clanId}')" title="Add Time" style="background:#3b82f6; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.85rem; display:flex; align-items:center; gap:5px;">
                        <span class="material-icons" style="font-size:18px;">alarm_add</span> 
                        Add Time (<span class="dynamic-action-price">${actionCost}</span>)
                    </button>
                    <button onclick="window.skipQuestWaitingTime('${clanId}')" title="Skip Wait" style="background:#8b5cf6; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.85rem; display:flex; align-items:center; gap:5px;">
                        <span class="material-icons" style="font-size:18px;">fast_forward</span> 
                        Skip Wait (<span class="dynamic-action-price">${actionCost}</span>)
                    </button>
                    <button onclick="window.cancelActiveQuest('${clanId}')" title="Cancel Quest" style="background:#ef4444; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.85rem; display:flex; align-items:center; gap:5px;">
                        <span class="material-icons" style="font-size:18px;">cancel</span> Cancel
                    </button>
                </div>
            `;
        }

        questsHtml = `
            <div class="active-quest-container">
                <div class="active-quest-banner" style="background-image: url('${qInfo.promoImageUrl || 'https://via.placeholder.com/800x300'}')">
                    <div class="active-quest-overlay">
                        <h2 class="active-quest-title-lg" style="color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">${qInfo.title || 'Active Clan Quest'} (Tier ${tier})</h2>
                        <div class="active-quest-meta-lg">
                            <span class="material-icons" style="font-size:16px;">schedule</span> Ends: ${formatDateThai(qData.tierEndTime || qInfo.tierEndTime)}
                        </div>
                    </div>
                </div>
                
                <div class="active-quest-body">
                    <h4 style="margin:0; color:#475569; font-size:0.9rem; display:flex; align-items:center;">
                        <span class="material-icons" style="font-size:18px; margin-right:5px; color:#f59e0b;">emoji_events</span> 
                        Quest Rewards Progression
                    </h4>

                    ${rewardsTrackHtml}
                    ${actionsHtml}
                </div>
            </div>
        `;
    } 

    // 2. AVAILABLE QUESTS
    let availableQuestsHtml = '';
    if (canEdit && !availableQuests.error && Array.isArray(availableQuests) && availableQuests.length > 0) {
        
        let shuffleVotesHtml = '';
        if (!votesData.error && votesData.shuffleVotes && Array.isArray(votesData.shuffleVotes) && votesData.shuffleVotes.length > 0) {
             const voterIds = votesData.shuffleVotes;
             const voterNames = voterIds.map(vid => memberMap[vid] || 'Unknown').join(', ');
             shuffleVotesHtml = `
                <div style="font-size:0.75rem; color:#64748b; margin-top:4px; text-align:right; background:#f1f5f9; padding:2px 8px; border-radius:4px; display:inline-block;">
                    <span style="font-weight:bold;">🗳️ Shuffle Votes (${voterIds.length}):</span> ${voterNames}
                </div>
             `;
        }

        availableQuestsHtml = `
        <div style="margin:30px 0 15px 0; border-top:1px dashed #e2e8f0; padding-top:20px;">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <h3 style="margin:0; color:#334155; font-size:1.1rem; align-self:center;">🛒 Available to Purchase</h3>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:5px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${getQuestResetTimeDisplay()}
                        <button onclick="window.shuffleClanQuests('${clanId}')" style="background:#f59e0b; color:white; border:none; padding:6px 12px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.85rem; display:flex; align-items:center; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                            <span class="material-icons" style="font-size:18px; margin-right:5px;">shuffle</span> Shuffle (500 💰)
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
            
            let buyCost = 0;
            if (isGem) {
                buyCost = 350 + (135 * participatingMemberCount);
            } else {
                buyCost = 2000 + (400 * participatingMemberCount);
            }

            let voteHtml = '';
            if (!votesData.error && votesData.votes && votesData.votes[q.id]) {
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

            const safeTitle = (q.title || 'Quest').replace(/'/g, "\\'");
            let claimBtn = '';
            if (!hasActiveQuest) {
                claimBtn = `
                    <button onclick="event.stopPropagation(); window.claimClanQuest('${clanId}', '${q.id}', '${safeTitle}')" 
                            style="background:#22c55e; color:white; border:none; padding:6px 16px; border-radius:20px; cursor:pointer; font-weight:bold; font-size:0.9rem; display:flex; align-items:center; box-shadow:0 2px 4px rgba(0,0,0,0.2);">
                        <span class="material-icons" style="font-size:18px; margin-right:4px;">shopping_cart</span> Buy
                    </button>
                `;
            }

            return `
                <div class="quest-card-large" onclick="window.showQuestModal('${q.id}')">
                      <img src="${q.promoImageUrl}" class="quest-card-large-img">
                      ${voteHtml}
                      <div class="quest-card-overlay">
                        <div>
                             <div class="quest-price-tag" style="color: ${isGem ? '#d8b4fe' : '#fcd34d'};">
                                <span class="material-icons" style="font-size:16px;">${isGem ? 'diamond' : 'monetization_on'}</span>
                                <span class="dynamic-buy-price" data-currency="${isGem?'gem':'gold'}">${buyCost.toLocaleString()}</span>
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
                    <span class="material-icons" style="margin-right:5px;">campaign</span> Post Announcement
                </div>
                <div style="display:flex; gap:10px;">
                    <textarea id="clan-announcement-input" placeholder="Type your announcement here..." style="flex:1; padding:10px; border:1px solid #cbd5e1; border-radius:6px; resize:vertical; min-height:60px; font-family:inherit;"></textarea>
                    <button onclick="window.sendClanAnnouncement('${clanId}')" style="background:var(--primary-color); color:white; border:none; padding:0 20px; border-radius:6px; cursor:pointer; align-self:flex-end; height:40px; font-weight:bold;">POST</button>
                </div>
            </div>
        `;

        if (!announcements.error && Array.isArray(announcements) && announcements.length > 0) {
             announceListContent = announcements.map(a => `
                <div style="background:#fefce8; border-left:4px solid #eab308; padding:15px; border-radius:8px; box-shadow:var(--shadow-sm);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <strong style="color:#854d0e;">${a.author || a.playerUsername || 'Leader'}</strong>
                        <span style="font-size:0.75rem; color:#a16207;">${formatDateThai(a.timestamp || a.creationTime)}</span>
                    </div>
                    <div style="color:#4b5563; font-size:0.95rem;">${linkify(a.content || a.msg || a.message)}</div>
                </div>
            `).join('');
        } else {
            announceListContent = '<div style="color:#94a3b8; text-align:center; padding:10px;">No announcements yet.</div>';
        }

        announceSectionHtml = `
            ${formHtml}
            <div style="margin-bottom:20px;">
                <h3 class="stats-section-title"><span class="material-icons">history_edu</span> Recent Announcements</h3>
                <div id="clan-announcements-container" style="display:grid; gap:10px;">
                    ${announceListContent}
                </div>
            </div>
        `;
    }

    // 4. MEMBERS
    let membersHtml = '<div style="text-align:center; padding:20px;">No Members Data</div>';
    if (!members.error && Array.isArray(members)) {
        membersHtml = members.map(m => {
            let statusColor = '#ccc';
            let statusText = m.playerStatus || m.status || 'OFFLINE';
            if (statusText === 'ONLINE' || statusText === 'DEFAULT') { statusColor = 'var(--success)'; statusText = 'DEFAULT'; }
            else if (statusText === 'PLAY') { statusColor = '#1e40af'; statusText = 'PLAY'; }
            else if (statusText === 'DND' || statusText === 'DO_NOT_DISTURB') { statusColor = '#ef4444'; statusText = 'DO NOT DISTURB'; }
            else if (statusText === 'OFFLINE') { statusColor = '#ccc'; statusText = 'INVISIBLE'; }

            const avatar = m.equippedAvatar?.url || (m.profileIconId ? `https://cdn-avatars.wolvesville.com/${m.profileIconId}` : 'https://via.placeholder.com/40');
            const avatarElemId = `member-avatar-${m.playerId}`;

            let roleBadge = '';
            let cardClass = '';
            if (info.leaderId === m.playerId) { roleBadge = '<span class="role-badge leader">Leader</span>'; cardClass = 'leader'; }
            else if (m.isCoLeader) { roleBadge = '<span class="role-badge coleader">Co-Leader</span>'; cardClass = 'coleader'; }

            const isQuest = m.participateInClanQuests;
            let questIconHtml = '';
            if (canEdit) {
                questIconHtml = `
                    <span class="material-icons quest-inline-icon clickable ${isQuest ? 'on' : 'off'}" 
                        onclick="event.stopPropagation(); window.toggleQuestFromList('${clanId}', '${m.playerId}', ${isQuest}, this)"
                        title="Toggle Quest Participation">
                        ${isQuest ? 'check_circle' : 'cancel'}
                    </span>
                `;
            } else {
                questIconHtml = `
                    <span class="material-icons quest-inline-icon ${isQuest ? 'on' : 'off'}" title="Quest Status">
                        ${isQuest ? 'check_circle' : 'cancel'}
                    </span>
                `;
            }

            const safeFlair = (m.flair || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            let flairHtml = '';
            const displayFlair = m.flair ? m.flair : '<span style="opacity:0.5; font-style:italic;">No Flair</span>';
            
            if (canEdit) {
                flairHtml = `
                    <span class="member-flair flair-editable" 
                        onclick="event.stopPropagation(); window.editFlairFromList('${clanId}', '${m.playerId}', '${safeFlair}')"
                        title="Click to Edit Flair">
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
                        title="Kick Member">
                        person_remove
                    </span>
                    <span class="material-icons action-icon block-icon" 
                        onclick="event.stopPropagation(); window.blockMemberFromList('${clanId}', '${m.playerId}', '${m.username}')"
                        title="Block Member">
                        block
                    </span>
                `;
            }

            return `
                <div class="member-card ${cardClass}" onclick="fetchMemberDetails('${clanId}', '${m.playerId}', ${canEdit})" title="Click for details">
                    <div id="${avatarElemId}" class="member-avatar" style="background-image: url('${avatar}'); background-size: cover;"></div>
                    <div class="member-details">
                        <div style="display:flex; align-items:center; flex-wrap:wrap; gap:5px;">
                            <span style="font-weight:bold; font-size:1rem;">${m.username || 'Unknown'}</span> 
                            ${roleBadge}
                            ${questIconHtml}
                            ${adminActionsHtml} <!-- Added Actions -->
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
    let chatHtml = '<div style="padding:15px; color:#ccc;">(No permission to view chat)</div>';
    if (!chat.error && Array.isArray(chat)) {
        chatHtml = chat.reverse().map(msg => {
            const isBot = !!msg.playerBotId;
            const username = isBot ? `[BOT] ${msg.playerBotOwnerUsername}` : (msg.player?.username || memberMap[msg.playerId] || 'Unknown');
            const botStyle = isBot ? 'background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:4px;' : '';
            
            let content = '';
            if (msg.emojiId) {
                const emojiData = globalEmojiMap.get(msg.emojiId);
                const emojiUrl = emojiData?.preview || `https://cdn.wolvesville.com/emojis/previews/emoji_${msg.emojiId}.png`; 
                content = `<img src="${emojiUrl}" class="chat-emoji-img" alt="Emoji" loading="lazy" onerror="this.style.display='none';this.insertAdjacentHTML('afterend', '[${msg.emojiId}]')">`;
            } else {
                content = linkify(msg.msg || '');
            }

            return `
            <div style="margin-bottom:8px; border-bottom:1px solid #f1f5f9; padding-bottom:5px;">
                <strong style="color:var(--primary-color); ${botStyle}">${username}</strong>: 
                <span style="color:${msg.isSystem?'#64748b':'#334155'}">${content}</span>
                <div style="font-size:0.7rem; color:#94a3b8;">${formatDateThai(msg.creationTime || msg.date)}</div>
            </div>
        `}).join('');
    }

    // 6. LOGS
    let logsHtml = '<div style="padding:15px; color:#ccc;">(No permission to view logs)</div>';
    if (!logs.error && Array.isArray(logs)) {
        logsHtml = logs.map(l => `
            <div style="margin-bottom:5px; font-size:0.85rem;">
                <span style="color:#64748b;">[${formatDateThai(l.creationTime)}]</span> 
                <strong>${l.playerUsername || 'System'}</strong>: ${l.action || l.type} 
                ${l.targetPlayerUsername ? `-> ${l.targetPlayerUsername}` : ''}
            </div>
        `).join('');
    }

    // 7. LEDGER
    let ledgerHtml = '<div style="padding:15px; color:#ccc;">(No permission to view ledger)</div>';
    if (!ledger.error && Array.isArray(ledger)) {
        ledgerHtml = '<div class="ledger-list">';
        ledgerHtml += ledger.slice(0, 50).map(l => `
            <div class="ledger-item">
                <div class="ledger-meta">
                    <strong>${l.playerUsername || 'System'}</strong>
                    <span class="ledger-time">${formatDateThai(l.creationTime)}</span>
                </div>
                <div class="ledger-amount ${l.gold > 0 || l.gems > 0 ? 'income' : 'expense'}">
                    ${l.gold ? `<span>${l.gold > 0 ? '+' : ''}${l.gold.toLocaleString()} Gold</span>` : ''}
                    ${l.gems ? `<span>${l.gems > 0 ? '+' : ''}${l.gems.toLocaleString()} Gems</span>` : ''}
                </div>
            </div>
        `).join('');
        ledgerHtml += '</div>';
    }

    // 8. HISTORY
    let historyHtml = '<div style="padding:15px; color:#ccc; text-align:center;">No Unclaimed Quests</div>';
    
    if (!history.error && Array.isArray(history) && history.length > 0) {
        const unclaimedQuests = history.filter(h => !h.claimedTime);

        if (unclaimedQuests.length > 0) { 
            historyHtml = '<div class="history-list">';
            historyHtml += unclaimedQuests.map(h => {
                 const questTitle = h.quest?.title || `Quest Tier ${h.tier}`;
                 const endDate = h.tierEndTime || h.endTime;
                 const questImage = h.quest?.promoImageUrl || 'https://via.placeholder.com/40';

                 let participantsHtml = '';
                 if (h.participants && Array.isArray(h.participants)) {
                     const sortedParts = [...h.participants].sort((a, b) => b.xp - a.xp);
                     participantsHtml = sortedParts.map((p, index) => {
                         const medal = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : ''));
                         return `
                             <div style="display:flex; justify-content:space-between; font-size:0.85rem; padding:4px 0; border-bottom:1px dashed #eee;">
                                 <span>${medal} <strong>${p.username || 'Unknown'}</strong></span>
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
                                <div style="font-size:0.75rem; color:#94a3b8;">End: ${formatDateThai(endDate)}</div>
                            </div>
                        </div>
                        
                        <details style="margin-top:10px; border-top:1px dashed #eee; padding-top:5px;">
                            <summary style="cursor:pointer; font-size:0.8rem; color:var(--primary-color); font-weight:600; margin-bottom:5px;">รายชื่อผู้เข้าร่วม (Participants)</summary>
                            <div style="max-height:200px; overflow-y:auto; padding-right:5px;">
                                ${participantsHtml || '<div style="color:#ccc; font-size:0.8rem;">No participants data</div>'}
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
            // initLottieAnimations(); 
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
        if (timerContainer) {
            timerContainer.outerHTML = getQuestResetTimeDisplay();
        }

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
                <div class="clan-bio">${linkify(info.description || 'No description')}</div>
                <div style="margin-top:15px; font-size:0.85rem; color:#64748b; border-top:1px dashed #e2e8f0; padding-top:10px;">
                    Language: <strong>${info.language}</strong> | Members: <strong>${info.memberCount}</strong> | XP: <strong>${info.xp?.toLocaleString()}</strong> | Created: ${formatDateThai(info.creationTime)}
                </div>
            </div>
        </div>
    `;

    const apiConsole = `
        <div class="api-console" style="margin-top:30px; border-top:1px dashed #e2e8f0; padding-top:20px;">
            <details>
                <summary style="cursor:pointer; background:#f1f5f9; padding:10px; border-radius:8px; font-weight:600; color:#475569;">
                    <span class="material-icons" style="vertical-align:bottom; margin-right:5px; font-size:20px;">data_object</span>
                    Debug: Raw Clan Data (JSON)
                </summary>
                <pre style="background:#1e1e1e; color:#a5d6ff; padding:15px; border-radius:8px; margin-top:10px; overflow:auto; max-height:400px; font-size:0.85rem; font-family:monospace;">${JSON.stringify({ info, members, quests, chat, logs, ledger, history, announcements }, null, 4)}</pre>
            </details>
        </div>
    `;

    let mainContent = `
        ${announceSectionHtml}

        <div class="stats-grid stats-grid-row2">
            <div>
                <h3 class="stats-section-title" style="display:flex; justify-content:space-between; align-items:center;">
                    <span><span class="material-icons">flag</span> Active Quests</span>
                    <!-- REMOVED REFRESH BUTTON HERE -->
                </h3>
                <div id="clan-quests-container">
                    ${questsHtml}
                    ${availableQuestsHtml} 
                </div>
            </div>
            <div>
                <h3 class="stats-section-title" style="display:flex; justify-content:space-between; align-items:center;">
                    <span><span class="material-icons">group</span> Members (${info.memberCount})</span>
                    <div style="font-size:0.75rem;">
                        Quest: 
                        <button onclick="window.toggleAllQuestParticipation('${clanId}', true)" style="background:#dcfce7; color:#166534; border:1px solid #bbf7d0; padding:2px 8px; border-radius:4px; cursor:pointer; margin-right:5px;">All ON</button>
                        <button onclick="window.toggleAllQuestParticipation('${clanId}', false)" style="background:#fee2e2; color:#991b1b; border:1px solid #fecaca; padding:2px 8px; border-radius:4px; cursor:pointer;">All OFF</button>
                    </div>
                </h3>
                <div id="clan-members-list" class="member-list" style="max-height:500px; overflow-y:auto; padding-right:5px;">
                    ${membersHtml}
                </div>
            </div>
        </div>

        <div class="stats-grid stats-grid-row2" style="margin-top:20px; align-items: start;">
            <div style="background:white; padding:20px; border-radius:12px; border:1px solid #e2e8f0;">
                <div style="font-weight:bold; color:var(--primary-color); margin-bottom:10px; font-size:1.1rem;">💬 Clan Chat (Recent)</div>
                <div id="clan-chat-container" class="clan-scroll-area">${chatHtml}</div>
                    <div style="display:flex; gap:10px; margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
                    <input type="text" id="clan-chat-input" placeholder="Type a message..." style="flex:1; padding:8px; border:1px solid #cbd5e1; border-radius:6px;" onkeydown="if(event.key==='Enter') window.sendClanChatMessage('${clanId}')">
                    <button onclick="window.sendClanChatMessage('${clanId}')" style="background:var(--primary-color); color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer;"><span class="material-icons">send</span></button>
                </div>
            </div>
            <div style="background:white; padding:20px; border-radius:12px; border:1px solid #e2e8f0;">
                <div style="font-weight:bold; color:var(--primary-color); margin-bottom:10px; font-size:1.1rem;">📜 Clan Logs</div>
                <div id="clan-logs-list" class="clan-scroll-area">${logsHtml}</div>
            </div>
        </div>

        <div class="stats-grid stats-grid-row2" style="margin-top:20px; align-items: start;">
            <div style="background:white; padding:20px; border-radius:12px; border:1px solid #e2e8f0;">
                <div style="font-weight:bold; color:var(--primary-color); margin-bottom:10px; font-size:1.1rem;">💰 Clan Ledger (Finance)</div>
                <div id="clan-ledger-list" class="clan-scroll-area">${ledgerHtml}</div>
            </div>
            <div style="background:white; padding:20px; border-radius:12px; border:1px solid #e2e8f0;">
                <div style="font-weight:bold; color:var(--primary-color); margin-bottom:10px; font-size:1.1rem;">📜 Quest History (Unclaimed Only)</div>
                <div id="clan-history-list" class="clan-scroll-area">${historyHtml}</div>
            </div>
        </div>

        ${canEdit ? `
        <div style="margin-top:20px; background:white; padding:20px; border-radius:12px; border:1px solid #e2e8f0;">
            <h3 class="stats-section-title" style="color:#ef4444;"><span class="material-icons">block</span> Blocklist Manager</h3>
            <div style="display:flex; gap:10px; margin-bottom:15px;">
                <input type="text" id="manual-block-input" placeholder="Enter Player ID (UUID) to block..." style="flex:1; padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
                <button onclick="window.manualAddToBlocklist('${clanId}')" style="background:#ef4444; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">Block ID</button>
            </div>
            <div class="blocklist-container">
                <div class="blocklist-item-wrapper" style="color:#ccc; font-style:italic;">
                    ${blockedMembers.length > 0 && !blockedMembers.error 
                        ? blockedMembers.map(m => `
                            <div class="blocked-item">
                                <span><strong>${m.username}</strong></span>
                                <button class="btn-unblock" onclick="window.unblockMember('${clanId}', '${m.id}')">Unblock</button>
                            </div>
                          `).join('') 
                        : 'No blocked members loaded'}
                </div>
            </div>
        </div>
        ` : ''}
    `;

    clanContentContainer.innerHTML = profileHeader + mainContent + apiConsole;

    const finalChatContainer = document.getElementById('clan-chat-container');
    if (finalChatContainer) {
        finalChatContainer.scrollTop = finalChatContainer.scrollHeight;
    }
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
