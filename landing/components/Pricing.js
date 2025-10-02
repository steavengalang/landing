import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

export default function Pricing() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale } = router;

  // Currency config
  const currency = locale === 'id' ? 'IDR' : 'USD';
  const rates = {
    'USD': { monthly: 4.99, lifetime: 79, symbol: '$', format: (n) => `$${n}` },
    'IDR': { monthly: 79000, lifetime: 1250000, symbol: 'Rp', format: (n) => `Rp ${n.toLocaleString('id-ID')}` }
  };

  const formatPrice = (type) => {
    return rates[currency].format(rates[currency][type]);
  };

  const plans = [
    {
      name: t('pricing.plans.free.name'),
      price: currency === 'IDR' ? 'Rp 0' : '$0',
      period: locale === 'id' ? 'selamanya' : 'forever',
      features: t('pricing.plans.free.features', { returnObjects: true }),
      cta: t('pricing.plans.free.cta'),
      ctaLink: 'https://chrome.google.com/webstore',
      popular: false,
      external: true
    },
    {
      name: t('pricing.plans.pro.name'),
      price: formatPrice('monthly'),
      period: t('pricing.plans.pro.period'),
      features: t('pricing.plans.pro.features', { returnObjects: true }),
      cta: t('pricing.plans.pro.cta'),
      ctaLink: `/api/create-checkout?plan=monthly&currency=${currency}`,
      popular: true,
      external: false
    },
    {
      name: t('pricing.plans.lifetime.name'),
      price: formatPrice('lifetime'),
      period: t('pricing.plans.lifetime.period'),
      features: t('pricing.plans.lifetime.features', { returnObjects: true }),
      cta: t('pricing.plans.lifetime.cta'),
      ctaLink: `/api/create-checkout?plan=lifetime&currency=${currency}`,
      popular: false,
      external: false
    }
  ];

  return (
    <div className="py-24 bg-black relative overflow-hidden" id="pricing">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            {t('pricing.title')}
          </h2>
          <p className="text-xl text-white/60">
            {t('pricing.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative p-8 rounded-2xl transition-all hover:scale-105 ${
                plan.popular
                  ? 'bg-gradient-to-br from-accent/20 to-red-900/20 border-2 border-accent shadow-2xl shadow-accent/30'
                  : 'bg-white/5 border border-white/10'
              } backdrop-blur-sm`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent rounded-full text-sm font-bold text-white shadow-lg">
                  {t('pricing.popular')}
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-white">
                    {plan.price}
                  </span>
                  <span className="text-white/60">
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-accent text-xl flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.ctaLink}
                target={plan.external ? "_blank" : undefined}
                rel={plan.external ? "noopener noreferrer" : undefined}
                className={`block w-full py-4 text-center font-bold rounded-xl transition-all ${
                  plan.popular
                    ? 'bg-accent hover:bg-red-700 text-white shadow-lg shadow-accent/50 hover:shadow-accent/70'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-white/40 text-sm mb-4">Trusted by developers worldwide</p>
          <div className="flex justify-center gap-8 text-white/20">
            <span>🔒 Secure Payment</span>
            <span>💳 Money-back Guarantee</span>
            <span>⚡ Instant Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
