import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, tier } = req.body;

  if (tier === 'pro') {
    return res.json({ usage: 0, limit: -1, remaining: -1, canUse: true });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `usage:${userId}:${today}`;

    const usage = await kv.incr(key);
    await kv.expire(key, 86400);

    const limit = 3;
    const remaining = Math.max(0, limit - usage);

    return res.json({ usage, limit, remaining, canUse: remaining > 0 });
  } catch (error) {
    console.error('Track error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
