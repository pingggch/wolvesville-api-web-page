// **********************************************
// 0. i18n TRANSLATION SYSTEM
// **********************************************
const langDict = {
    th: {
        // Sidebar & Headers
        menu_dashboard: "แดชบอร์ด",
        menu_player: "ค้นหาผู้เล่น",
        menu_clan: "จัดการแคลน",
        menu_roles: "สารานุกรมบทบาท",
        menu_quests: "สารานุกรมเควส",
        menu_donate: "สนับสนุนผู้พัฒนา",
        menu_settings: "ตั้งค่า",
        head_dashboard: "ภาพรวมระบบ (API Overview)",
        head_player: "ค้นหาข้อมูลผู้เล่น",
        head_clan: "จัดการแคลน",
        head_roles: "ข้อมูลบทบาททั้งหมด",
        head_quests: "ข้อมูลเควสแคลนทั้งหมด",
        head_donate: "สนับสนุนการพัฒนา",
        head_settings: "ตั้งค่าระบบ",
        
        // Stats & Time
        stat_items: "ไอเทมทั้งหมดในเกม",
        stat_status: "สถานะการเชื่อมต่อ API",
        stat_checking: "กำลังตรวจสอบ...",
        stat_api_usage: "ปริมาณการเรียกใช้ API",
        stat_visitors: "จำนวนผู้เข้าชมเว็บไซต์",
        time_today: "วันนี้",
        time_month: "เดือนนี้",
        time_year: "ปีนี้",
        time_all: "ตลอดกาล",

        // Forms & Buttons
        search_player_ph: "พิมพ์ชื่อผู้เล่น หรือ Player ID...",
        search_clan_ph: "พิมพ์ชื่อแคลน หรือ Clan ID...",
        btn_search: "ค้นหา",
        btn_my_clan: "⭐ แคลนของฉัน",
        empty_search_player: "กรุณาพิมพ์ชื่อผู้เล่นที่ต้องการค้นหา",
        empty_search_clan: "พิมพ์ชื่อเพื่อค้นหาแคลน หรือกดดู \"แคลนของฉัน\"",
        loading_roles: "กำลังโหลดข้อมูลบทบาท...",
        loading_quests: "กำลังโหลดข้อมูลเควส...",
        
        // Donate
        donate_title: "สนับสนุนค่าเซิร์ฟเวอร์และผู้พัฒนา",
        donate_desc: "หากคุณใช้งานแล้วชื่นชอบ สามารถช่วยสมทบทุนค่าเซิร์ฟเวอร์หรือเลี้ยงกาแฟผู้พัฒนาได้นะครับ เพื่อให้ระบบเปิดใช้งานได้ในระยะยาว",
        donate_acc_name: "ชื่อบัญชี: นายพีรภัทร เพชรจันทร์เพ็ญ",
        donate_truemoney: "โอนผ่านทรูมันนี่วอลเล็ท",
        donate_ingame: "ส่งของขวัญในเกม",
        donate_ingame_desc: "สามารถแอดเพื่อนมาส่งของขวัญในเกมได้เช่นกันครับ",
        donate_thanks: "ขอขอบคุณทุกการสนับสนุนครับ",

        // Settings
        settings_api_desc: "กรุณาวาง API Key จาก Wolvesville Bot ของคุณที่นี่",
        btn_save_key: "บันทึกข้อมูล",
        settings_lang_title: "<span class=\"material-icons\" style=\"vertical-align: middle;\">language</span> ภาษา (Language)",
        settings_lang_desc: "เลือกภาษาสำหรับการแสดงผลและข้อมูลหน้าเว็บ",
        btn_save_lang: "บันทึกการตั้งค่าภาษา",
        msg_lang_saved: "✅ บันทึกภาษาเรียบร้อยแล้ว (กำลังรีเฟรชข้อมูล...)",
        footer_cr: "Wolvesville API Dashboard | พัฒนาและออกแบบโดย PingkungXD",

        // Feedback Modal
        feedback_title: "<span class=\"material-icons\">rate_review</span> ส่งคำติชม / รายงานปัญหา",
        feedback_desc: "หากพบเจอบัคหรือมีไอเดียใหม่ๆ สามารถพิมพ์แจ้งเราได้เลยครับ (แนบรูปภาพได้ด้วยนะ)",
        feedback_topic: "หัวข้อ",
        feedback_opt_bug: "🐛 รายงานปัญหา (Bug)",
        feedback_opt_sug: "💡 ข้อเสนอแนะ (Suggestion)",
        feedback_opt_oth: "📝 อื่นๆ (Other)",
        feedback_detail: "รายละเอียด",
        feedback_ph: "อธิบายรายละเอียดเพิ่มเติมที่นี่...",
        feedback_img: "แนบรูปภาพประกอบ (ถ้ามี)",
        btn_send_feedback: "ส่งข้อความ",

        // Alerts & Common
        alert_success: "สำเร็จ",
        alert_error: "เกิดข้อผิดพลาด",
        alert_warning: "แจ้งเตือน",
        alert_fatal: "ระบบขัดข้อง",
        btn_cancel: "ยกเลิก",
        btn_confirm: "ยืนยัน",
        btn_close: "ปิด",
        btn_save: "บันทึก",
        btn_ok: "ตกลง",
        btn_reload: "โหลดข้อมูลใหม่",
        no_api_key: "กรุณาใส่ API Key ในหน้าตั้งค่าก่อนใช้งาน",
        unknown_err: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
        req_limit: "ระบบถูกจำกัดการใช้งานชั่วคราว กรุณารอสักครู่",

        // Player UI
        txt_level: "เลเวล",
        txt_coleader: "รองหัวหน้า",
        txt_leader: "หัวหน้า",
        txt_joined: "เข้าร่วมเมื่อ",
        txt_last_online: "ออนไลน์ล่าสุด",
        txt_online: "ออนไลน์",
        txt_playing: "กำลังเล่นเกม",
        txt_dnd: "ห้ามรบกวน",
        txt_offline: "ออฟไลน์",
        txt_donations: "💰 สถิติการบริจาค",
        txt_period: "ระยะเวลา",
        txt_gold: "ทอง",
        txt_gem: "เพชร",
        txt_week: "สัปดาห์นี้",
        txt_activity: "⚔️ กิจกรรมภายในแคลน",
        txt_xp_week: "XP สัปดาห์นี้",
        txt_xp_month: "XP เดือนนี้",
        txt_xp_all: "✨ XP รวมทั้งหมด",
        txt_g_quests: "ทำเควสทอง",
        txt_d_quests: "ทำเควสเพชร",
        txt_times: "ครั้ง",
        txt_p_id: "ID",
        
        // Stats UI
        txt_overview: "ภาพรวม",
        txt_games: "จำนวนรอบที่เล่น",
        txt_rounds: "รอบ",
        txt_playtime: "เวลาเล่นรวม",
        txt_hrs: "ชั่วโมง",
        txt_winrate: "อัตราชนะ",
        txt_top_roles: "บทบาทที่เล่นบ่อยที่สุด:",
        txt_ranked: "โหมดจัดอันดับ (Ranked)",
        txt_score_max: "คะแนน / สูงสุด",
        txt_best_rank: "อันดับสูงสุด",
        txt_win_loss: "ชนะ / แพ้",
        txt_no_ranked: "ไม่มีข้อมูลโหมดจัดอันดับ",
        txt_perf: "ผลงานการเล่น",
        txt_village: "ฝ่ายหมู่บ้าน",
        txt_werewolf: "ฝ่ายหมาป่า",
        txt_solo: "ฝ่ายเดี่ยว / โหวต",
        txt_role_cards: "การ์ดบทบาทที่มี",

        // Clan UI
        txt_my_clan: "กำลังดึงข้อมูลแคลนของคุณ...",
        txt_search_clan: "กำลังค้นหาแคลน...",
        txt_not_in_clan: "❌ บัญชีนี้ยังไม่ได้เข้าร่วมแคลนใดๆ",
        txt_clan_not_found: "❌ ไม่พบแคลนที่คุณค้นหา",
        txt_auto_update: "[ระบบอัปเดตอัตโนมัติ] เปิดใช้งานแล้ว (รีเฟรชทุก 1 วินาที)",
        txt_loading_clan: "กำลังโหลดข้อมูลแคลน...",
        txt_members: "สมาชิก",
        txt_clan_xp: "XP แคลน",
        txt_created: "ก่อตั้งเมื่อ",
        txt_active_quest: "เควสที่กำลังดำเนินการ",
        txt_no_active_quest: "ตอนนี้ยังไม่มีเควสที่กำลังทำอยู่",
        txt_tier: "ด่านที่",
        txt_ends: "สิ้นสุดเวลา",
        txt_quest_prog: "ความคืบหน้าของเควส",
        txt_add_time: "เพิ่มเวลา",
        txt_skip_wait: "ข้ามเวลารอ",
        txt_cancel_quest: "ยกเลิกเควส",
        txt_top_parts: "ผู้ที่มีส่วนร่วมสูงสุด",
        txt_avail_quests: "เควสที่สามารถซื้อได้",
        txt_quest_wiki: "สารานุกรมเควส",
        txt_shuffle: "สุ่มเควสใหม่",
        txt_shuffle_votes: "รายชื่อคนโหวตสุ่ม",
        txt_buy_quest: "ซื้อเควส",
        
        // Auto Quest System
        txt_auto_buy: "🤖 ตั้งเวลาซื้ออัตโนมัติ",
        txt_auto_buy_confirm: "ระบบจะซื้อเควสนี้ให้อัตโนมัติทันทีที่แคลนว่างและมีเงินเพียงพอ<br><br><span style='color:#b91c1c; font-size:0.85rem; padding:10px; background:#fef2f2; border-radius:8px; display:inline-block; border:1px solid #fecaca; line-height: 1.5; text-align: left;'>⚠️ <b>ข้อชี้แจง:</b> เพื่อให้ระบบทำงานแทนคุณได้ตอนปิดเว็บ API Key ของคุณจะถูกบันทึกไว้ในเซิร์ฟเวอร์ชั่วคราว<br>🛡️ <i>เราขอให้คำมั่นสัญญาว่าจะไม่มีการแอบดู หรือนำ API ของคุณไปใช้ทำอย่างอื่นโดยเด็ดขาดครับ</i></span><br><br>ยืนยันการตั้งเวลาสำหรับเควส:",
        txt_auto_buy_success: "✅ บันทึกการตั้งเวลาสำเร็จ (ระบบจะตรวจสอบและซื้อให้อัตโนมัติ)",

        txt_rewards: "รางวัลที่จะได้รับ",
        txt_post_ann: "ประกาศข้อความแคลน",
        txt_ph_ann: "พิมพ์ข้อความประกาศของคุณที่นี่...",
        txt_btn_post: "โพสต์",
        txt_recent_ann: "ประกาศล่าสุด",
        txt_no_ann: "ยังไม่มีประกาศในแคลน",
        txt_clan_chat: "แชทแคลน",
        txt_ph_chat: "พิมพ์ข้อความแชท...",
        txt_clan_logs: "บันทึกกิจกรรมแคลน",
        txt_clan_ledger: "บัญชีรายรับ-รายจ่ายแคลน",
        txt_quest_hist: "ประวัติการทำเควส",
        txt_no_unclaim: "ไม่มีประวัติการทำเควส",
        txt_parts_list: "รายชื่อผู้เข้าร่วม",
        txt_no_parts: "ไม่มีข้อมูลผู้เข้าร่วม",
        txt_blocklist_mgr: "จัดการแบล็คลิสต์ (บัญชีดำ)",
        txt_ph_block: "ระบุ ID ผู้เล่น (UUID) ที่ต้องการบล็อค...",
        txt_btn_block: "บล็อคผู้เล่น",
        txt_unblock: "ปลดบล็อค",
        txt_no_blocks: "ไม่มีรายชื่อผู้เล่นที่ถูกบล็อค",
        txt_all_on: "เปิดทุกคน",
        txt_all_off: "ปิดทุกคน",

        // Inactivity Monitor
        txt_monitor_title: "ตรวจสอบคนอู้งาน",
        txt_monitor_desc: "สมาชิกที่ไม่ออนไลน์เกิน 3 วัน หรือ XP สัปดาห์นี้เป็น 0",
        btn_copy_id: "Copy ID",
        txt_inactive_days: "ไม่ออนไลน์มาแล้ว",

        // Fee Tracker
        txt_fee_tracker_title: "เช็คสถานะจ่ายค่าแคลน",
        txt_fee_tracker_desc: "ข้อมูลการติ๊กจ่ายจะถูกบันทึกไว้ในเบราว์เซอร์เครื่องนี้เท่านั้น",
        btn_reset_fees: "รีเซ็ตทั้งหมด",
        txt_paid: "จ่ายแล้ว",
        txt_unpaid: "ยังไม่จ่าย",

        // Quest Fee Tracker
        txt_quest_fee_title: "เช็คค่าเควส (รายสัปดาห์)",
        
        // API Consent
        api_consent_title: "🛡️ ข้อตกลงการใช้งาน API Key",
        api_consent_desc: "เว็บไซต์นี้จำเป็นต้องใช้ API Key ของท่านเพื่ออ่านข้อมูลจากเกม Wolvesville มาแสดงผลบนเว็บไซต์",
        api_consent_cb: "ข้าพเจ้ายอมรับให้เว็บไซต์อ่านข้อมูล และรับทราบว่าเว็บไซต์จะไม่แอบดูหรือนำ API ของท่านไปใช้งานอื่นโดยเด็ดขาด",
        api_consent_err: "⚠️ กรุณากดยอมรับเงื่อนไขก่อนบันทึก API Key",

        // Loading Steps
        load_init: "กำลังเตรียมระบบ...",
        load_info: "กำลังดึงข้อมูลพื้นฐาน...",
        load_members: "กำลังดึงรายชื่อสมาชิก...",
        load_quests: "กำลังดึงข้อมูลเควสปัจจุบัน...",
        load_chat: "กำลังดึงประวัติแชท...",
        load_logs: "กำลังดึงบันทึกกิจกรรม...",
        load_ledger: "กำลังดึงบัญชีแคลน...",
        load_history: "กำลังดึงประวัติเควส...",
        load_ann: "กำลังดึงประกาศแคลน...",
        load_blocklist: "กำลังดึงรายชื่อแบล็คลิสต์...",
        load_blocked_p: "กำลังประมวลผลข้อมูลคนถูกบล็อค...",
        load_avail_q: "กำลังตรวจสอบเควสที่ซื้อได้...",
        load_votes: "กำลังดึงข้อมูลการโหวต...",
        load_avatars: "กำลังโหลดรูปโปรไฟล์",
        load_dash: "กำลังสร้างหน้าแดชบอร์ด..."
    },
    en: {
        // Sidebar & Headers
        menu_dashboard: "Dashboard",
        menu_player: "Player Search",
        menu_clan: "Clan Manager",
        menu_roles: "Role Wiki",
        menu_quests: "Quest Wiki",
        menu_donate: "Donate",
        menu_settings: "Settings",
        head_dashboard: "API Overview",
        head_player: "Player Search",
        head_clan: "Clan Manager",
        head_roles: "All Roles",
        head_quests: "All Clan Quests",
        head_donate: "Support Development",
        head_settings: "Settings",
        
        // Stats & Time
        stat_items: "Total In-game Items",
        stat_status: "API Connection Status",
        stat_checking: "Checking...",
        stat_api_usage: "API Usage",
        stat_visitors: "Web Visitors",
        time_today: "Today",
        time_month: "This Month",
        time_year: "This Year",
        time_all: "Lifetime",

        // Forms & Buttons
        search_player_ph: "Username or Player ID...",
        search_clan_ph: "Clan Name or Clan ID...",
        btn_search: "Search",
        btn_my_clan: "⭐ My Clan",
        empty_search_player: "Please enter a username to start searching",
        empty_search_clan: "Search for a clan or click \"My Clan\"",
        loading_roles: "Loading roles data...",
        loading_quests: "Loading quests data...",

        // Donate
        donate_title: "Support Server & Developer",
        donate_desc: "If you like Wolvesville API Dashboard, you can support server costs and buy me a coffee!",
        donate_acc_name: "Account Name: Peerapat Phetchanphen",
        donate_truemoney: "Transfer to Wallet",
        donate_ingame: "In-game Gift",
        donate_ingame_desc: "Add friend and send a gift in-game!",
        donate_thanks: "Thank you for all your support!",

        // Settings
        settings_api_desc: "Please paste your Wolvesville Bot API Key here",
        btn_save_key: "Save Key",
        settings_lang_title: "<span class=\"material-icons\" style=\"vertical-align: middle;\">language</span> Language",
        settings_lang_desc: "Select language for API data and UI menus",
        btn_save_lang: "Save Language",
        msg_lang_saved: "✅ Language saved! (Refreshing data...)",
        footer_cr: "Wolvesville API Dashboard | Developed by PingkungXD",

        // Feedback Modal
        feedback_title: "<span class=\"material-icons\">rate_review</span> Send Feedback",
        feedback_desc: "Found a bug or have a new idea? Let us know and attach an image!",
        feedback_topic: "Topic",
        feedback_opt_bug: "🐛 Bug Report",
        feedback_opt_sug: "💡 Suggestion",
        feedback_opt_oth: "📝 Other",
        feedback_detail: "Details",
        feedback_ph: "Type your message here...",
        feedback_img: "Attach Image (Optional)",
        btn_send_feedback: "Send Message",

        // Alerts & Common
        alert_success: "Success",
        alert_error: "Error",
        alert_warning: "Warning",
        alert_fatal: "Critical Error",
        btn_cancel: "Cancel",
        btn_confirm: "Confirm",
        btn_close: "Close",
        btn_save: "Save",
        btn_ok: "OK",
        btn_reload: "Reload",
        no_api_key: "Please enter your API Key in Settings.",
        unknown_err: "Unknown error occurred.",
        req_limit: "Too many requests. Please wait a moment.",

        // Player UI
        txt_level: "Level",
        txt_coleader: "Co-Leader",
        txt_leader: "Leader",
        txt_joined: "Joined",
        txt_last_online: "Last Online",
        txt_online: "Online",
        txt_playing: "Playing",
        txt_dnd: "Do Not Disturb",
        txt_offline: "Offline",
        txt_donations: "💰 Donations",
        txt_period: "Period",
        txt_gold: "Gold",
        txt_gem: "Gems",
        txt_week: "This Week",
        txt_activity: "⚔️ Activity",
        txt_xp_week: "XP (Week)",
        txt_xp_month: "XP (Month)",
        txt_xp_all: "✨ XP (All Time)",
        txt_g_quests: "Gold Quests",
        txt_d_quests: "Gem Quests",
        txt_times: "times",
        txt_p_id: "ID",

        // Stats UI
        txt_overview: "Overview",
        txt_games: "Games Played",
        txt_rounds: "Rounds",
        txt_playtime: "Total Playtime",
        txt_hrs: "hrs",
        txt_winrate: "Win Rate",
        txt_top_roles: "Top Roles:",
        txt_ranked: "Ranked Season",
        txt_score_max: "Skill / Max",
        txt_best_rank: "Best Rank",
        txt_win_loss: "Wins / Loss",
        txt_no_ranked: "No Ranked Data",
        txt_perf: "Performance",
        txt_village: "Village",
        txt_werewolf: "Werewolf",
        txt_solo: "Voting / Solo",
        txt_role_cards: "Role Cards",

        // Clan UI
        txt_my_clan: "Loading My Clan...",
        txt_search_clan: "Searching Clan...",
        txt_not_in_clan: "❌ You are not in any clan",
        txt_clan_not_found: "❌ Clan not found",
        txt_auto_update: "[Auto-Update] Enabled (1s interval)",
        txt_loading_clan: "Loading Clan Data...",
        txt_members: "Members",
        txt_clan_xp: "Clan XP",
        txt_created: "Created",
        txt_active_quest: "Active Quest",
        txt_no_active_quest: "No Active Quests",
        txt_tier: "Tier",
        txt_ends: "Ends",
        txt_quest_prog: "Quest Progression",
        txt_add_time: "Add Time",
        txt_skip_wait: "Skip Wait",
        txt_cancel_quest: "Cancel Quest",
        txt_top_parts: "Top Participants",
        txt_avail_quests: "Available to Purchase",
        txt_quest_wiki: "Quest Wiki",
        txt_shuffle: "Shuffle",
        txt_shuffle_votes: "Shuffle Votes",
        txt_buy_quest: "Buy Quest",

        // Auto Quest System
        txt_auto_buy: "🤖 Schedule Auto-Buy",
        txt_auto_buy_confirm: "The system will automatically purchase this quest when clan is ready.<br><br><span style='color:#b91c1c; font-size:0.85rem; padding:10px; background:#fef2f2; border-radius:8px; display:inline-block; border:1px solid #fecaca; line-height: 1.5; text-align: left;'>⚠️ <b>Notice:</b> To allow background tasks, your API Key will be temporarily stored in our server.<br>🛡️ <i>We promise not to peek at or use your API key for any other purposes.</i></span><br><br>Confirm schedule for:",
        txt_auto_buy_success: "✅ Schedule saved! (System will auto-buy)",

        txt_rewards: "Rewards",
        txt_post_ann: "Post Announcement",
        txt_ph_ann: "Type your announcement here...",
        txt_btn_post: "POST",
        txt_recent_ann: "Recent Announcements",
        txt_no_ann: "No announcements yet.",
        txt_clan_chat: "Clan Chat",
        txt_ph_chat: "Type a message...",
        txt_clan_logs: "Clan Logs",
        txt_clan_ledger: "Clan Ledger",
        txt_quest_hist: "Quest History",
        txt_no_unclaim: "No quest history available",
        txt_parts_list: "Participants List",
        txt_no_parts: "No participants data",
        txt_blocklist_mgr: "Blocklist Manager",
        txt_ph_block: "Enter Player ID (UUID) to block...",
        txt_btn_block: "Block ID",
        txt_unblock: "Unblock",
        txt_no_blocks: "No blocked members found.",
        txt_all_on: "All ON",
        txt_all_off: "All OFF",

        // Inactivity Monitor
        txt_monitor_title: "Inactivity Monitor",
        txt_monitor_desc: "Offline for 3+ days or 0 XP this week",
        btn_copy_id: "Copy ID",
        txt_inactive_days: "Offline for",

        // Fee Tracker
        txt_fee_tracker_title: "Fee Tracker",
        txt_fee_tracker_desc: "Data is saved locally in your browser.",
        btn_reset_fees: "Reset All",
        txt_paid: "Paid",
        txt_unpaid: "Unpaid",

        // Quest Fee Tracker
        txt_quest_fee_title: "Quest Fees (Weekly)",

        // API Consent
        api_consent_title: "🛡️ API Key Usage Consent",
        api_consent_desc: "This website requires your API Key to fetch and display data from Wolvesville.",
        api_consent_cb: "I consent to let the website read my data and acknowledge that my API Key will not be peeked at or misused.",
        api_consent_err: "⚠️ Please check the consent box before saving.",

        // Loading Steps
        load_init: "Initializing system...",
        load_info: "Fetching clan info...",
        load_members: "Fetching members list...",
        load_quests: "Fetching active quests...",
        load_chat: "Fetching chat history...",
        load_logs: "Fetching logs...",
        load_ledger: "Fetching ledger...",
        load_history: "Fetching quest history...",
        load_ann: "Fetching announcements...",
        load_blocklist: "Fetching blocklist...",
        load_blocked_p: "Processing blocked players...",
        load_avail_q: "Fetching available quests...",
        load_votes: "Fetching votes data...",
        load_avatars: "Loading avatars",
        load_dash: "Rendering dashboard..."
    }
};

function getLocale() {
    return localStorage.getItem('wolvesville_api_locale') || 'th';
}

function t(key) {
    const locale = getLocale();
    return langDict[locale][key] || key;
}

function applyTranslations() {
    const locale = getLocale();
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(langDict[locale][key]) {
            el.innerHTML = langDict[locale][key]; 
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if(langDict[locale][key]) {
            el.placeholder = langDict[locale][key];
        }
    });
}

console.log('--- script.js: โหลดระบบเริ่มต้น ---'); 

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
let questCooldownInterval = null;
let inlineQfeeTimerInterval = null;
let clanTickCounter = 0; // เพิ่มตัวนับเพื่อสลับการโหลดหนัก/เบา

let currentClanLedger = []; 

// 🌟 ตัวแปรเก็บ Request ID เพื่อป้องกัน API วิ่งชนกัน (Race Condition) 🌟
let currentClanRequestId = 0; 
let currentPlayerRequestId = 0;

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
                <h3 style="display:flex; align-items:center; gap:8px;">${isDangerous ? '⚠️' : ''} ${title}</h3>
                <p style="margin-top: 10px;">${message}</p>
                <div class="custom-modal-buttons">
                    <button class="btn-modal btn-cancel">${t('btn_cancel')}</button>
                    <button class="btn-modal action-confirm ${isDangerous ? 'btn-danger' : 'btn-confirm'}">${t('btn_confirm')}</button>
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
                <button class="btn-modal btn-confirm">${t('btn_close')}</button>
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
                <p style="margin-top: 10px;">${message}</p>
                <input type="text" id="custom-prompt-input" value="${defaultValue.replace(/"/g, '&quot;')}" style="width: 80%; padding: 10px; margin: 10px 0; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem;">
                <div class="custom-modal-buttons">
                    <button class="btn-modal btn-cancel">${t('btn_cancel')}</button>
                    <button class="btn-modal btn-confirm">${t('btn_save')}</button>
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

function showSchedulePrompt(title, message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        const now = new Date();
        const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        const nowStr = localNow.toISOString().slice(0, 16);
        
        let reset = new Date();
        const day = reset.getDay();
        const diff = (8 - day) % 7; 
        const isTodayReset = (day === 1 && reset.getHours() < 7);
        reset.setDate(reset.getDate() + (isTodayReset ? 0 : diff));
        reset.setHours(7, 0, 0, 0);
        if (reset < new Date()) {
            reset.setDate(reset.getDate() + 7);
        }
        const localReset = new Date(reset.getTime() - reset.getTimezoneOffset() * 60000);
        const maxStr = localReset.toISOString().slice(0, 16);
        
        const labelStr = getLocale() === 'en' 
            ? 'Scheduled Time (Max: Mon 07:00 AM):' 
            : 'ตั้งเวลาระบุวันที่ (ไม่เกินวันจันทร์ 07:00 น.):';

        const consentLabel = getLocale() === 'en'
            ? 'I consent to temporarily save my API Key on the server for automated purchasing.'
            : 'ฉันยอมรับให้ระบบบันทึก API Key ชั่วคราว เพื่อใช้รันคำสั่งอัตโนมัติ';

        const errorMsg = getLocale() === 'en'
            ? '⚠️ Please check the consent box before confirming.'
            : '⚠️ กรุณากดยอมรับเงื่อนไขการบันทึก API Key ก่อนยืนยัน';

        overlay.innerHTML = `
            <div class="modal-content">
                <h3 style="display:flex; align-items:center; justify-content:center; gap:8px;"><span class="material-icons" style="color:var(--primary-color);">schedule</span> ${title}</h3>
                <p style="margin-top: 10px; text-align:center;">${message}</p>
                <div style="margin: 20px 0; text-align: left; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <label style="font-size:0.9rem; color:#475569; display:block; margin-bottom:8px; font-weight:bold;">
                        ${labelStr}
                    </label>
                    <input type="datetime-local" id="schedule-time-input" min="${nowStr}" max="${maxStr}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size:1rem; cursor:pointer;">
                    <div style="font-size:0.75rem; color:#94a3b8; margin-top:5px;">* ปล่อยว่างไว้หากต้องการให้ซื้อทันทีที่แคลนว่าง</div>
                    
                    <div style="margin-top: 15px; display: flex; align-items: flex-start; gap: 10px; background: #fffbeb; border: 1px solid #fde68a; padding: 12px; border-radius: 8px; transition: all 0.2s;" id="consent-box-wrapper">
                        <input type="checkbox" id="consent-save-api" style="margin-top: 3px; width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; accent-color: #d97706;">
                        <label for="consent-save-api" style="font-size: 0.85rem; color: #b45309; cursor: pointer; line-height: 1.4; font-weight: bold;">
                            ${consentLabel}
                        </label>
                    </div>
                    <div id="consent-error" style="color: #ef4444; font-size: 0.85rem; margin-top: 10px; display: none; text-align: center; font-weight: bold; transition: 0.2s;">
                        ${errorMsg}
                    </div>
                </div>
                <div class="custom-modal-buttons">
                    <button class="btn-modal btn-cancel">${t('btn_cancel')}</button>
                    <button class="btn-modal btn-confirm">${t('btn_confirm')}</button>
                </div>
            </div>
        `;
        
        const close = (val) => { overlay.remove(); resolve(val); };
        overlay.querySelector('.btn-cancel').onclick = () => close(null);
        
        overlay.querySelector('.btn-confirm').onclick = () => {
            const isConsent = overlay.querySelector('#consent-save-api').checked;
            if (!isConsent) {
                // แจ้งเตือนถ้ายังไม่ติ๊กยอมรับ
                const errEl = overlay.querySelector('#consent-error');
                const boxWrapper = overlay.querySelector('#consent-box-wrapper');
                errEl.style.display = 'block';
                boxWrapper.style.borderColor = '#ef4444';
                boxWrapper.style.backgroundColor = '#fef2f2';
                
                // แอนิเมชันสั่นเบาๆ
                errEl.style.transform = 'translateX(-5px)';
                setTimeout(() => errEl.style.transform = 'translateX(5px)', 50);
                setTimeout(() => errEl.style.transform = 'translateX(-5px)', 100);
                setTimeout(() => errEl.style.transform = 'translateX(0)', 150);
                return;
            }
            
            const timeVal = overlay.querySelector('#schedule-time-input').value;
            close(timeVal ? new Date(timeVal).getTime() : 0); 
        };

        // ซ่อนข้อความแจ้งเตือนเมื่อติ๊กถูกแล้ว
        overlay.querySelector('#consent-save-api').onchange = (e) => {
            if (e.target.checked) {
                overlay.querySelector('#consent-error').style.display = 'none';
                overlay.querySelector('#consent-box-wrapper').style.borderColor = '#fde68a';
                overlay.querySelector('#consent-box-wrapper').style.backgroundColor = '#fffbeb';
            }
        };

        overlay.onclick = (e) => { if(e.target === overlay) close(null); };
        
        document.body.appendChild(overlay);
    });
}

function showApiConsentModal() {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        const title = t('api_consent_title');
        const desc = t('api_consent_desc');
        const cbLabel = t('api_consent_cb');
        const errMsg = t('api_consent_err');

        overlay.innerHTML = `
            <div class="modal-content">
                <h3 style="display:flex; align-items:center; justify-content:center; gap:8px;">${title}</h3>
                <p style="margin-top: 10px; text-align:center;">${desc}</p>
                <div style="margin: 20px 0; text-align: left; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: flex-start; gap: 10px; background: #fffbeb; border: 1px solid #fde68a; padding: 12px; border-radius: 8px; transition: all 0.2s;" id="api-consent-box-wrapper">
                        <input type="checkbox" id="api-consent-checkbox" style="margin-top: 3px; width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; accent-color: #d97706;">
                        <label for="api-consent-checkbox" style="font-size: 0.85rem; color: #b45309; cursor: pointer; line-height: 1.4; font-weight: bold;">
                            ${cbLabel}
                        </label>
                    </div>
                    <div id="api-consent-error" style="color: #ef4444; font-size: 0.85rem; margin-top: 10px; display: none; text-align: center; font-weight: bold; transition: 0.2s;">
                        ${errMsg}
                    </div>
                </div>
                <div class="custom-modal-buttons">
                    <button class="btn-modal btn-cancel">${t('btn_cancel')}</button>
                    <button class="btn-modal btn-confirm">${t('btn_confirm')}</button>
                </div>
            </div>
        `;
        
        const close = (val) => { overlay.remove(); resolve(val); };
        overlay.querySelector('.btn-cancel').onclick = () => close(false);
        
        overlay.querySelector('.btn-confirm').onclick = () => {
            const isConsent = overlay.querySelector('#api-consent-checkbox').checked;
            if (!isConsent) {
                const errEl = overlay.querySelector('#api-consent-error');
                const boxWrapper = overlay.querySelector('#api-consent-box-wrapper');
                errEl.style.display = 'block';
                boxWrapper.style.borderColor = '#ef4444';
                boxWrapper.style.backgroundColor = '#fef2f2';
                
                errEl.style.transform = 'translateX(-5px)';
                setTimeout(() => errEl.style.transform = 'translateX(5px)', 50);
                setTimeout(() => errEl.style.transform = 'translateX(-5px)', 100);
                setTimeout(() => errEl.style.transform = 'translateX(0)', 150);
                return;
            }
            close(true); 
        };

        overlay.querySelector('#api-consent-checkbox').onchange = (e) => {
            if (e.target.checked) {
                overlay.querySelector('#api-consent-error').style.display = 'none';
                overlay.querySelector('#api-consent-box-wrapper').style.borderColor = '#fde68a';
                overlay.querySelector('#api-consent-box-wrapper').style.backgroundColor = '#fffbeb';
            }
        };

        overlay.onclick = (e) => { if(e.target === overlay) close(false); };
        
        document.body.appendChild(overlay);
    });
}

function showCustomAlert(title, message) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.zIndex = '9999'; 

    overlay.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 10px;">${title}</h3>
            <p>${message}</p>
            <div class="custom-modal-buttons">
                <button class="btn-modal btn-confirm">${t('btn_ok')}</button>
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
                console.error('Error in search:', e);
            }
        }
    }
};

window.goToClanSearch = (clanId) => {
    const input = document.getElementById('clan-name-input');
    if(input) {
        input.value = clanId;
        const clanTab = document.querySelector('.nav-link[data-page="clan-manager"]');
        if (clanTab) {
            clanTab.click();
        }
        
        if (typeof window.searchClan === 'function') {
            window.searchClan();
        } else {
            try {
                searchClan();
            } catch (e) {
                console.error('Error in clan search:', e);
            }
        }
    }
};

window.openInactivityMonitor = (clanId) => {
    if (!clanMembersDetailedMap || clanMembersDetailedMap.size === 0) return showCustomAlert(t('alert_warning'), 'กรุณาโหลดข้อมูลสมาชิกแคลนก่อน');

    const now = new Date();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    let inactiveList = [];

    clanMembersDetailedMap.forEach((m) => {
        let diffDays = 0;
        let diffMs = 0;
        if (m.lastOnline) {
            const lastOnline = new Date(m.lastOnline);
            diffMs = now - lastOnline;
            diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        } else {
            diffDays = 999; 
            diffMs = Infinity;
        }
        
        const xpWeek = m.xpDurations?.week || 0;

        if (diffMs > threeDaysInMs || xpWeek === 0) {
            inactiveList.push({
                ...m,
                diffDays: diffDays,
                xpWeek: xpWeek
            });
        }
    });

    inactiveList.sort((a, b) => b.diffDays - a.diffDays);

    let contentHtml = `
        <p style="color:#64748b; margin-bottom:15px; font-size:0.9rem;">${t('txt_monitor_desc')}</p>
        <div style="max-height:400px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:8px;" class="clan-scroll-area">
    `;

    if (inactiveList.length === 0) {
        contentHtml += `<div style="padding:20px; text-align:center; color:#16a34a;">✅ สมาชิกทุกคนขยันขันแข็งดีมาก!</div>`;
    } else {
        inactiveList.forEach(p => {
            const statusColor = p.diffDays >= 7 ? '#ef4444' : (p.diffDays >= 3 ? '#f59e0b' : '#64748b');
            const daysText = p.diffDays === 999 ? 'ไม่ทราบ' : `${p.diffDays} วัน`;
            contentHtml += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #f1f5f9; background:white;">
                    <div>
                        <strong style="color:#1e293b; cursor:pointer; text-decoration:underline;" onclick="document.querySelectorAll('.modal-overlay').forEach(el => el.remove()); window.goToPlayerSearch('${escapeJsString(p.username)}')">${p.username}</strong>
                        <div style="font-size:0.75rem; color:${statusColor};">
                            <span class="material-icons" style="font-size:12px; vertical-align:middle;">schedule</span> ${t('txt_inactive_days')} ${daysText} 
                            | <span style="color:#64748b;">XP: ${p.xpWeek.toLocaleString()}</span>
                        </div>
                    </div>
                    <button onclick="document.querySelectorAll('.modal-overlay').forEach(el => el.remove()); window.kickMemberFromList('${clanId}', '${p.playerId}', '${escapeJsString(p.username)}')" style="background:#fee2e2; color:#dc2626; border:1px solid #fecaca; padding:4px 8px; border-radius:6px; cursor:pointer; font-size:0.75rem; font-weight:bold; display:flex; align-items:center; gap:4px; transition: 0.2s;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
                        <span class="material-icons" style="font-size:14px;">person_remove</span> ${getLocale() === 'en' ? 'Kick' : 'เตะออก'}
                    </button>
                </div>
            `;
        });
    }

    contentHtml += `</div>`;
    showCustomInfoModal(t('txt_monitor_title'), contentHtml);
};

window.openQuestFeeSettings = (clanId) => {
    let targetGold = parseInt(localStorage.getItem(`wolvesville_qfee_gold_${clanId}`)) || 0;
    let targetGems = parseInt(localStorage.getItem(`wolvesville_qfee_gems_${clanId}`)) || 0;
    let targetXp = parseInt(localStorage.getItem(`wolvesville_qfee_xp_${clanId}`)) || 0;
    let durationDays = parseFloat(localStorage.getItem(`wolvesville_qfee_duration_${clanId}`)) || 0;

    let contentHtml = `
        <div style="margin-bottom:15px; background:#f8fafc; padding:15px; border-radius:8px; border:1px solid #e2e8f0;">
            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                <div style="flex:1; min-width:80px;">
                    <label style="font-size:0.75rem; color:#64748b; font-weight:bold;">เป้าหมาย ทอง</label>
                    <input type="number" id="qfee-target-gold-set" value="${targetGold}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-family:inherit;">
                </div>
                <div style="flex:1; min-width:80px;">
                    <label style="font-size:0.75rem; color:#64748b; font-weight:bold;">เป้าหมาย เพชร</label>
                    <input type="number" id="qfee-target-gems-set" value="${targetGems}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-family:inherit;">
                </div>
                <div style="flex:1; min-width:80px;">
                    <label style="font-size:0.75rem; color:#64748b; font-weight:bold;">เป้าหมาย XP (สัปดาห์)</label>
                    <input type="number" id="qfee-target-xp-set" value="${targetXp}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-family:inherit;">
                </div>
                <div style="flex:1; min-width:80px;">
                    <label style="font-size:0.75rem; color:#64748b; font-weight:bold;">เวลา (วัน)</label>
                    <input type="number" id="qfee-duration-set" value="${durationDays}" step="0.5" min="0" placeholder="0=ไม่จำกัด" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-family:inherit;">
                </div>
            </div>
            <div style="font-size:0.7rem; color:#ef4444; margin-top:8px;">* ใส่เวลาเป็นวัน (เช่น 1.5, 2, 0=ไม่จำกัด)</div>
        </div>
        <button id="qfee-save-settings-btn" style="width:100%; background:var(--primary-color); color:white; border:none; padding:10px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">บันทึกการตั้งค่า</button>
    `;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content" style="text-align:left; min-width: 80%; max-width: 500px;">
            <h3 style="text-align:center; display:flex; align-items:center; justify-content:center; gap:8px;">
                <span class="material-icons" style="color:var(--primary-color);">settings</span> ตั้งค่าเงื่อนไขค่าเควส
            </h3>
            ${contentHtml}
            <div class="custom-modal-buttons">
                <button class="btn-modal btn-confirm">${t('btn_close')}</button>
            </div>
        </div>
    `;

    overlay.querySelector('.btn-confirm').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
    overlay.querySelector('#qfee-save-settings-btn').onclick = () => {
        targetGold = parseInt(overlay.querySelector('#qfee-target-gold-set').value) || 0;
        targetGems = parseInt(overlay.querySelector('#qfee-target-gems-set').value) || 0;
        targetXp = parseInt(overlay.querySelector('#qfee-target-xp-set').value) || 0;
        durationDays = parseFloat(overlay.querySelector('#qfee-duration-set').value) || 0;
        
        localStorage.setItem(`wolvesville_qfee_gold_${clanId}`, targetGold);
        localStorage.setItem(`wolvesville_qfee_gems_${clanId}`, targetGems);
        localStorage.setItem(`wolvesville_qfee_xp_${clanId}`, targetXp);
        localStorage.setItem(`wolvesville_qfee_duration_${clanId}`, durationDays);
        
        overlay.remove();
        window.fetchClanData(clanId, true, true); 
    };
    document.body.appendChild(overlay);
};

window.resetQuestFeeRound = (clanId) => {
    showCustomConfirm(t('alert_warning'), 'ต้องการเริ่มรอบนับยอดใหม่หรือไม่?<br><br><span style="font-size:0.85rem; color:#64748b;">ระบบจะรีเซ็ตยอดทอง/เพชรเป็น 0 และเริ่มนับใหม่จากรายการบริจาค (Ledger) ตั้งแต่เวลานี้เป็นต้นไป พร้อมเริ่มจับเวลาใหม่</span>', true).then(confirmed => {
        if (confirmed) {
            localStorage.setItem(`wolvesville_qfee_reset_${clanId}`, Date.now().toString());
            window.fetchClanData(clanId, true, true);
        }
    });
};

window.cancelScheduledQuest = (clanId, index) => {
    let scheduled = JSON.parse(localStorage.getItem(`wolvesville_scheduled_${clanId}`) || '[]');
    scheduled.splice(index, 1);
    localStorage.setItem(`wolvesville_scheduled_${clanId}`, JSON.stringify(scheduled));
    window.fetchClanData(clanId, true, true);
};

// --- ฟังก์ชันกลางสำหรับคำนวณสถานะผู้เล่น ---
function getPlayerStatusData(playerData) {
    let isOnline = false;
    if (playerData.lastOnline) {
        const lastOnlineDate = new Date(playerData.lastOnline);
        const diffMinutes = (Date.now() - lastOnlineDate.getTime()) / (1000 * 60);
        isOnline = diffMinutes <= 5; 
    }

    const rawStatus = (playerData.playerStatus || playerData.status || 'OFFLINE').toUpperCase();

    if (isOnline) {
        if (rawStatus === 'PLAY') {
            return { text: t('txt_playing'), color: '#1e40af', cssClass: 'play', icon: 'sports_esports' };
        } else if (rawStatus === 'DO_NOT_DISTURB' || rawStatus === 'DND') {
            return { text: t('txt_dnd'), color: '#ef4444', cssClass: 'dnd', icon: 'do_not_disturb_on' };
        } else {
            return { text: t('txt_online'), color: 'var(--success)', cssClass: 'online', icon: 'fiber_manual_record' };
        }
    } else {
        return { text: t('txt_offline'), color: '#cbd5e1', cssClass: 'offline', icon: 'cloud_off' };
    }
}

// --- ฟังก์ชันแปลงค่าสีและ Gradient โปรไฟล์ให้เป็น CSS ---
function getProfileColorStyle(data) {
    if (!data) return 'var(--primary-color)'; 
    
    if (data.profileIconColorMode === 'GRADIENT') {
        const primary = data.profileIconGradientPrimary || '#1c94ff';
        const accent = data.profileIconGradientAccent || '#e982ff';
        const direction = data.profileIconGradientDirection || 'DIAGONAL';
        
        if (direction === 'RADIAL') {
            return `radial-gradient(circle, ${primary}, ${accent})`;
        } else {
            let cssDir = '135deg'; 
            if (direction === 'VERTICAL') cssDir = 'to bottom';
            else if (direction === 'HORIZONTAL') cssDir = 'to right';
            return `linear-gradient(${cssDir}, ${primary}, ${accent})`;
        }
    }
    
    return data.profileIconColor || 'var(--primary-color)';
}

window.fetchMemberDetails = async (clanId, playerId, canEdit) => {
    showCustomInfoModal('Loading...', `<div style="text-align:center; padding:30px;"><span class="material-icons loading-spinner" style="font-size:50px; color:#cbd5e1;">sync</span><div style="margin-top:15px; font-size:1.1rem; color:#64748b;">${t('loading_roles')}</div></div>`);
    
    try {
        const playerDetail = await fetchData(`/players/${playerId}`);
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        if (playerDetail && !playerDetail.error) {
            const clanData = clanMembersDetailedMap.get(playerId) || {};
            const combinedData = { ...clanData, ...playerDetail, username: clanData.username || playerDetail.username };
            
            showMemberModal(combinedData);
        } else {
            showCustomAlert(t('alert_warning'), '❌ ' + t('alert_error'));
        }
    } catch (e) {
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        showCustomAlert(t('alert_warning'), '❌ ' + e.message);
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
    
    const statusData = getPlayerStatusData(data);
    const bgStyle = getProfileColorStyle(data);
    
    const joinMsg = data.joinMessage ? `<div style="background:#f1f5f9; padding:10px; border-radius:8px; margin-top:10px; font-style:italic; color:#475569; font-size:0.9rem; border-left: 3px solid #cbd5e1;">"${data.joinMessage}"</div>` : '';

    const fmt = (n) => (n || 0).toLocaleString();
    const safeUsername = escapeJsString(data.username);

    const content = `
        <div style="display:flex; flex-direction:column; align-items:center; margin-bottom:20px;">
            <img src="${avatarUrl}" referrerpolicy="no-referrer" style="width:100px; height:100px; border-radius:25%; border:4px solid #e2e8f0; margin-bottom:10px; background: ${bgStyle}; object-fit:contain;">
            <h2 style="margin:0; font-size:1.5rem; color:#1e293b; cursor:pointer; text-decoration:underline;" 
                onclick="document.querySelectorAll('.modal-overlay').forEach(el => el.remove()); window.goToPlayerSearch('${safeUsername}')"
                title="Search Player">
                ${data.username}
            </h2>
            <div style="color:#64748b; font-size:0.9rem;">${data.flair ? `"${data.flair}"` : '-'}</div>
            <div style="margin-top:5px;">
                <span class="status-badge ${statusData.cssClass}" style="font-size:0.7rem; padding:2px 8px;">${statusData.text}</span>
                <span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:12px; font-size:0.7rem; font-weight:bold;">${t('txt_level')} ${data.level || 0}</span>
                ${data.isCoLeader ? `<span style="background:#e0f2fe; color:#075985; padding:2px 8px; border-radius:12px; font-size:0.7rem; font-weight:bold;">${t('txt_coleader')}</span>` : ''}
            </div>
            ${joinMsg}
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
             <div style="background:#f8fafc; padding:10px; border-radius:8px; border:1px solid #e2e8f0; text-align:center;">
                <div style="font-size:0.8rem; color:#64748b; margin-bottom:5px;">${t('txt_joined')}</div>
                <div style="font-weight:600; font-size:0.9rem;">${creationDate.split(' ')[0]}</div>
             </div>
             <div style="background:#f8fafc; padding:10px; border-radius:8px; border:1px solid #e2e8f0; text-align:center;">
                <div style="font-size:0.8rem; color:#64748b; margin-bottom:5px;">${t('txt_last_online')}</div>
                <div style="font-weight:600; font-size:0.85rem;">${lastOnline}</div>
             </div>
        </div>

        <h4 style="margin:15px 0 10px 0; color:#334155; border-bottom:1px solid #eee; padding-bottom:5px;">${t('txt_donations')}</h4>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:5px; text-align:center; margin-bottom:15px; font-size:0.85rem;">
            <div style="font-weight:bold; color:#64748b; font-size:0.75rem;">${t('txt_period')}</div>
            <div style="font-weight:bold; color:#d97706;">${t('txt_gold')}</div>
            <div style="font-weight:bold; color:#9333ea;">${t('txt_gem')}</div>
            
            <div style="color:#64748b;">${t('txt_week')}</div>
            <div style="color:#d97706;">${fmt(don.gold?.week)}</div>
            <div style="color:#9333ea;">${fmt(don.gems?.week)}</div>

            <div style="color:#64748b;">${t('time_month')}</div>
            <div style="color:#d97706;">${fmt(don.gold?.month)}</div>
            <div style="color:#9333ea;">${fmt(don.gems?.month)}</div>

            <div style="color:#64748b;">${t('time_all')}</div>
            <div style="color:#d97706; font-weight:bold;">${fmt(don.gold?.allTime)}</div>
            <div style="color:#9333ea; font-weight:bold;">${fmt(don.gems?.allTime)}</div>
        </div>

        <h4 style="margin:15px 0 10px 0; color:#334155; border-bottom:1px solid #eee; padding-bottom:5px;">${t('txt_activity')}</h4>
        <div style="background:#f0fdf4; padding:15px; border-radius:8px; border:1px solid #bbf7d0;">
             <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                 <div>
                    <div style="color:#166534; font-size:0.75rem; margin-bottom:2px;">${t('txt_xp_week')}</div>
                    <div style="font-weight:bold; font-size:1rem;">${fmt(xpDur.week)}</div>
                 </div>
                 <div>
                    <div style="color:#166534; font-size:0.75rem; margin-bottom:2px;">${t('txt_xp_month')}</div>
                    <div style="font-weight:bold; font-size:1rem;">${fmt(xpDur.month)}</div>
                 </div>
                 
                 <div style="grid-column: span 2; text-align: center; background: rgba(255,255,255,0.5); border-radius: 6px; padding: 5px;">
                    <div style="color:#15803d; font-size:0.75rem; margin-bottom:2px; font-weight:bold;">${t('txt_xp_all')}</div>
                    <div style="font-weight:bold; font-size:1.1rem; color:#15803d;">${fmt(data.xp)}</div>
                 </div>

                 <div>
                    <div style="color:#166534; font-size:0.75rem; margin-bottom:2px;">${t('txt_g_quests')}</div>
                    <div style="font-weight:bold; font-size:1rem;">${fmt(data.goldQuests)} ${t('txt_times')}</div>
                 </div>
                 <div>
                    <div style="color:#166534; font-size:0.75rem; margin-bottom:2px;">${t('txt_d_quests')}</div>
                    <div style="font-weight:bold; font-size:1rem;">${fmt(data.gemQuests)} ${t('txt_times')}</div>
                 </div>
             </div>
        </div>

        <div style="margin-top:15px; font-size:0.85rem; color:#64748b; text-align:center;">
            <strong>ID:</strong> <span style="font-family:monospace; color:var(--primary-color);">${data.playerId || data.id}</span>
        </div>
    `;
    
    showCustomInfoModal(data.username || 'Member Details', content);
}

window.showQuestModal = (questId) => {
    const quest = questDetailsCache.get(questId);
    if (!quest) return showCustomAlert(t('alert_warning'), '❌ ' + t('alert_error'));

    const title = quest.title || 'Clan Quest';
    const imageUrl = quest.promoImageUrl || 'https://via.placeholder.com/200';
    
    let rewardsHtml = '<p style="color:#64748b; font-style:italic;">No Specific Rewards</p>';
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
                if (cachedItem && cachedItem.imageUrl) imgUrl = cachedItem.imageUrl; 
                label = 'Avatar Item';
                if (r.amount <= 1) subLabel = '';
            } else if (r.type === 'GOLD') { imgUrl = EMBEDDED_ICONS.GOLD; label = t('txt_gold'); }
            else if (r.type === 'GEM' || r.type === 'GEMS') { imgUrl = EMBEDDED_ICONS.GEM; label = t('txt_gem'); }
            else if (r.type === 'ROSE' || r.type === 'ROSES' || r.type === 'ROSE_PACKAGE') { imgUrl = EMBEDDED_ICONS.ROSE; }

            return `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; background:#fff; padding:10px; border-radius:12px; border:1px solid #e2e8f0; position:relative; box-shadow: 0 1px 2px rgba(0,0,0,0.05); min-height:80px;" title="${label}">
                    <div style="position:absolute; top:0; right:0; background:#64748b; color:white; font-size:0.65rem; padding:2px 6px; border-bottom-left-radius:8px; font-weight:bold;">${t('txt_tier')} ${idx+1}</div>
                    <img src="${imgUrl}" referrerpolicy="no-referrer" onerror="${fallback}" style="width:48px; height:48px; object-fit:contain; margin-top:5px;">
                    ${subLabel ? `<div style="font-size:0.75rem; font-weight:bold; color:#475569; margin-top:5px;">${subLabel}</div>` : ''}
                </div>
            `;
        }).join('');

        const colCount = Math.max(1, Math.ceil(quest.rewards.length / 2));
        rewardsHtml = `<div style="display:grid; grid-template-columns:repeat(${colCount}, 1fr); gap:8px; margin-top:5px;">${rewardsList}</div>`;
    }

    let votesHtml = '<p style="color:#64748b; font-style:italic;">0</p>';
    if (clanVotesCache && clanVotesCache.votes && clanVotesCache.votes[questId]) {
        const voterIds = clanVotesCache.votes[questId];
        if ( voterIds.length > 0) {
            const voterNames = voterIds.map(vid => clanMembersCache[vid] || 'Unknown').join(', ');
            votesHtml = `<div style="margin-top:5px; font-size:0.9rem; color:#475569; background:#f8fafc; padding:8px; border-radius:8px; border:1px solid #e2e8f0;">${voterNames}</div>`;
        }
    }

    const content = `
        <img src="${imageUrl}" referrerpolicy="no-referrer" style="width:100%; border-radius:8px; margin-bottom:15px; border:1px solid #e2e8f0; display:block;">
        <h4 style="margin-bottom:10px; color:#334155;">🎁 ${t('txt_rewards')}</h4>
        ${rewardsHtml}
        <h4 style="margin:15px 0 10px 0; color:#334155; border-top:1px dashed #eee; padding-top:15px;">🗳️ Votes (${(clanVotesCache?.votes?.[questId] || []).length})</h4>
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
        input.disabled = true;
        const res = await sendPayload(`/clans/${clanId}/announcements`, 'POST', { message: msg });
        input.disabled = false;
        
        if (res.error) {
            let errorMsg = res.message || t('unknown_err');
            if(res.status === 429) errorMsg = t('req_limit');
            showCustomAlert(t('alert_error'), '❌ ' + errorMsg);
        } else {
            input.value = ''; 
            showCustomAlert(t('alert_success'), '✅ ' + t('alert_success'));
            fetchClanData(clanId, true, true); 
        }
    } catch (e) {
        showCustomAlert(t('alert_error'), '❌ ' + e.message);
        if(input) input.disabled = false;
    }
};

window.sendClanChatMessage = async (clanId) => {
    const input = document.getElementById('clan-chat-input');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;

    try {
        input.disabled = true;
        const res = await sendPayload(`/clans/${clanId}/chat`, 'POST', { message: msg });
        input.disabled = false;
        
        if (res.error) {
            let errorMsg = res.message || t('unknown_err');
            if(res.status === 429) errorMsg = t('req_limit');
            showCustomAlert(t('alert_error'), '❌ ' + errorMsg);
        } else {
            input.value = ''; 
            input.focus();
            fetchClanData(clanId, true, true);
        }
    } catch (e) {
        showCustomAlert(t('alert_error'), '❌ ' + e.message);
        if(input) input.disabled = false;
    }
};

window.blockMemberFromList = async (clanId, playerId, username) => {
    const confirmed = await showCustomConfirm(
        t('alert_warning'),
        `ต้องการบล็อคผู้เล่น <span style="color:#ef4444; font-weight:bold;">${username}</span> หรือไม่?`,
        true 
    );
    if (!confirmed) return;

    try {
        const res = await sendPayload(`/clans/${clanId}/members/${playerId}/block`, 'POST', {});
        if (res.error) showCustomAlert(t('alert_error'), '❌ ' + (res.message || t('unknown_err')));
        else {
            showCustomAlert(t('alert_success'), `✅ บล็อคผู้เล่น ${username} สำเร็จ`);
            fetchClanData(clanId, true, true); 
        }
    } catch (e) {
        showCustomAlert(t('alert_fatal'), '❌ ' + e.message);
    }
};

window.unblockMember = async (clanId, playerId) => {
    try {
        const res = await sendPayload(`/clans/${clanId}/members/${playerId}/unblock`, 'POST', {});
        if (res.error) showCustomAlert(t('alert_error'), '❌ ' + (res.message || t('unknown_err')));
        else fetchClanData(clanId, true, true); 
    } catch (e) {
        showCustomAlert(t('alert_fatal'), '❌ ' + e.message);
    }
};

window.manualAddToBlocklist = async (clanId) => {
    const playerId = document.getElementById('manual-block-input').value.trim();
    if (!playerId) return showCustomAlert(t('alert_warning'), 'กรุณาระบุ ID ผู้เล่น');
    if (!isUUID(playerId)) return showCustomAlert(t('alert_warning'), 'รูปแบบ UUID ไม่ถูกต้อง');

    try {
        const res = await sendPayload(`/clans/${clanId}/members/${playerId}/block`, 'POST', {});
        if (res.error) showCustomAlert(t('alert_error'), '❌ ' + (res.message || t('unknown_err')));
        else {
            showCustomAlert(t('alert_success'), `✅ บล็อค ID ${playerId} สำเร็จ`);
            document.getElementById('manual-block-input').value = '';
            fetchClanData(clanId, true, true);
        }
    } catch (e) {
        showCustomAlert(t('alert_error'), '❌ ' + e.message);
    }
};

window.kickMemberFromList = async (clanId, playerId, username) => {
    const confirmed = await showCustomConfirm(
        t('alert_warning'),
        `ต้องการเตะผู้เล่น <span style="color:#ef4444; font-weight:bold;">${username}</span> ออกจากแคลนหรือไม่?`,
        true 
    );
    if (!confirmed) return;

    try {
        const res = await sendPayload(`/clans/${clanId}/members/${playerId}/kick`, 'POST', {});
        if (res.error) {
             let errMsg = res.message || t('unknown_err');
             if (res.status === 403) errMsg = 'Forbidden (ไม่มีสิทธิ์)';
             showCustomAlert(t('alert_error'), '❌ ' + errMsg);
        } else {
            showCustomAlert(t('alert_success'), `✅ เตะ ${username} ออกจากแคลนสำเร็จ`);
            fetchClanData(clanId, true, true);
        }
    } catch (e) {
        showCustomAlert(t('alert_fatal'), '❌ ' + e.message);
    }
};

window.toggleQuestFromList = async (clanId, playerId, currentStatus, btnElement) => {
    const newStatus = !currentStatus;
    const originalIcon = btnElement.innerText;
    const originalClass = btnElement.className;
    
    btnElement.innerText = 'sync';
    btnElement.className = 'material-icons quest-inline-icon loading';
    btnElement.style.pointerEvents = 'none'; 
    
    const res = await sendPayload(`/clans/${clanId}/members/${playerId}/participateInQuests`, 'PUT', { participateInQuests: newStatus });
    
    if (res.error) {
        btnElement.innerText = originalIcon;
        btnElement.className = originalClass;
        btnElement.style.pointerEvents = 'auto';
        showCustomAlert(t('alert_error'), '❌ ' + (res.message || t('unknown_err')));
    } else {
        btnElement.innerText = newStatus ? 'check_circle' : 'cancel';
        btnElement.className = `material-icons quest-inline-icon clickable ${newStatus ? 'on' : 'off'}`;
        btnElement.style.pointerEvents = 'auto';
        btnElement.setAttribute('onclick', `event.stopPropagation(); window.toggleQuestFromList('${clanId}', '${playerId}', ${newStatus}, this)`);

        const change = newStatus ? 1 : -1;
        currentParticipatingCount += change;
        if(currentParticipatingCount < 0) currentParticipatingCount = 0;
        updatePricesClientSide();
        window.fetchClanData(clanId, true, true);
    }
};

function animateValue(obj, start, end, duration) {
    if (start === end) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) window.requestAnimationFrame(step);
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
    const newFlair = await showCustomPrompt(t('alert_warning'), 'ตั้งค่าฉายา:', currentFlair);
    if (newFlair === null) return; 

    try {
        const res = await sendPayload(`/clans/${clanId}/members/${playerId}/flair`, 'PUT', { flair: newFlair });
        if (res.error) showCustomAlert(t('alert_error'), '❌ ' + (res.message || t('unknown_err')));
        else {
            showCustomAlert(t('alert_success'), '✅ ' + t('alert_success'));
            fetchClanData(clanId, true, true);
        }
    } catch (e) {
        showCustomAlert(t('alert_fatal'), '❌ ' + e.message);
    }
};

window.toggleAllQuestParticipation = async (clanId, isParticipating) => {
    const actionTh = isParticipating ? 'เปิด' : 'ปิด';
    const confirmed = await showCustomConfirm(
        t('alert_warning'), 
        `ยืนยันการ <strong>${actionTh}</strong> เควสแคลนให้กับสมาชิกทุกคน?`, 
        !isParticipating 
    );
    if(!confirmed) return;

    try {
        const res = await sendPayload(`/clans/${clanId}/members/all/participateInQuests`, 'PUT', { participateInQuests: isParticipating });
        if (res.error) showCustomAlert(t('alert_error'), '❌ ' + (res.message || t('unknown_err')));
        else {
            showCustomAlert(t('alert_success'), '✅ ' + t('alert_success'));
            setTimeout(() => { fetchClanData(clanId, true, true); }, 1000); 
        }
    } catch (e) {
        showCustomAlert(t('alert_error'), '❌ ' + e.message);
    }
};

window.shuffleClanQuests = async (clanId) => {
    const confirmed = await showCustomConfirm(
        t('txt_shuffle'),
        'ระบบจะหักเงินแคลน <strong>500 ทอง</strong><br>เพื่อทำการสุ่มเควสใหม่ ยืนยันหรือไม่?',
        false 
    );
    if (!confirmed) return;

    try {
        const res = await sendPayload(`/clans/${clanId}/quests/available/shuffle`, 'POST', {});
        if (res.error) showCustomAlert(t('alert_error'), '❌ ' + (res.message || t('unknown_err')));
        else {
            showCustomAlert(t('alert_success'), '✅ ' + t('alert_success'));
            fetchClanData(clanId, true, true); 
        }
    } catch (e) {
        showCustomAlert(t('alert_error'), '❌ ' + e.message);
    }
};

window.skipQuestWaitingTime = async (clanId) => {
    const confirmed = await showCustomConfirm(t('txt_skip_wait'), 'ยืนยันการใช้ทองข้ามเวลารอหรือไม่?', false);
    if (!confirmed) return;

    try {
        const res = await sendPayload(`/clans/${clanId}/quests/active/skipWaitingTime`, 'POST', {});
        if (res.error) showCustomAlert(t('alert_error'), '❌ ' + (res.message || t('unknown_err')));
        else {
            showCustomAlert(t('alert_success'), '✅ ' + t('alert_success'));
            fetchClanData(clanId, true, true);
        }
    } catch(e) {
        showCustomAlert(t('alert_error'), '❌ ' + e.message);
    }
};

window.claimQuestExtraTime = async (clanId) => {
    const confirmed = await showCustomConfirm(t('txt_add_time'), 'ยืนยันการใช้ทองเพิ่มเวลาเควสหรือไม่?', false);
    if (!confirmed) return;

    try {
        const res = await sendPayload(`/clans/${clanId}/quests/active/claimTime`, 'POST', {});
        if (res.error) showCustomAlert(t('alert_error'), '❌ ' + (res.message || t('unknown_err')));
        else {
            showCustomAlert(t('alert_success'), '✅ ' + t('alert_success'));
            fetchClanData(clanId, true, true);
        }
    } catch(e) {
        showCustomAlert(t('alert_error'), '❌ ' + e.message);
    }
};

window.cancelActiveQuest = async (clanId) => {
    const confirmed = await showCustomConfirm(t('txt_cancel_quest'), 'ยืนยันการยกเลิกเควสที่กำลังทำอยู่หรือไม่?', true);
    if (!confirmed) return;

    try {
        const res = await sendPayload(`/clans/${clanId}/quests/active/cancel`, 'POST', {});
        if (res.error) showCustomAlert(t('alert_error'), '❌ ' + (res.message || t('unknown_err')));
        else {
            showCustomAlert(t('alert_success'), '✅ ' + t('alert_success'));
            fetchClanData(clanId, true, true);
        }
    } catch(e) {
        showCustomAlert(t('alert_error'), '❌ ' + e.message);
    }
};

window.claimClanQuest = async (clanId, questId, questTitle) => {
    const confirmed = await showCustomConfirm(
        t('txt_buy_quest'),
        `ยืนยันการซื้อเควส <strong>${questTitle}</strong> หรือไม่?`,
        false 
    );
    if (!confirmed) return;

    try {
        const res = await sendPayload(`/clans/${clanId}/quests/claim`, 'POST', { questId: questId });
        if (res.error) showCustomAlert(t('alert_error'), '❌ ' + (res.message || t('unknown_err')));
        else {
            showCustomAlert(t('alert_success'), '✅ ' + t('alert_success'));
            setTimeout(() => { fetchClanData(clanId, true, true); }, 3000);
        }
    } catch (e) {
        showCustomAlert(t('alert_error'), '❌ ' + e.message);
    }
};

// --- ฟังก์ชันส่งข้อมูลเพื่อตั้งเวลาซื้อเควสลงใน Database (ผ่าน Vercel API) ---
window.scheduleQuest = async (clanId, questId, questTitle) => {
    const msg = `${t('txt_auto_buy_confirm')} <br><strong style="color:var(--primary-color);">${questTitle}</strong>`;
    
    // เรียกหน้าต่างเลือกเวลา
    const targetTimeMs = await showSchedulePrompt(t('txt_auto_buy'), msg);
    if (targetTimeMs === null) return; // กดปุ่มยกเลิก

    const apiKey = localStorage.getItem('wolvesville_api_key');
    if (!apiKey) return showCustomAlert(t('alert_warning'), t('no_api_key'));

    try {
        const res = await fetch(`${localServerUrl}/api/schedule-quest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                clanId: clanId, 
                questId: questId, 
                questTitle: questTitle,
                apiKey: apiKey,
                targetTime: targetTimeMs 
            })
        });

        if (res.ok) {
            const timeStr = targetTimeMs > 0 
                ? new Date(targetTimeMs).toLocaleString(getLocale() === 'en' ? 'en-US' : 'th-TH') 
                : (getLocale() === 'en' ? 'ASAP (When clan is ready)' : 'ทันทีที่แคลนว่าง');
            
            // Save to localStorage for UI
            let scheduled = JSON.parse(localStorage.getItem(`wolvesville_scheduled_${clanId}`) || '[]');
            scheduled.push({
                questId: questId,
                questTitle: questTitle,
                targetTime: targetTimeMs,
                scheduledAt: Date.now()
            });
            localStorage.setItem(`wolvesville_scheduled_${clanId}`, JSON.stringify(scheduled));

            showCustomAlert(t('alert_success'), `✅ ${t('txt_auto_buy_success')}<br><br><span style="font-size:0.9rem; color:#64748b;">ระบบจะดำเนินการเมื่อ: <strong style="color:var(--primary-color);">${timeStr}</strong></span>`);
            window.fetchClanData(clanId, true, true);
        } else {
            const text = await res.text();
            try {
                const err = JSON.parse(text);
                showCustomAlert(t('alert_error'), '❌ ' + (err.error || err.message || t('unknown_err')));
            } catch (parseError) {
                console.error("Non-JSON Server Error:", text);
                showCustomAlert(t('alert_error'), `❌ Server Error: ${res.status} (รอ Vercel อัปเดตโค้ดสักครู่)`);
            }
        }
    } catch (e) {
        showCustomAlert(t('alert_error'), '❌ ' + e.message);
    }
};

window.reloadActiveQuest = async (clanId, canEdit) => {
    const btn = document.getElementById('reload-quest-btn');
    if (btn) {
        btn.innerHTML = `<span class="material-icons loading-spinner" style="font-size:16px;">refresh</span>...`;
        btn.disabled = true;
    }
    await window.fetchClanData(clanId, canEdit, true);
    if (btn) {
        btn.innerHTML = `<span class="material-icons" style="font-size:16px;">refresh</span> ${t('btn_reload')}`;
        btn.disabled = false;
    }
};

window.openQuestFeeSettings = (clanId) => {
    let targetGold = parseInt(localStorage.getItem(`wolvesville_qfee_gold_${clanId}`)) || 0;
    let targetGems = parseInt(localStorage.getItem(`wolvesville_qfee_gems_${clanId}`)) || 0;
    let targetXp = parseInt(localStorage.getItem(`wolvesville_qfee_xp_${clanId}`)) || 0;
    let durationDays = parseFloat(localStorage.getItem(`wolvesville_qfee_duration_${clanId}`)) || 0;

    let contentHtml = `
        <div style="margin-bottom:15px; background:#f8fafc; padding:15px; border-radius:8px; border:1px solid #e2e8f0;">
            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                <div style="flex:1; min-width:80px;">
                    <label style="font-size:0.75rem; color:#64748b; font-weight:bold;">เป้าหมาย ทอง</label>
                    <input type="number" id="qfee-target-gold-set" value="${targetGold}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-family:inherit;">
                </div>
                <div style="flex:1; min-width:80px;">
                    <label style="font-size:0.75rem; color:#64748b; font-weight:bold;">เป้าหมาย เพชร</label>
                    <input type="number" id="qfee-target-gems-set" value="${targetGems}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-family:inherit;">
                </div>
                <div style="flex:1; min-width:80px;">
                    <label style="font-size:0.75rem; color:#64748b; font-weight:bold;">เป้าหมาย XP (สัปดาห์)</label>
                    <input type="number" id="qfee-target-xp-set" value="${targetXp}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-family:inherit;">
                </div>
                <div style="flex:1; min-width:80px;">
                    <label style="font-size:0.75rem; color:#64748b; font-weight:bold;">เวลา (วัน)</label>
                    <input type="number" id="qfee-duration-set" value="${durationDays}" step="0.5" min="0" placeholder="0=ไม่จำกัด" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-family:inherit;">
                </div>
            </div>
            <div style="font-size:0.7rem; color:#ef4444; margin-top:8px;">* ใส่เวลาเป็นวัน (เช่น 1.5, 2, 0=ไม่จำกัด)</div>
        </div>
        <button id="qfee-save-settings-btn" style="width:100%; background:var(--primary-color); color:white; border:none; padding:10px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">บันทึกการตั้งค่า</button>
    `;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content" style="text-align:left; min-width: 80%; max-width: 500px;">
            <h3 style="text-align:center; display:flex; align-items:center; justify-content:center; gap:8px;">
                <span class="material-icons" style="color:var(--primary-color);">settings</span> ตั้งค่าเงื่อนไขค่าเควส
            </h3>
            ${contentHtml}
            <div class="custom-modal-buttons">
                <button class="btn-modal btn-confirm">${t('btn_close')}</button>
            </div>
        </div>
    `;

    overlay.querySelector('.btn-confirm').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
    overlay.querySelector('#qfee-save-settings-btn').onclick = () => {
        targetGold = parseInt(overlay.querySelector('#qfee-target-gold-set').value) || 0;
        targetGems = parseInt(overlay.querySelector('#qfee-target-gems-set').value) || 0;
        targetXp = parseInt(overlay.querySelector('#qfee-target-xp-set').value) || 0;
        durationDays = parseFloat(overlay.querySelector('#qfee-duration-set').value) || 0;
        
        localStorage.setItem(`wolvesville_qfee_gold_${clanId}`, targetGold);
        localStorage.setItem(`wolvesville_qfee_gems_${clanId}`, targetGems);
        localStorage.setItem(`wolvesville_qfee_xp_${clanId}`, targetXp);
        localStorage.setItem(`wolvesville_qfee_duration_${clanId}`, durationDays);
        
        overlay.remove();
        window.fetchClanData(clanId, true, true); 
    };
    document.body.appendChild(overlay);
};

window.resetQuestFeeRound = (clanId) => {
    showCustomConfirm(t('alert_warning'), 'ต้องการเริ่มรอบนับยอดใหม่หรือไม่?<br><br><span style="font-size:0.85rem; color:#64748b;">ระบบจะรีเซ็ตยอดทอง/เพชรเป็น 0 และเริ่มนับใหม่จากรายการบริจาค (Ledger) ตั้งแต่เวลานี้เป็นต้นไป พร้อมเริ่มจับเวลาใหม่</span>', true).then(confirmed => {
        if (confirmed) {
            localStorage.setItem(`wolvesville_qfee_reset_${clanId}`, Date.now().toString());
            window.fetchClanData(clanId, true, true);
        }
    });
};

window.cancelScheduledQuest = (clanId, index) => {
    let scheduled = JSON.parse(localStorage.getItem(`wolvesville_scheduled_${clanId}`) || '[]');
    scheduled.splice(index, 1);
    localStorage.setItem(`wolvesville_scheduled_${clanId}`, JSON.stringify(scheduled));
    window.fetchClanData(clanId, true, true);
};

function isUUID(str) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function formatMessage(msg) {
    return msg ? msg.replace(/\n/g, '<br>') : '-';
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
    const loc = getLocale() === 'en' ? 'en-US' : 'th-TH';
    return new Date(dateString).toLocaleString(loc, {
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
    const s = Math.floor((timeDiff % (1000 * 60)) / 1000); // เพิ่มวินาที

    const txt = getLocale() === 'en' ? `Resets in: ${d}d ${h}h ${m}m ${s}s` : `เควสจะรีเซ็ตในอีก ${d} วัน ${h} ชม. ${m} นาที ${s} วิ`;
    return `<span id="quest-reset-timer" style="font-size:0.85rem; color:#64748b; font-weight:normal; display:flex; align-items:center; gap:4px; margin-top:4px;"><span class="material-icons" style="font-size:16px;">update</span> ${txt}</span>`;
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
    if (!key) return { error: true, message: t('no_api_key') };

    const locale = getLocale();
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
    if (!key) return { error: true, message: t('no_api_key') };

    const locale = getLocale();
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
        }
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

function renderGlobalAnnouncements(data) {
    let container = document.getElementById('global-announcements-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'global-announcements-container';
        container.style.marginTop = '40px';
        const dashboardPage = document.getElementById('dashboard');
        if (dashboardPage) dashboardPage.appendChild(container);
        else return;
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
                imgHtml = `<img src="${att.url}" referrerpolicy="no-referrer" style="max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #e2e8f0; object-fit: contain; max-height: 250px;" loading="lazy">`;
            }
            
            html += `
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid ${color};">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <strong style="color: #334155; font-size: 0.95rem;">@${item.author?.username || 'System'}</strong>
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

    const isEn = getLocale() === 'en';
    const annHtml = buildList(isEn ? 'Announcements' : 'ประกาศ', 'campaign', data.announcements, 'var(--primary-color)');
    const changeHtml = buildList(isEn ? 'Changelogs' : 'อัปเดตระบบ', 'update', data.changelogs, '#f59e0b');
    const eventsHtml = buildList(isEn ? 'Events' : 'กิจกรรม', 'event', data.discordEvents, '#a855f7');

    container.innerHTML = `
        <h2 style="margin: 20px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; display: flex; align-items: center; gap: 10px;">
            <span class="material-icons" style="color: var(--primary-color);">newspaper</span> 
            ${isEn ? 'Server News & Updates' : 'ข่าวสารและอัปเดตเซิร์ฟเวอร์'}
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
    
    const loadingDot = `<span style="display:inline-block; width:12px; height:12px; border-radius:50%; background-color:#f59e0b; margin-right:8px; vertical-align:middle; box-shadow: 0 1px 3px rgba(245,158,11,0.3);"></span>`;
    if(apiStatusText) apiStatusText.innerHTML = loadingDot + t('stat_checking') + '<span class="material-icons loading-spinner icon-no-bg" style="font-size:18px; vertical-align:middle; margin-left:8px; color:#64748b;">sync</span>';
    if(apiStatusDot) apiStatusDot.style.display = 'none'; 

    const check = await fetchData('/announcements', true, false);
    
    const refreshBtnHtml = `<span class="material-icons refresh-btn" style="cursor:pointer; vertical-align:middle; color:var(--primary-color); transition: transform 0.2s;" onmouseover="this.style.transform='rotate(180deg)'" onmouseout="this.style.transform='none'" onclick="fetchAndDisplayData()" title="${getLocale() === 'en' ? 'Re-check Connection' : 'รีเช็คสถานะการเชื่อมต่อ'}">refresh</span>`;

    if (!check.error) {
        const successDot = `<span style="display:inline-block; width:12px; height:12px; border-radius:50%; background-color:#10b981; margin-right:8px; vertical-align:middle; box-shadow: 0 1px 3px rgba(16,185,129,0.3);"></span>`;
        if(apiStatusText) {
            apiStatusText.innerHTML = successDot + (getLocale() === 'en' ? 'Online (HTTP 200)' : 'ออนไลน์ (HTTP 200)') + refreshBtnHtml;
        }
        
        const items = await fetchTotalItemsCount();
        if(availableItems) {
             availableItems.innerHTML = items.error ? 'Error' : items.count.toLocaleString();
        }
        renderGlobalAnnouncements(check);
        fetchAndCacheRoles();
    } else {
        let dotColor = '#D32F2F'; 
        let statusMessage = getLocale() === 'en' ? 'Offline' : 'เชื่อมต่อไม่ได้';

        if (check.status === 401) {
            dotColor = '#f59e0b'; 
            statusMessage = getLocale() === 'en' ? 'Unauthorized' : 'API Key ไม่ถูกต้อง';
        } else if (check.status === 429) {
            dotColor = '#a855f7'; 
            statusMessage = getLocale() === 'en' ? 'Rate Limited' : 'เรียกข้อมูลถี่เกินไป';
        } else if (check.status >= 500) {
            dotColor = '#991b1b'; 
            statusMessage = getLocale() === 'en' ? 'Server Error' : 'เซิร์ฟเวอร์มีปัญหา';
        } else if (check.status === 403) {
            dotColor = '#ef4444'; 
            statusMessage = getLocale() === 'en' ? 'Forbidden' : 'ไม่มีสิทธิ์เข้าถึง';
        } else if (check.status === 404) {
            dotColor = '#64748b'; 
            statusMessage = getLocale() === 'en' ? 'Not Found' : 'ไม่พบข้อมูล';
        }

        const errorDot = `<span style="display:inline-block; width:12px; height:12px; border-radius:50%; background-color:${dotColor}; margin-right:8px; vertical-align:middle; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></span>`;
        
        const errStr = check.status ? `HTTP ${check.status}` : 'Unknown Error';
        if(apiStatusText) {
            apiStatusText.innerHTML = errorDot + `${statusMessage} (${errStr})` + refreshBtnHtml;
        }
        if(availableItems) availableItems.textContent = '-';
    }
}

async function searchAndDisplayPlayer() {
    window.searchAndDisplayPlayer = searchAndDisplayPlayer;
    const input = usernameInput.value.trim();
    if (!input) return;
    if (!localStorage.getItem('wolvesville_api_key')) {
        return showCustomAlert(t('alert_warning'), t('no_api_key'));
    }

    currentPlayerRequestId++;
    const reqId = currentPlayerRequestId;

    const isEn = getLocale() === 'en';

    playerProfileContainer.innerHTML = `
        <div style="text-align:center; padding:60px 20px; background:white; border-radius:var(--radius-lg); border:1px solid #e2e8f0; box-shadow:var(--shadow-sm); margin-top:20px; animation: fadeIn 0.3s ease-out;">
            <span class="material-icons loading-spinner" style="font-size:60px; color:var(--primary-color);">autorenew</span>
            <h3 style="color:#1e293b; margin:top:20px; font-size:1.3rem;">${isEn ? 'Searching...' : 'กำลังค้นหาข้อมูล...'}</h3>
            <p style="color:#64748b; font-size:0.95rem; margin-top:5px;">${isEn ? 'Fetching data for' : 'กำลังดึงข้อมูลของ'} <strong style="color:var(--primary-color);">${escapeJsString(input)}</strong></p>
        </div>
    `;

    let id = input;
    if (!isUUID(input)) {
        const search = await fetchData(`/players/search?username=${encodeURIComponent(input)}`);
        if (reqId !== currentPlayerRequestId) return; 

        if (search && !search.error && search.length) id = search[0].id;
        else if (search && search.id) id = search.id;
        else {
            playerProfileContainer.innerHTML = `
                <div class="empty-state" style="border-color: #fecaca; background: #fef2f2; margin-top:20px;">
                    <span class="material-icons" style="color: #ef4444; font-size: 60px;">person_off</span>
                    <h3 style="color: #991b1b; margin:10px 0; font-size:1.3rem;">${isEn ? 'Player Not Found' : 'ไม่พบผู้เล่น'}</h3>
                    <p style="color: #ef4444; font-size:0.95rem;">${isEn ? 'Could not find username' : 'ไม่พบข้อมูลของชื่อ'} <strong>${escapeJsString(input)}</strong></p>
                </div>
            `;
            return;
        }
    }

    const data = await fetchData(`/players/${id}`);
    if (reqId !== currentPlayerRequestId) return; 

    if (data && !data.error) {
        await fetchAndCacheRoles();
        if (data.clanId) {
            const clan = await fetchData(`/clans/${data.clanId}/info`);
            if (reqId !== currentPlayerRequestId) return; 
            if (!clan.error) {
                data.clanName = clan.name;
                data.clanTag = clan.tag;
            }
        }
        if (reqId !== currentPlayerRequestId) return; 
        renderPlayerProfile(data);
    } else {
        playerProfileContainer.innerHTML = `
            <div class="empty-state" style="border-color: #fecaca; background: #fef2f2; margin-top:20px;">
                <span class="material-icons" style="color: #ef4444; font-size: 60px;">error_outline</span>
                <h3 style="color: #991b1b; margin:10px 0; font-size:1.3rem;">${isEn ? 'Fetch Failed' : 'ดึงข้อมูลล้มเหลว'}</h3>
                <p style="color: #ef4444; font-size:0.95rem;">${data.message || t('unknown_err')}</p>
            </div>
        `;
    }
    fetchAndDisplayStatsOnly();
}

function renderPlayerProfile(data) {
    const stats = data.gameStats || {};
    const roles = data.roleCards || [];
    
    const total = (stats.totalWinCount||0) + (stats.totalLoseCount||0) + (stats.totalTieCount||0);
    const winRate = total > 0 ? ((stats.totalWinCount/total)*100).toFixed(1) : 0;
    
    const bestSkill = data.rankedSeasonMaxSkill || 0;
    const bestRank = data.rankedSeasonBestRank || 0;
    const playedSeasons = data.rankedSeasonPlayedCount || 0;
    const currentSkill = data.rankedSeasonSkill; 

    const hasRankedData = bestSkill > 0 || bestRank > 0 || playedSeasons > 0;
    
    let rankContentHtml = `<div style="padding:20px; text-align:center; color:#ccc">${t('txt_no_ranked')}</div>`;

    if (hasRankedData) {
        const strBestSkill = getLocale() === 'en' ? 'Overall best skill' : 'คะแนนสูงสุดรวม';
        const strBestRank = getLocale() === 'en' ? 'Best season final rank' : 'อันดับจบซีซั่นสูงสุด';
        const strSeasons = getLocale() === 'en' ? 'Participated seasons' : 'ซีซั่นที่เข้าร่วม';
        const strCurrent = getLocale() === 'en' ? 'Current season skill' : 'คะแนนซีซั่นปัจจุบัน';

        rankContentHtml = `
            ${currentSkill > 0 ? `<div class="stat-row"><span class="stat-label">${strCurrent}</span><span class="stat-val" style="color:var(--primary-color); font-weight:bold;">${currentSkill.toLocaleString()}</span></div>` : ''}
            <div class="stat-row"><span class="stat-label">${strBestSkill}</span><span class="stat-val">${bestSkill > 0 ? bestSkill.toLocaleString() : '-'}</span></div>
            <div class="stat-row"><span class="stat-label">${strBestRank}</span><span class="stat-val">${bestRank > 0 ? bestRank.toLocaleString() : '-'}</span></div>
            <div class="stat-row"><span class="stat-label">${strSeasons}</span><span class="stat-val">${playedSeasons > 0 ? playedSeasons.toLocaleString() : '-'}</span></div>
        `;
    }

    const calcWR = (w, l) => { const t = (w||0)+(l||0); return t > 0 ? ((w/t)*100).toFixed(0) : 0; };
    const vilWR = calcWR(stats.villageWinCount, stats.villageLoseCount);
    const wolfWR = calcWR(stats.werewolfWinCount, stats.werewolfLoseCount);
    const voteWR = calcWR(stats.votingWinCount, stats.votingLoseCount);

    const statusData = getPlayerStatusData(data);
    const statusBadge = `<span class="status-badge ${statusData.cssClass}"><span class="material-icons">${statusData.icon}</span> ${statusData.text}</span>`;
    
    const bgStyle = getProfileColorStyle(data);

    let clanHtml = '';
    if (data.clanName) clanHtml = `<span class="clan-tag" style="cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#cbd5e1'" onmouseout="this.style.background='#e2e8f0'" onclick="window.goToClanSearch('${data.clanId}')" title="ค้นหาแคลน (ID: ${data.clanId})">[${data.clanTag||'CLAN'}] ${data.clanName}</span>`;
    else if (data.clanId) clanHtml = `<span class="clan-tag error" style="cursor:pointer;" onclick="window.goToClanSearch('${data.clanId}')" title="ค้นหาแคลน">Clan ID Only</span>`;

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
                    <span class="achievement-lvl">${t('txt_level')} ${a.level}</span>
                </div>
            `;
        }).join('');

    const cardsHtml = roles.map(c => {
        const roleData = rolesCache.get(c.roleId1) || {};
        const roleName = roleData.name || c.roleId1.replace(/-/g,' ').toUpperCase();
        
        let roleIconHtml = `<span class="material-icons" style="color:rgba(255,255,255,0.8);">style</span>`;
        if (roleData.image && roleData.image.url) {
            roleIconHtml = `<img src="${roleData.image.url}" referrerpolicy="no-referrer" style="width: 44px; height: 44px; object-fit: contain; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">`;
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

    playerProfileContainer.innerHTML = `
        <div class="profile-header-card" style="border-left: none;">
            <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: ${bgStyle}; box-shadow: inset -1px 0 3px rgba(0,0,0,0.1);"></div>
            <div class="profile-avatar-wrapper">
                <img src="${data.equippedAvatar?.url || 'https://via.placeholder.com/150'}" class="profile-avatar-lg" style="background: ${bgStyle};">
                <div class="level-badge">${t('txt_level')} ${data.level}</div>
            </div>
            <div class="profile-main-info">
                <div class="player-name">${data.username} ${clanHtml}</div>
                <div style="margin-bottom:10px;">${statusBadge}</div>
                
                <div style="margin-bottom: 10px;">
                    <span class="rose-stat"><span class="material-icons">favorite</span> ${data.receivedRosesCount?.toLocaleString() || 0}</span>
                    <span class="rose-stat"><span class="material-icons">volunteer_activism</span> ${data.sentRosesCount?.toLocaleString() || 0}</span>
                </div>

                <div class="player-bio">"${formatMessage(data.personalMessage)}"</div>
                <div style="font-size:0.85rem; color:#64748b; margin-top:10px;">
                    <strong>ID:</strong> <span style="font-family:monospace; color:var(--primary-color);">${data.id}</span> <br>
                    ${t('txt_joined')}: ${formatDateThai(data.creationTime)} | ${t('txt_last_online')}: ${formatDateThai(data.lastOnline)}
                </div>
            </div>
        </div>

        <h3 class="stats-section-title"><span class="material-icons">analytics</span> ${t('txt_overview')}</h3>
        <div class="stats-grid-container">
            <div class="stat-box">
                <h4 class="box-title">${t('txt_overview')}</h4>
                <div class="stat-row"><span class="stat-label">${t('txt_games')}</span><span class="stat-val">${total.toLocaleString()} ${t('txt_rounds')}</span></div>
                <div class="stat-row"><span class="stat-label">${t('txt_playtime')}</span><span class="stat-val">${((stats.totalPlayTimeInMinutes||0)/60).toFixed(1)} ${t('txt_hrs')}</span></div>
                <div class="progress-container">
                    <div class="progress-label"><span>${t('txt_winrate')}</span><span>${winRate}%</span></div>
                    <div class="progress-track"><div class="progress-fill fill-win" style="width:${winRate}%"></div></div>
                </div>
                
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #eee;">
                    <span class="stat-label" style="display:block; margin-bottom:5px;">${t('txt_top_roles')}</span>
                    <div class="achievements-list">${topRoles}</div>
                </div>
            </div>

            <div class="stat-box">
                <h4 class="box-title">${t('txt_ranked')}</h4>
                ${rankContentHtml}
            </div>

            <div class="stat-box">
                <h4 class="box-title">${t('txt_perf')}</h4>
                <div class="progress-container" style="margin-bottom:8px">
                    <div class="progress-label"><span>${t('txt_village')}</span><span>${vilWR}%</span></div>
                    <div class="progress-track"><div class="progress-fill fill-win" style="width:${vilWR}%"></div></div>
                </div>
                <div class="progress-container">
                    <div class="progress-label"><span>${t('txt_werewolf')}</span><span>${wolfWR}%</span></div>
                    <div class="progress-track"><div class="progress-fill fill-wolf" style="width:${wolfWR}%"></div></div>
                </div>
                <div class="progress-container">
                    <div class="progress-label"><span>${t('txt_solo')}</span><span>${voteWR}%</span></div>
                    <div class="progress-track"><div class="progress-fill fill-solo" style="width:${voteWR}%"></div></div>
                </div>
            </div>
        </div>

        ${roles.length ? `<h3 class="stats-section-title"><span class="material-icons">style</span> ${t('txt_role_cards')} (${roles.length})</h3><div class="role-cards-wrapper">${cardsHtml}</div>` : ''}
    `;
}

// **********************************************
// 8. CLAN MANAGER LOGIC
// **********************************************

async function fetchMyClan() {
    if (!localStorage.getItem('wolvesville_api_key')) return showCustomAlert(t('alert_warning'), t('no_api_key'));
    stopClanPolling();
    
    currentClanRequestId++;
    const reqId = currentClanRequestId;
    
    clanContentContainer.innerHTML = `
        <div class="loading-container">
            <div style="font-size:36px; margin-bottom:10px;">🛡️</div>
            <h3 style="color:#1e293b; margin:0;">${t('txt_my_clan')}</h3>
            <div class="loading-bar-track"><div class="loading-bar-fill" style="width: 5%;"></div></div>
        </div>
    `;
    
    const authRes = await fetchData('/clans/authorized');
    if (reqId !== currentClanRequestId) return; 

    if (authRes.error || !authRes.length) {
        clanContentContainer.innerHTML = `<div style="text-align:center; color:red; padding:30px;">${t('txt_not_in_clan')}</div>`;
        return;
    }
    
    const myClanId = authRes[0].id;
    await fetchClanData(myClanId, true, false, reqId);
    if (reqId !== currentClanRequestId) return; 
    startClanPolling(myClanId, true);
}

async function searchClan() {
    stopClanPolling();
    const inputVal = clanNameInput.value.trim();
    if (!inputVal) return;
    
    currentClanRequestId++;
    const reqId = currentClanRequestId;
    
    clanContentContainer.innerHTML = `
        <div class="loading-container">
            <div style="font-size:36px; margin-bottom:10px;">🔍</div>
            <h3 style="color:#1e293b; margin:0;">${t('txt_search_clan')}</h3>
            <div class="loading-bar-track"><div class="loading-bar-fill" style="width: 10%;"></div></div>
        </div>
    `;
    
    let targetClanId = null;

    if (isUUID(inputVal)) {
        const infoRes = await fetchData(`/clans/${inputVal}/info`);
        if (reqId !== currentClanRequestId) return; 
        if (!infoRes.error && infoRes.id) {
            targetClanId = infoRes.id;
        }
    } else {
        const searchRes = await fetchData(`/clans/search?name=${encodeURIComponent(inputVal)}`);
        if (reqId !== currentClanRequestId) return; 
        if (!searchRes.error && searchRes.length > 0) {
            targetClanId = searchRes[0].id;
        }
    }
    
    if (!targetClanId) {
        clanContentContainer.innerHTML = `
            <div class="empty-state" style="border-color: #fecaca; background: #fef2f2; margin-top:20px;">
                <span class="material-icons" style="color: #ef4444; font-size: 60px;">group_off</span>
                <h3 style="color: #991b1b; margin:10px 0; font-size:1.3rem;">${t('txt_clan_not_found')}</h3>
                <p style="color: #ef4444; font-size:0.95rem;">${getLocale() === 'en' ? 'Could not find clan' : 'ไม่พบข้อมูลของแคลน'} <strong>${escapeJsString(inputVal)}</strong></p>
            </div>
        `;
        return;
    }
    
    await fetchClanData(targetClanId, false, false, reqId);
    startClanPolling(targetClanId, false);
}

function startClanPolling(clanId, isMyClan) {
    if (clanPollingInterval) clearInterval(clanPollingInterval);
    currentViewingClanId = clanId;
    isCurrentViewMyClan = isMyClan;
    isFirstRender = true;
    clanTickCounter = 0;
    
    // ตั้งค่ารีเฟรชทุก 1 วินาที (Smart Refresh)
    clanPollingInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
            clanTickCounter++;
            currentClanRequestId++;
            
            // ทุก 1 วิ: ดึงเฉพาะข้อมูลเบาๆ (Info, Chat, Quest, Ledger)
            // ทุก 30 วิ: ดึงข้อมูลหนักๆ (Members, Logs, History, etc.)
            const isHeavyLoad = (clanTickCounter % 30 === 0);
            fetchClanData(clanId, isMyClan, true, currentClanRequestId, isHeavyLoad); 
        }
    }, 1000); 
}

function stopClanPolling() {
    if (clanPollingInterval) {
        clearInterval(clanPollingInterval);
        clanPollingInterval = null;
    }
    if (inlineQfeeTimerInterval) {
        clearInterval(inlineQfeeTimerInterval);
        inlineQfeeTimerInterval = null;
    }
    currentViewingClanId = null;
    isFirstRender = true;
}

async function fetchClanData(clanId, isMyClan = false, isBackground = false, reqId = null, isHeavyLoad = true) {
    const totalSteps = isMyClan ? 14 : 9; 
    let currentStep = 0;

    if (reqId === null) {
        currentClanRequestId++;
        reqId = currentClanRequestId;
    }

    const updateProgress = (textKey, extraText = '') => {
        if (reqId !== currentClanRequestId) return; 
        if(!isBackground) {
            currentStep++;
            const percent = Math.min(100, Math.round((currentStep / totalSteps) * 100));
            const loadingMsg = t(textKey) + extraText;
            clanContentContainer.innerHTML = `
                <div class="loading-container">
                    <div style="font-size:36px; margin-bottom:10px; animation: bounce 1s infinite;">🛡️</div>
                    <h3 style="color:#1e293b; margin:0; margin-bottom: 10px;">${t('txt_loading_clan')}</h3>
                    <div style="color:var(--primary-color); font-weight:500; font-size:0.95rem; margin-bottom: 5px;">${loadingMsg}</div>
                    <div class="loading-bar-track"><div class="loading-bar-fill" style="width: ${percent}%;"></div></div>
                    <div style="color:#64748b; font-size:0.8rem;">${percent}%</div>
                </div>
            `;
        }
    };

    if (reqId !== currentClanRequestId) return;
    if(!isBackground) { isFirstRender = true; updateProgress('load_init'); }
    
    // Fetch ข้อมูลที่ต้องอัปเดตทุก 1 วินาที
    const [info, quests, chat, ledger] = await Promise.all([
        fetchData(`/clans/${clanId}/info`),
        fetchData(`/clans/${clanId}/quests/active`),
        fetchData(`/clans/${clanId}/chat`),
        fetchData(`/clans/${clanId}/ledger`)
    ]);

    if (reqId !== currentClanRequestId) return;
    if (info.error && !isBackground) {
        clanContentContainer.innerHTML = `<div style="text-align:center; color:red; padding:30px;">Error: ${info.message}</div>`;
        return;
    }
    
    currentClanLedger = Array.isArray(ledger) && !ledger.error ? ledger : currentClanLedger;

    // Fetch ข้อมูลหนักๆ เฉพาะเมื่อต้องโหลดใหม่ หรือถึงรอบ Heavy Load (ทุก 30 วิ)
    let members = [];
    let history = [];
    let announcements = [];
    let logs = [];
    let blockedMembers = { error: true };
    let availableQuests = { error: true };
    let votesData = { error: true };

    if (!isBackground || isHeavyLoad) {
        await Promise.all([fetchAndCacheEmojis(), fetchAndCacheAvatarItems()]);
        
        updateProgress('load_members');
        let membersRaw = await fetchData(`/clans/${clanId}/members/detailed`);
        if (membersRaw.error) membersRaw = await fetchData(`/clans/${clanId}/members`);
        
        if (!membersRaw.error && Array.isArray(membersRaw)) {
            clanMembersDetailedMap.clear();
            membersRaw.forEach(m => clanMembersDetailedMap.set(m.playerId, m));
            
            // โหลด Avatar (แคชไว้ถ้ามีแล้ว)
            for (const m of membersRaw) {
                if (playerAvatarCache.has(m.playerId)) members.push({ ...m, ...playerAvatarCache.get(m.playerId) });
                else {
                    const detail = await fetchData(`/players/${m.playerId}`);
                    if (!detail.error) {
                        playerAvatarCache.set(m.playerId, detail);
                        members.push({ ...m, ...detail });
                    } else members.push(m);
                }
            }
        }
        
        updateProgress('load_logs');
        logs = await fetchData(`/clans/${clanId}/logs`);
        
        updateProgress('load_history');
        history = await fetchData(`/clans/${clanId}/quests/history`);
        
        updateProgress('load_ann');
        announcements = await fetchData(`/clans/${clanId}/announcements`);

        if(isMyClan) {
            updateProgress('load_blocklist');
            const blRes = await fetchData(`/clans/${clanId}/blocklist`);
            if (Array.isArray(blRes)) {
                blockedMembers = [];
                for (const item of blRes.slice(0, 50)) {
                    const pid = typeof item === 'string' ? item : (item.playerId || item.id);
                    const p = await fetchData(`/players/${pid}`);
                    blockedMembers.push(p.error ? { id: pid, username: 'Unknown' } : p);
                }
            }
            availableQuests = await fetchData(`/clans/${clanId}/quests/available`);
            if (Array.isArray(availableQuests)) availableQuests.forEach(q => questDetailsCache.set(q.id, q));
            votesData = await fetchData(`/clans/${clanId}/quests/votes`);
            clanVotesCache = votesData;
        }
    } else {
        // ในกรณีที่เป็น Background Refresh ธรรมดา ให้ใช้ข้อมูล Members จาก Cache ล่าสุด
        clanMembersDetailedMap.forEach(m => members.push(m));
    }

    if (reqId !== currentClanRequestId) return;
    updateProgress('load_dash');
    
    // เรียกแสดงผล
    renderClanDashboard(info, members, quests, chat, logs, ledger, history, announcements, blockedMembers, availableQuests, votesData, clanId, isMyClan, isBackground, members.filter(m => m.participateInClanQuests).length);
}

function renderClanDashboard(info, members, quests, chat, logs, ledger, history, announcements, blockedMembers, availableQuests, votesData, clanId, canEdit = false, isBackground = false, participatingMemberCount = 0) { 
    const memberMap = {};
    if (Array.isArray(members)) members.forEach(m => memberMap[m.playerId] = m.username);

    // --- ส่วนคิวซื้ออัตโนมัติ ---
    let scheduled = JSON.parse(localStorage.getItem(`wolvesville_scheduled_${clanId}`) || '[]');
    let scheduledHtml = '';
    if (scheduled.length > 0) {
        scheduledHtml = `
            <div style="background:#f8fafc; border: 1px dashed #cbd5e1; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color:#334155; display:flex; align-items:center; gap:5px;"><span class="material-icons" style="color:#8b5cf6;">schedule</span> เควสที่ตั้งเวลาไว้ (คิวอัตโนมัติ)</h4>
                ${scheduled.map((sq, idx) => {
                    const timeStr = sq.targetTime > 0 ? new Date(sq.targetTime).toLocaleString() : 'ทันทีที่แคลนว่าง';
                    return `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding: 8px; background:white; border-radius:6px; border:1px solid #e2e8f0; margin-bottom:5px;">
                            <div><strong style="color:var(--primary-color);">${sq.questTitle}</strong><div style="font-size:0.75rem; color:#64748b;">ดำเนินการ: ${timeStr}</div></div>
                            <button onclick="window.cancelScheduledQuest('${clanId}', ${idx})" style="background:#fee2e2; color:#dc2626; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.75rem;">ยกเลิกรายการ (UI)</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // --- ส่วนเควสปัจจุบัน ---
    let questsHtml = `<div style="text-align:center; color:#ccc; padding:20px;">${t('txt_no_active_quest')}</div>`;
    if (!quests.error && (quests.quest || (quests.id && (quests.promoImageUrl || quests.rewards)))) {
        const qData = quests.quest ? quests : { quest: quests, ...quests }; 
        const qInfo = qData.quest || qData; 
        const displayTier = (qData.tier || 0) + 1;
        const endTime = formatDateThai(qData.tierEndTime || qInfo.tierEndTime);

        questsHtml = `
            <div class="active-quest-container">
                <div class="active-quest-banner" style="background-image: url('${qInfo.promoImageUrl || ''}')">
                    <div class="active-quest-overlay">
                        <h2 class="active-quest-title-lg" style="color: white;">${qInfo.title || 'Quest'} (${t('txt_tier')} ${displayTier})</h2>
                        <div class="active-quest-meta-lg"><span class="material-icons" style="font-size:16px;">schedule</span> ${t('txt_ends')}: ${endTime}</div>
                    </div>
                </div>
                <div class="active-quest-body" style="text-align:center; padding:20px;">
                    <div style="font-size:0.9rem; color:#64748b; margin-bottom:10px;">กำลังดำเนินการ... ดูกราฟความคืบหน้าได้ในหน้าเกม</div>
                    <button onclick="window.reloadActiveQuest('${clanId}', ${canEdit})" style="background:var(--primary-color); color:white; border:none; padding:8px 15px; border-radius:8px; cursor:pointer; font-weight:bold;">รีเฟรชข้อมูล</button>
                </div>
            </div>
        `;
    }

    // --- ส่วน Fee Tracker (อัปเดตทุก 1 วิ) ---
    let feeTrackerHtml = '';
    if (canEdit) {
        let targetGold = parseInt(localStorage.getItem(`wolvesville_qfee_gold_${clanId}`)) || 0;
        let targetGems = parseInt(localStorage.getItem(`wolvesville_qfee_gems_${clanId}`)) || 0;
        let targetXp = parseInt(localStorage.getItem(`wolvesville_qfee_xp_${clanId}`)) || 0;
        let durationDays = parseFloat(localStorage.getItem(`wolvesville_qfee_duration_${clanId}`)) || 0;
        let resetTime = parseInt(localStorage.getItem(`wolvesville_qfee_reset_${clanId}`)) || 0;
        const endTimeMs = durationDays > 0 && resetTime > 0 ? resetTime + (durationDays * 24 * 60 * 60 * 1000) : 0;
        const nowMsFee = Date.now();

        const donations = {};
        const participatingMembers = Array.isArray(members) ? members.filter(m => m.participateInClanQuests) : [];
        participatingMembers.forEach(m => {
            donations[m.playerId] = { gold: 0, gems: 0, xp: m.xpDurations?.week || 0 };
        });

        if (Array.isArray(currentClanLedger)) {
            currentClanLedger.forEach(entry => {
                const entryTime = new Date(entry.creationTime || entry.date).getTime();
                if (entry.type === 'DONATE' && entryTime >= resetTime) {
                    if (endTimeMs === 0 || entryTime <= endTimeMs) {
                        if (donations[entry.playerId]) {
                            if (entry.gold) donations[entry.playerId].gold += entry.gold;
                            if (entry.gems) donations[entry.playerId].gems += entry.gems;
                        }
                    }
                }
            });
        }

        let paidCount = 0;
        let listHtml = participatingMembers.sort((a, b) => a.username.localeCompare(b.username)).map(p => {
            const don = donations[p.playerId];
            const isPaid = (targetGold === 0 || don.gold >= targetGold) && (targetGems === 0 || don.gems >= targetGems) && (targetXp === 0 || don.xp >= targetXp) && (targetGold+targetGems+targetXp > 0);
            if (isPaid) paidCount++;

            return `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border-bottom:1px solid #f1f5f9; background:white;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="${p.equippedAvatar?.url || ''}" style="width:24px; height:24px; border-radius:6px; background:#f8fafc;">
                        <div>
                            <strong style="font-size:0.9rem;">${p.username}</strong>
                            <div style="font-size:0.7rem; color:#64748b;">${don.gold} 💰 | ${don.gems} 💎 | ${don.xp} XP</div>
                        </div>
                    </div>
                    <div style="background:${isPaid?'#dcfce7':'#fee2e2'}; color:${isPaid?'#16a34a':'#dc2626'}; padding:4px 8px; border-radius:6px; font-size:0.75rem; font-weight:bold;">${isPaid?'ผ่าน':'ไม่ผ่าน'}</div>
                </div>
            `;
        }).join('');

        const timerHtml = (endTimeMs > nowMsFee) ? `<div style="font-size:0.75rem; color:#f59e0b; font-weight:bold;">หมดเวลาใน <span id="inline-qfee-timer" data-time="${endTimeMs}">...</span></div>` : (endTimeMs > 0 ? `<div style="color:#ef4444; font-size:0.75rem;">หมดเวลาแล้ว</div>` : '');

        feeTrackerHtml = `
            <div style="background:white; padding:15px; border-radius:12px; border:1px solid #e2e8f0; margin-top:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h4 style="margin:0; font-size:1.05rem;">สถานะการจ่ายค่าเควส</h4>
                    <button onclick="window.openQuestFeeSettings('${clanId}')" style="background:#f1f5f9; border:none; padding:4px 8px; border-radius:6px; cursor:pointer;"><span class="material-icons" style="font-size:16px;">settings</span></button>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#64748b; margin-bottom:10px;">
                    <span>ผ่านเกณฑ์: <strong>${paidCount}/${participatingMembers.length}</strong></span>
                    ${timerHtml}
                </div>
                <div style="max-height:200px; overflow-y:auto; border:1px solid #eee; border-radius:8px;">${listHtml}</div>
            </div>
        `;
    }

    // --- แชทและบันทึกกิจกรรม ---
    let chatHtml = Array.isArray(chat) ? chat.reverse().map(msg => `
        <div style="margin-bottom:8px; border-bottom:1px solid #f1f5f9;">
            <strong style="color:var(--primary-color);">${msg.player?.username || memberMap[msg.playerId] || 'Unknown'}</strong>: 
            <span>${msg.msg || 'Emoji'}</span>
        </div>
    `).join('') : '-';

    // --- การอัปเดตแบบไร้การกระพริบ (Smart Background Update) ---
    if (isBackground && !isFirstRender) {
        const updateIfChanged = (id, newHtml) => {
            const el = document.getElementById(id);
            if (el && el.innerHTML !== newHtml) el.innerHTML = newHtml;
        };

        updateIfChanged('scheduled-quests-wrapper', scheduledHtml);
        updateIfChanged('active-quest-wrapper', questsHtml);
        updateIfChanged('fee-tracker-wrapper', feeTrackerHtml);
        updateIfChanged('clan-chat-container', chatHtml);
        updateIfChanged('quest-reset-timer-wrapper', getQuestResetTimeDisplay());
        
        // อัปเดตยอดเงินแคลนที่ Header
        const goldEl = document.querySelector('.currency-badge.gold');
        if(goldEl) goldEl.innerHTML = `<span class="material-icons" style="font-size:16px; margin-right:5px; color:#d97706;">monetization_on</span> ${info.gold?.toLocaleString() || 0}`;
        const gemsEl = document.querySelector('.currency-badge.gems');
        if(gemsEl) gemsEl.innerHTML = `<span class="material-icons" style="font-size:16px; margin-right:5px; color:#9333ea;">diamond</span> ${info.gems?.toLocaleString() || 0}`;

        return; 
    }

    // --- แสดงผลหน้าหลักครั้งแรก ---
    isFirstRender = false;
    clanContentContainer.innerHTML = `
        <div class="profile-header-card" style="border-left-color:#eab308;">
            <div class="profile-avatar-wrapper" style="width:80px; height:80px; background:#fefce8; border-radius:50%; font-size:40px; display:flex; align-items:center; justify-content:center; border:3px solid #eab308;">${info.tag || '🛡️'}</div>
            <div class="profile-main-info">
                <h2 class="player-name">[${info.tag}] ${info.name}</h2>
                <div class="clan-wallet">
                    <span class="currency-badge gold">...</span>
                    <span class="currency-badge gems">...</span>
                </div>
                <div style="font-size:0.8rem; color:#64748b; margin-top:10px;">ID: <span style="font-family:monospace;">${info.id}</span></div>
            </div>
        </div>

        <div class="stats-grid stats-grid-row2">
            <div>
                <h3 class="stats-section-title">🚩 เควสแคลน <span id="quest-reset-timer-wrapper"></span></h3>
                <div id="scheduled-quests-wrapper">${scheduledHtml}</div>
                <div id="active-quest-wrapper">${questsHtml}</div>
                <div id="fee-tracker-wrapper">${feeTrackerHtml}</div>
                <div id="available-quests-wrapper"></div>
            </div>
            <div>
                <h3 class="stats-section-title">💬 แชทแคลน</h3>
                <div id="clan-chat-container" class="clan-scroll-area" style="background:white; padding:15px; border-radius:12px; border:1px solid #eee; max-height:400px;">${chatHtml}</div>
            </div>
        </div>
    `;

    // เริ่มระบบนับถอยหลังวินาทีสำหรับนาฬิกา Fee Tracker
    if (inlineQfeeTimerInterval) clearInterval(inlineQfeeTimerInterval);
    inlineQfeeTimerInterval = setInterval(() => {
        const el = document.getElementById('inline-qfee-timer');
        if (!el) return;
        const target = parseInt(el.dataset.time);
        const diff = target - Date.now();
        if (diff <= 0) { el.innerHTML = "หมดเวลา"; return; }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        el.innerText = `${h}ชม. ${m}นาที ${s}วิ`;
    }, 1000);
}

// ฟังก์ชันดั้งเดิมที่เหลือ...
async function fetchData(e,s,r){const k=localStorage.getItem('wolvesville_api_key');if(!k)return{error:true};try{const res=await fetch(`${localServerUrl}/api/wolvesville?endpoint=${encodeURIComponent(e)}&apiKey=${encodeURIComponent(k)}&_t=${Date.now()}`);return res.ok?await res.json():{error:true}}catch(err){return{error:true}}}
function isUUID(s){return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)}
// ... โค้ดส่วนอื่นๆ คงเดิม ...

document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    fetchAndDisplayData();
});
