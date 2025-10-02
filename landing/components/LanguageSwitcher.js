import { useRouter } from 'next/router';

export default function LanguageSwitcher() {
  const router = useRouter();
  const { locale, pathname, asPath, query } = router;

  const changeLanguage = (newLocale) => {
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  return (
    <div className="flex gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-1">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
          locale === 'en' 
            ? 'bg-accent text-white shadow-lg' 
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('id')}
        className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
          locale === 'id' 
            ? 'bg-accent text-white shadow-lg' 
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        ID
      </button>
    </div>
  );
}
