import { useTranslation } from 'next-i18next';
import Link from 'next/link';

export default function Footer() {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-white/10 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">⚡</span>
              <span className="text-xl font-bold text-white">Code Bridge</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-white mb-4">{t('footer.product')}</h4>
            <ul className="space-y-2 text-white/60 text-sm">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  {t('footer.features')}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  {t('footer.pricing')}
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t('footer.changelog')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-white/60 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t('footer.privacy')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t('footer.terms')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t('footer.refund')}
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-bold text-white mb-4">{t('footer.connect')}</h4>
            <ul className="space-y-2 text-white/60 text-sm">
              <li>
                <a 
                  href="https://twitter.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="mailto:support@codebridge.dev" 
                  className="hover:text-white transition-colors"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-white/60 text-sm">
          {t('footer.copyright').replace('2025', currentYear.toString())}
        </div>
      </div>
    </footer>
  );
}
