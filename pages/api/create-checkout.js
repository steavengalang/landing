const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan, currency = 'USD' } = req.query;

  if (!plan) {
    return res.status(400).json({ error: 'Plan parameter required' });
  }

  try {
    let amount, currencyCode;

    // Set price based on currency
    if (currency === 'IDR') {
      currencyCode = 'idr';
      amount = plan === 'monthly' ? 790 : 125000000;
    } else {
      currencyCode = 'usd';
      amount = plan === 'monthly' ? 499 : 7900;
    }

    const priceData = {
      currency: currencyCode,
      product_data: {
        name: `Code Bridge Pro - ${plan === 'monthly' ? 'Monthly' : 'Lifetime'}`,
        description: 'Unlimited code extractions from Perplexity AI'
      },
      unit_amount: amount
    };

    // Add recurring for monthly plan
    if (plan === 'monthly') {
      priceData.recurring = { interval: 'month' };
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      mode: plan === 'monthly' ? 'subscription' : 'payment',
      success_url: 'https://landing-chi-lovat.vercel.app/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://landing-chi-lovat.vercel.app/pricing',
      metadata: {
        plan: plan,
        currency: currency
      }
    });

    // Redirect to Stripe checkout
    return res.redirect(303, session.url);

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
}
