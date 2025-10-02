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
    
    // Set up periodic verification alarm
    chrome.alarms.create('verifyLicense', { periodInMinutes: 360 }); // 6 hours
  }
  
  if (details.reason === 'update') {
    console.log('Code Bridge Pro updated to version:', chrome.runtime.getManifest().version);
  }
});

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'verifyLicense') {
    verifyStoredLicense();
  }
});

async function verifyStoredLicense() {
  try {
    const result = await chrome.storage.sync.get(['licenseKey']);
    
    if (!result.licenseKey) {
      console.log('No license to verify');
      return;
    }
    
    const response = await fetch(`${API_URL}/api/verify-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: result.licenseKey })
    });
    
    const data = await response.json();
    
    if (data.valid) {
      await chrome.storage.sync.set({ 
        tier: data.tier,
        lastVerified: Date.now()
      });
      console.log('License verified:', data.tier);
    } else {
      // License invalid - downgrade
      await chrome.storage.sync.set({ 
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
    .then(async data => {
      if (data.valid) {
        // Save license
        await chrome.storage.sync.set({ 
          licenseKey: licenseKey,
          tier: 'pro',
          lastVerified: Date.now(),
          expiresAt: data.expiresAt
        });
        
        sendResponse({ success: true });
        
        // Show success notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'Code Bridge Pro Activated! 🎉',
          message: 'Your Pro license has been activated. Enjoy unlimited extractions!',
          priority: 2
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
  
  return true;
});

// Listen for internal messages (from popup/content script)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'updateBadge') {
    // Update extension badge with code block count
    const count = request.count;
    if (count > 0) {
      chrome.action.setBadgeText({ text: count.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#dc2626' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
    sendResponse({ success: true });
  }
  
  return true;
});

console.log('Code Bridge Pro background service started');
