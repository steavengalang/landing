import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const [licenseKey, setLicenseKey] = useState(null);
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (session_id) {
      // Fetch license from API
      fetch(`/api/generate-license?session_id=${session_id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to generate license');
          return res.json();
        })
        .then(data => {
          setLicenseKey(data.licenseKey);
          setEmail(data.email);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [session_id]);

  const copyLicenseKey = () => {
    if (licenseKey) {
      navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-card">
          <div className="spinner">⏳</div>
          <h2>Processing your payment...</h2>
          <p>Generating your license key</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-card">
          <div className="icon">❌</div>
          <h1>Something went wrong</h1>
          <p>{error}</p>
          <a href="mailto:support@yourdomain.com" className="btn-secondary">
            Contact Support
          </a>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="success-card">
        <div className="icon">🎉</div>
        <h1>Welcome to Code Bridge Pro!</h1>
        <p className="subtitle">Your payment was successful. Here's your license key:</p>

        <div className="license-section">
          <div className="license-label">Your License Key</div>
          <div className="license-key-box">
            <code>{licenseKey}</code>
            <button onClick={copyLicenseKey} className="copy-btn">
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>
          {email && <div className="email-info">License sent to: {email}</div>}
        </div>

        <div className="steps-section">
          <h2>Next Steps:</h2>
          <ol>
            <li>
              <span className="step-number">1</span>
              <span className="step-text">Copy your license key above</span>
            </li>
            <li>
              <span className="step-number">2</span>
              <span className="step-text">Install Chrome Extension (if not installed yet)</span>
            </li>
            <li>
              <span className="step-number">3</span>
              <span className="step-text">Open the extension and click "Activate License"</span>
            </li>
            <li>
              <span className="step-number">4</span>
              <span className="step-text">Paste your key and enjoy unlimited features!</span>
            </li>
          </ol>
        </div>

        <div className="action-buttons">
          <a 
            href="https://chrome.google.com/webstore" 
            target="_blank"
            className="btn-primary"
          >
            📦 Install Extension
          </a>
          <a href="https://www.perplexity.ai" className="btn-secondary">
            🚀 Start Using Now
          </a>
        </div>

        <div className="info-box">
          <p><strong>💡 Pro Tip:</strong> Bookmark this page or save your license key. You'll need it to activate the extension!</p>
        </div>
      </div>

      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 100%);
    padding: 20px;
    position: relative;
  }
  .container::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 10% 20%, rgba(220, 38, 38, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 90% 80%, rgba(220, 38, 38, 0.1) 0%, transparent 40%);
    pointer-events: none;
    z-index: 0;
  }
  .success-card, .loading-card, .error-card {
    max-width: 700px;
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 48px;
    text-align: center;
    position: relative;
    z-index: 1;
  }
  .icon {
    font-size: 72px;
    margin-bottom: 24px;
    animation: bounce 1s ease-in-out;
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  h1 {
    font-size: 36px;
    font-weight: 900;
    color: white;
    margin-bottom: 12px;
  }
  .subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 32px;
  }
  .license-section {
    margin: 32px 0;
    padding: 32px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
  }
  .license-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
    font-weight: 600;
  }
  .license-key-box {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 16px;
  }
  code {
    background: rgba(255, 255, 255, 0.1);
    padding: 16px 24px;
    border-radius: 12px;
    font-size: 20px;
    color: #4ade80;
    font-weight: 700;
    font-family: 'Courier New', monospace;
    letter-spacing: 2px;
  }
  .copy-btn {
    padding: 16px 24px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }
  .copy-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.05);
  }
  .email-info {
    margin-top: 16px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
  }
  .steps-section {
    margin: 32px 0;
    text-align: left;
  }
  .steps-section h2 {
    font-size: 20px;
    color: white;
    margin-bottom: 20px;
    text-align: center;
  }
  ol {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    margin-bottom: 12px;
  }
  .step-number {
    min-width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: white;
  }
  .step-text {
    color: rgba(255, 255, 255, 0.9);
    font-size: 15px;
  }
  .action-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin: 32px 0;
    flex-wrap: wrap;
  }
  .btn-primary, .btn-secondary {
    padding: 16px 32px;
    border-radius: 12px;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.3s;
    display: inline-block;
  }
  .btn-primary {
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    color: white;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(220, 38, 38, 0.4);
  }
  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
  }
  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  .info-box {
    margin-top: 32px;
    padding: 20px;
    background: rgba(74, 222, 128, 0.1);
    border: 1px solid rgba(74, 222, 128, 0.3);
    border-radius: 12px;
  }
  .info-box p {
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-size: 14px;
  }
  .spinner {
    font-size: 48px;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
