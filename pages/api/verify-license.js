import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { licenseKey, deviceFingerprint } = req.body;

  if (!licenseKey) {
    return res.json({ valid: false, tier: 'free', reason: 'No license provided' });
  }

  // Validate format
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

    // Get license data
    const licenseDataStr = await redis.get(`license:${licenseKey}`);

    if (!licenseDataStr) {
      // Log failed attempt
      await logFailedVerification(redis, req.headers['x-forwarded-for'] || 'unknown');
      return res.json({ valid: false, tier: 'free', reason: 'License not found' });
    }

    const license = JSON.parse(licenseDataStr);

    // Check if revoked
    if (license.status === 'revoked') {
      return res.json({ 
        valid: false, 
        tier: 'free', 
        reason: 'License revoked'
      });
    }

    // Check expiry
    if (new Date() > new Date(license.expiresAt)) {
      return res.json({ 
        valid: false, 
        tier: 'free', 
        reason: 'License expired',
        expiresAt: license.expiresAt
      });
    }

    // Log successful verification
    const today = new Date().toISOString().split('T')[0];
    await redis.incr(`verify:${licenseKey}:${today}`);
    await redis.expire(`verify:${licenseKey}:${today}`, 86400 * 7); // Keep 7 days

    // Track device fingerprint (optional - for abuse detection)
    if (deviceFingerprint) {
      await redis.sadd(`devices:${licenseKey}`, deviceFingerprint);
      
      // Alert if too many devices (potential abuse)
      const deviceCount = await redis.scard(`devices:${licenseKey}`);
      if (deviceCount > 5) {
        console.warn(`License ${licenseKey} used on ${deviceCount} devices - potential abuse`);
        // Optional: auto-revoke or send alert
      }
    }

    return res.json({ 
      valid: true, 
      tier: license.tier,
      plan: license.plan,
      email: license.email,
      expiresAt: license.expiresAt
    });

  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
}

async function logFailedVerification(redis, ip) {
  const today = new Date().toISOString().split('T')[0];
  await redis.incr(`failed:${ip}:${today}`);
  await redis.expire(`failed:${ip}:${today}`, 86400);
}
