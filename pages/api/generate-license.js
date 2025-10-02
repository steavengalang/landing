const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

function generateLicenseKey(email, sessionId) {
  const hash = crypto.createHash('sha256')
    .update(email + sessionId + Date.now() + process.env.LICENSE_SECRET)
    .digest('hex');
  return `CB-${hash.substring(0, 24).toUpperCase()}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Session ID required' });
  }

  try {
    // Get Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const email = session.customer_details.email;
    const plan = session.metadata.plan || 'monthly';

    // Check if license already generated for this session
    const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    // Check existing license
    const existingLicense = await redis.get(`session:${session_id}`);
    if (existingLicense) {
      return res.json({ licenseKey: existingLicense });
    }

    // Generate new license
    const licenseKey = generateLicenseKey(email, session_id);

    // Calculate expiry
    let expiresAt;
    if (plan === 'lifetime') {
      expiresAt = new Date('2099-12-31');
    } else {
      expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // Save license to Redis
    const licenseData = {
      email,
      tier: 'pro',
      plan,
      sessionId: session_id,
      activatedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    await redis.set(`license:${licenseKey}`, JSON.stringify(licenseData));
    await redis.set(`email:${email}`, licenseKey);
    await redis.set(`session:${session_id}`, licenseKey);

    return res.json({ 
      licenseKey,
      email,
      plan,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Generate license error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate license',
      message: error.message 
    });
  }
}
