const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan, currency = 'USD' } = req.query;

  try {
    let amount;
    let currencyCode;

    if (currency === 'IDR') {
      currencyCode = 'idr';
      amount = plan === 'monthly' ? 79000 : 1250000;
    } else {
      currencyCode = 'usd';
      amount = plan === 'monthly' ? 499 : 7900;
    }

    let priceData = {
      currency: currencyCode,
      product_data: {
        name: `Code Bridge Pro - ${plan === 'monthly' ? 'Monthly' : 'Lifetime'}`,
        description: 'Unlimited code extractions and premium features'
      },
      unit_amount: amount,
    };

    if (plan === 'monthly') {
      priceData.recurring = { interval: 'month' };
    }

    // HARDCODE URL
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: priceData, quantity: 1 }],
      mode: plan === 'monthly' ? 'subscription' : 'payment',
      success_url: 'https://landing-chi-lovat.vercel.app/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://landing-chi-lovat.vercel.app/pricing',
      metadata: { currency, plan }
    });

    return res.redirect(303, session.url);
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: error.message });
  }
}
