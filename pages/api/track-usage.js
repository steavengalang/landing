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

  // Pro users - ALWAYS verify license server-side
  if (tier === 'pro' && licenseKey) {
    try {
      const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
      const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
      const redis = new Redis({ url: redisUrl, token: redisToken });

      const licenseDataStr = await redis.get(`license:${licenseKey}`);
      
      if (!licenseDataStr) {
        // License not found - force downgrade
        return res.json({ 
          usage: 0, 
          limit: 3, 
          remaining: 3, 
          canUse: false, 
          downgraded: true,
          reason: 'License not found'
        });
      }

      const license = JSON.parse(licenseDataStr);
      
      // Check revoked
      if (license.status === 'revoked') {
        return res.json({ 
          usage: 0, 
          limit: 3, 
          remaining: 3, 
          canUse: false, 
          downgraded: true,
          reason: 'License revoked'
        });
      }

      // Check expiry
      if (new Date() > new Date(license.expiresAt)) {
        return res.json({ 
          usage: 0, 
          limit: 3, 
          remaining: 3, 
          canUse: false, 
          expired: true,
          reason: 'License expired'
        });
      }

      // Log usage for pro users (analytics & abuse tracking)
      const today = new Date().toISOString().split('T')[0];
      await redis.incr(`pro-usage:${licenseKey}:${today}`);
      await redis.expire(`pro-usage:${licenseKey}:${today}`, 86400 * 30); // Keep 30 days

      // Check for abuse (too many extractions per day)
      const dailyUsage = await redis.get(`pro-usage:${licenseKey}:${today}`);
      if (dailyUsage > 1000) {
        console.warn(`License ${licenseKey} used ${dailyUsage} times today - potential abuse`);
        // Optional: rate limit or alert
      }

      return res.json({ 
        usage: 0, 
        limit: -1, 
        remaining: -1, 
        canUse: true,
        tier: 'pro'
      });
      
    } catch (error) {
      console.error('Pro verification error:', error);
      // On error, deny access for security
      return res.json({ 
        usage: 0, 
        limit: 3, 
        remaining: 0, 
        canUse: false,
        error: 'Verification failed'
      });
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

    return res.json({ 
      usage, 
      limit, 
      remaining, 
      canUse: remaining > 0,
      tier: 'free'
    });
  } catch (error) {
    console.error('Track error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
}
