import { Redis } from '@upstash/redis';
import crypto from 'crypto';

function generateLicenseKey(email) {
  const hash = crypto.createHash('sha256')
    .update(email + Date.now() + process.env.LICENSE_SECRET)
    .digest('hex');
  return `CB-${hash.substring(0, 24).toUpperCase()}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, paymentId, plan } = req.body;

  if (!email || !paymentId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    const licenseKey = generateLicenseKey(email);

    let expiresAt;
    if (plan === 'lifetime') {
      expiresAt = new Date('2099-12-31');
    } else {
      expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    const licenseData = {
      email,
      tier: 'pro',
      plan,
      paymentId,
      activatedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    await redis.set(`license:${licenseKey}`, JSON.stringify(licenseData));
    await redis.set(`email:${email}`, licenseKey);

    return res.json({ 
      success: true, 
      licenseKey,
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Activation error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
