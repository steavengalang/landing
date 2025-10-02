import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <>
      <Head>
        <title>Pricing - Code Bridge Pro</title>
        <meta name="description" content="Choose the perfect plan for your workflow" />
      </Head>

      <div className="bg-dark min-h-screen">
        {/* Back to Home */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Link href="/" className="text-white/60 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>

        <Pricing />
        <Footer />
      </div>
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
