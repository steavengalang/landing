import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Head>
        <title>Code Bridge Pro - Extract Perplexity Code to VS Code Instantly</title>
        <meta name="description" content="Extract code from Perplexity AI directly to VS Code with one click. Save 10+ hours per month." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-dark min-h-screen">
        <Hero />
        <Features />
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
