// Background service worker for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('Code Bridge Pro extension installed!');
  });
  
  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractCode') {
      // Forward to popup
      chrome.runtime.sendMessage({ action: 'codeExtracted', data: request.data });
    }
    return true;
  });
  