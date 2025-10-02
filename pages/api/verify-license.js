import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { licenseKey } = req.body;

  if (!licenseKey) {
    return res.json({ valid: false, tier: 'free' });
  }

  try {
    const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    const license = await redis.get(`license:${licenseKey}`);

    if (!license) {
      return res.json({ valid: false, tier: 'free' });
    }

    if (new Date() > new Date(license.expiresAt)) {
      return res.json({ 
        valid: false, 
        tier: 'free', 
        message: 'License expired' 
      });
    }

    return res.json({ 
      valid: true, 
      tier: license.tier,
      expiresAt: license.expiresAt 
    });
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
