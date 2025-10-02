import { kv } from '@vercel/kv';
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
    const licenseKey = generateLicenseKey(email);

    let expiresAt;
    if (plan === 'lifetime') {
      expiresAt = new Date('2099-12-31');
    } else {
      expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    await kv.set(`license:${licenseKey}`, {
      email,
      tier: 'pro',
      plan,
      paymentId,
      activatedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    });

    await kv.set(`email:${email}`, licenseKey);

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
