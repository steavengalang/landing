import { useTranslation } from 'next-i18next';

export default function Features() {
  const { t } = useTranslation('common');

  const features = [
    {
      icon: '🚀',
      title: t('features.list.export.title'),
      description: t('features.list.export.description')
    },
    {
      icon: '✏️',
      title: t('features.list.rename.title'),
      description: t('features.list.rename.description')
    },
    {
      icon: '🗑️',
      title: t('features.list.selective.title'),
      description: t('features.list.selective.description')
    },
    {
      icon: '🎨',
      title: t('features.list.ui.title'),
      description: t('features.list.ui.description')
    },
    {
      icon: '⚡',
      title: t('features.list.fast.title'),
      description: t('features.list.fast.description')
    },
    {
      icon: '🔒',
      title: t('features.list.privacy.title'),
      description: t('features.list.privacy.description')
    }
  ];

  return (
    <div className="py-24 bg-gradient-to-b from-dark to-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            {t('features.title')}
          </h2>
          <p className="text-xl text-white/60">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-accent/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-accent/20"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/60 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
