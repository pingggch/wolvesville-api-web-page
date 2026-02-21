import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { clanId, questId, questTitle, apiKey } = req.body;
  if (!clanId || !questId || !apiKey) return res.status(400).json({ error: 'Missing data' });

  try {
    // บันทึกข้อมูลลง Database
    await kv.hset(`clan_auto_quest:${clanId}`, {
      questId, questTitle, apiKey, status: 'pending', timestamp: Date.now()
    });
    // เก็บรายชื่อแคลนไว้ใน list เพื่อให้ระบบหาเจอง่ายๆ
    await kv.sadd('active_auto_quests_clans', clanId);

    return res.status(200).json({ success: true, message: 'Saved successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Database error' });
  }
}
