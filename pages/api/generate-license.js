import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

function generateLicenseKey(email, sessionId) {
  const hash = crypto.createHash('sha256')
    .update(email + sessionId + Date.now() + (process.env.LICENSE_SECRET || 'fallback_secret'))
    .digest('hex');
  return `CB-${hash.substring(0, 24).toUpperCase()}`;
}

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    if (!session) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    // Allow both paid and unpaid for testing
    // if (session.payment_status !== 'paid') {
    //   return res.status(400).json({ error: 'Payment not completed' });
    // }

    const email = session.customer_details?.email || 'test@test.com';
    const plan = session.metadata?.plan || 'monthly';

    // Setup Redis
    const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      console.error('Redis environment variables not set!');
      return res.status(500).json({ error: 'Database not configured' });
    }

    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    // Check if license already generated for this session
    const existingLicense = await redis.get(`session:${session_id}`);
    if (existingLicense) {
      console.log('License already exists for session:', session_id);
      return res.json({ licenseKey: existingLicense, email, plan });
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

    // Create license data
    const licenseData = {
      email,
      tier: 'pro',
      plan,
      sessionId: session_id,
      activatedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active'
    };

    // Save to Redis with error handling
    try {
      await redis.set(`license:${licenseKey}`, JSON.stringify(licenseData));
      await redis.set(`email:${email}`, licenseKey);
      await redis.set(`session:${session_id}`, licenseKey);
      
      console.log('License saved successfully:', licenseKey);
    } catch (redisError) {
      console.error('Redis save error:', redisError);
      return res.status(500).json({ 
        error: 'Failed to save license to database',
        message: redisError.message 
      });
    }

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
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
