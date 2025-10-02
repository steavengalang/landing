import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { licenseKey } = req.body;

  if (!licenseKey) {
    return res.json({ valid: false, tier: 'free' });
  }

  try {
    const license = await kv.get(`license:${licenseKey}`);

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
