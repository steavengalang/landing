// Listen for messages from website
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.type === 'ping') {
    sendResponse({ pong: true });
  }
  
  if (request.type === 'activate_license') {
    const licenseKey = request.licenseKey;
    
    // Verify license
    fetch('https://landing-chi-lovat.vercel.app/api/verify-license', {
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
          tier: 'pro'
        }, () => {
          sendResponse({ success: true });
          
          // Show notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Code Bridge Pro Activated! 🎉',
            message: 'Your Pro license has been activated. Enjoy unlimited extractions!',
            priority: 2
          });
        });
      } else {
        sendResponse({ success: false, error: 'Invalid license' });
      }
    })
    .catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    
    return true; // Keep channel open for async response
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Code Bridge Pro installed!');
});
