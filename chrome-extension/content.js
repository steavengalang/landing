// ========================================
// CONTENT SCRIPT (PERPLEXITY.AI PAGE)
// ========================================

console.log('Code Bridge Pro: Content script loaded on Perplexity.ai');

// Monitor for code blocks on page
let codeBlockCount = 0;

function detectCodeBlocks() {
  const codeElements = document.querySelectorAll('pre code');
  const newCount = codeElements.length;
  
  if (newCount !== codeBlockCount) {
    codeBlockCount = newCount;
    console.log(`Code Bridge: Detected ${codeBlockCount} code blocks`);
    
    // Update badge on extension icon (optional - shows count)
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ 
        type: 'updateBadge', 
        count: codeBlockCount 
      }).catch(err => {
        // Ignore if popup not open
      });
    }
  }
}

// Detect code blocks on load
window.addEventListener('load', () => {
  detectCodeBlocks();
  console.log('Code Bridge: Page loaded, monitoring for code blocks');
});

// Monitor for dynamically loaded code blocks (Perplexity loads content dynamically)
const observer = new MutationObserver((mutations) => {
  detectCodeBlocks();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Security: Prevent tampering with extension APIs
try {
  if (typeof chrome !== 'undefined') {
    Object.freeze(chrome);
    if (chrome.runtime) Object.freeze(chrome.runtime);
    if (chrome.storage) Object.freeze(chrome.storage);
  }
} catch (e) {
  console.warn('Code Bridge: Could not freeze Chrome APIs (expected in some environments)');
}

// Listen for messages from extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getCodeBlockCount') {
    sendResponse({ count: codeBlockCount });
  }
  return true;
});

console.log('Code Bridge Pro: Monitoring active');
