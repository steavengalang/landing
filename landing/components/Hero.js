import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';

export default function Hero() {
  const { t } = useTranslation('common');

  return (
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-radial from-accent/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 animate-pulse">
            <span className="text-2xl">⚡</span>
            <span className="text-sm font-semibold text-white/80">
              {t('hero.badge')}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            {t('hero.title1')}
            <br />
            <span className="bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent animate-gradient">
              {t('hero.title2')}
            </span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="https://chrome.google.com/webstore" 
              target="_blank"
              rel="noopener noreferrer"
              className="group px-8 py-4 bg-gradient-to-r from-accent to-red-700 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-accent/50 hover:shadow-accent/70"
            >
              <span className="flex items-center justify-center gap-2">
                {t('hero.cta')}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </a>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              {t('hero.cta2')}
            </Link>
          </div>

          {/* Demo Preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent to-red-700 rounded-2xl blur-xl opacity-50 animate-pulse" />
            <div className="relative bg-dark/50 backdrop-blur-sm border border-white/10 rounded-2xl p-2 shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-white/5 to-white/0 rounded-xl flex items-center justify-center">
                <p className="text-white/40 text-sm">Demo GIF/Video Here</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16">
            <div className="group hover:scale-105 transition-transform">
              <div className="text-4xl font-black bg-gradient-to-r from-white to-accent bg-clip-text text-transparent mb-2">
                10x
              </div>
              <div className="text-sm text-white/60">{t('hero.stats.faster')}</div>
            </div>
            <div className="group hover:scale-105 transition-transform">
              <div className="text-4xl font-black bg-gradient-to-r from-white to-accent bg-clip-text text-transparent mb-2">
                1-Click
              </div>
              <div className="text-sm text-white/60">{t('hero.stats.oneClick')}</div>
            </div>
            <div className="group hover:scale-105 transition-transform">
              <div className="text-4xl font-black bg-gradient-to-r from-white to-accent bg-clip-text text-transparent mb-2">
                500+
              </div>
              <div className="text-sm text-white/60">{t('hero.stats.users')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
