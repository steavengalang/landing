const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing signature' });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Activate license
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/activate-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.customer_email || session.customer_details?.email,
          paymentId: session.payment_intent,
          plan: session.metadata?.plan || 'monthly'
        })
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return res.status(400).json({ error: `Webhook error: ${error.message}` });
  }
}
