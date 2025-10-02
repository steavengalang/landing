import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const [licenseKey, setLicenseKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (session_id) {
      // Verify payment and get license
      fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session_id })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLicenseKey(data.licenseKey);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    }
  }, [session_id]);

  const copyLicense = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-white text-xl">Processing payment...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Payment Successful - Code Bridge Pro</title>
      </Head>

      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-black text-white mb-4">
            Welcome to Code Bridge Pro!
          </h1>
          <p className="text-white/60 mb-8">
            Your payment was successful. Here's your license key:
          </p>
          
          {licenseKey && (
            <>
              <div className="bg-black/50 border border-accent/50 rounded-xl p-6 mb-8">
                <div className="text-sm text-white/60 mb-2">Your License Key</div>
                <div className="text-2xl font-mono font-bold text-accent break-all">
                  {licenseKey}
                </div>
              </div>

              <button
                onClick={copyLicense}
                className="px-8 py-4 bg-accent hover:bg-red-700 text-white font-bold rounded-xl transition-all mb-8"
              >
                {copied ? '✓ Copied!' : 'Copy License Key'}
              </button>
            </>
          )}

          <div className="space-y-4 text-left text-white/80">
            <p className="font-bold">Next Steps:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Copy your license key above</li>
              <li>Open Code Bridge extension in Chrome</li>
              <li>Click "Activate License"</li>
              <li>Paste your key and enjoy unlimited features!</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
