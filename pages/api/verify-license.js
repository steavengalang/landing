import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { licenseKey } = req.body;

  if (!licenseKey) {
    return res.json({ valid: false, tier: 'free' });
  }

  // Validate format first
  if (!licenseKey.startsWith('CB-') || licenseKey.length !== 27) {
    return res.json({ valid: false, tier: 'free', reason: 'Invalid format' });
  }

  try {
    const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    const licenseDataStr = await redis.get(`license:${licenseKey}`);

    if (!licenseDataStr) {
      return res.json({ valid: false, tier: 'free', reason: 'License not found' });
    }

    const license = JSON.parse(licenseDataStr);

    // Check expiry
    if (new Date() > new Date(license.expiresAt)) {
      return res.json({ 
        valid: false, 
        tier: 'free', 
        reason: 'License expired',
        expiresAt: license.expiresAt
      });
    }

    // Check if revoked (optional - bisa add status field)
    if (license.status === 'revoked') {
      return res.json({ 
        valid: false, 
        tier: 'free', 
        reason: 'License revoked'
      });
    }

    // Log verification (for abuse detection)
    await redis.incr(`verify:${licenseKey}:${new Date().toISOString().split('T')[0]}`);

    return res.json({ 
      valid: true, 
      tier: license.tier,
      plan: license.plan,
      email: license.email,
      expiresAt: license.expiresAt
    });

  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
