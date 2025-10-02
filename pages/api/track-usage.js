import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, tier, licenseKey } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  // Pro users - verify license first
  if (tier === 'pro' && licenseKey) {
    try {
      const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
      const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
      const redis = new Redis({ url: redisUrl, token: redisToken });

      const licenseData = await redis.get(`license:${licenseKey}`);
      
      if (!licenseData) {
        // License not found - force free tier
        return res.json({ usage: 0, limit: 3, remaining: 3, canUse: false, downgraded: true });
      }

      const license = JSON.parse(licenseData);
      
      // Check expiry
      if (new Date() > new Date(license.expiresAt)) {
        return res.json({ usage: 0, limit: 3, remaining: 3, canUse: false, expired: true });
      }

      // Log usage for pro users (abuse tracking)
      await redis.incr(`pro-usage:${licenseKey}:${new Date().toISOString().split('T')[0]}`);

      return res.json({ usage: 0, limit: -1, remaining: -1, canUse: true });
      
    } catch (error) {
      console.error('Pro verification error:', error);
      // On error, allow but log
    }
  }

  // Free tier logic
  try {
    const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      console.error('Upstash environment variables not set');
      return res.status(500).json({ error: 'Database not configured' });
    }

    const redis = new Redis({ url: redisUrl, token: redisToken });
    const today = new Date().toISOString().split('T')[0];
    const key = `usage:${userId}:${today}`;

    const usage = await redis.incr(key);
    await redis.expire(key, 86400);

    const limit = 3;
    const remaining = Math.max(0, limit - usage);

    return res.json({ usage, limit, remaining, canUse: remaining > 0 });
  } catch (error) {
    console.error('Track error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
}
