import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // ป้องกันคนอื่นมากดรันระบบเรา
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const activeClans = await kv.smembers('active_auto_quests_clans');
    if (!activeClans || activeClans.length === 0) return res.status(200).json({ message: 'No quests' });

    let results = [];

    for (const clanId of activeClans) {
      const data = await kv.hgetall(`clan_auto_quest:${clanId}`);
      if (!data || data.status !== 'pending') continue;

      // เช็คว่าแคลนว่างไหม (มีเควสทำงานอยู่หรือเปล่า)
      const checkRes = await fetch(`https://api.wolvesville.com/clans/${clanId}/quests/active`, {
        headers: { 'Authorization': `Bot ${data.apiKey}`, 'Accept': 'application/json' }
      });
      const activeData = await checkRes.json();
      
      if (activeData && activeData.quest) {
        results.push({ clanId, status: 'skipped (Quest active)' });
        continue;
      }

      // ถ้าแคลนว่าง สั่งซื้อเควสเลย!
      const buyRes = await fetch(`https://api.wolvesville.com/clans/${clanId}/quests/claim`, {
        method: 'POST',
        headers: { 'Authorization': `Bot ${data.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: data.questId })
      });

      if (buyRes.ok) {
        await kv.hset(`clan_auto_quest:${clanId}`, { status: 'completed' });
        await kv.srem('active_auto_quests_clans', clanId);
        results.push({ clanId, status: 'success' });
      } else {
        results.push({ clanId, status: 'failed' });
      }
    }
    return res.status(200).json({ results });
  } catch (error) {
    return res.status(500).json({ error: 'Error' });
  }
}
