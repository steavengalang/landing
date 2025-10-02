// ========================================
// BACKGROUND SERVICE WORKER
// ========================================

const API_URL = 'https://landing-chi-lovat.vercel.app';

// Listen for extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Code Bridge Pro installed!');
    
    // Open welcome page
    chrome.tabs.create({
      url: `${API_URL}?installed=true`
    });
  }
  
  if (details.reason === 'update') {
    console.log('Code Bridge Pro updated!');
  }
});

// Periodic license verification (every 6 hours)
chrome.alarms.create('verifyLicense', { periodInMinutes: 360 }); // 6 hours

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'verifyLicense') {
    verifyStoredLicense();
  }
});

async function verifyStoredLicense() {
  const result = await chrome.storage.sync.get(['licenseKey']);
  
  if (result.licenseKey) {
    try {
      const response = await fetch(`${API_URL}/api/verify-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: result.licenseKey })
      });
      
      const data = await response.json();
      
      if (data.valid) {
        chrome.storage.sync.set({ 
          tier: data.tier,
          lastVerified: Date.now()
        });
        console.log('License verified:', data.tier);
      } else {
        // License invalid - downgrade
        chrome.storage.sync.set({ 
          tier: 'free',
          licenseKey: null,
          lastVerified: Date.now()
        });
        
        // Show notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'License Invalid',
          message: `Your license is no longer valid: ${data.reason || 'Unknown reason'}`,
          priority: 2
        });
      }
    } catch (error) {
      console.error('Background license verification failed:', error);
    }
  }
}

// Listen for messages from website (auto-activation)
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.type === 'ping') {
    sendResponse({ pong: true, version: '1.0.0' });
    return true;
  }
  
  if (request.type === 'activate_license') {
    const licenseKey = request.licenseKey;
    
    // Verify license with server
    fetch(`${API_URL}/api/verify-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey })
    })
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        // Save license
        chrome.storage.sync.set({ 
          licenseKey: licenseKey,
          tier: 'pro',
          lastVerified: Date.now(),
          expiresAt: data.expiresAt
        }, () => {
          sendResponse({ success: true });
          
          // Show success notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Code Bridge Pro Activated! 🎉',
            message: 'Your Pro license has been activated. Enjoy unlimited extractions!',
            priority: 2
          });
        });
      } else {
        sendResponse({ success: false, error: data.reason || 'Invalid license' });
      }
    })
    .catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    
    return true; // Keep channel open for async response
  }
});

// Track daily usage for analytics (optional)
chrome.storage.local.get(['dailyExtractions'], (result) => {
  const today = new Date().toISOString().split('T')[0];
  const daily = result.dailyExtractions || {};
  
  if (!daily[today]) {
    daily[today] = 0;
  }
  
  chrome.storage.local.set({ dailyExtractions: daily });
});

console.log('Code Bridge Pro background service started');
