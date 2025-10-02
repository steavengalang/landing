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
    
    // Update badge on extension icon
    chrome.runtime.sendMessage({ 
      type: 'updateBadge', 
      count: codeBlockCount 
    });
  }
}

// Detect code blocks on load
window.addEventListener('load', detectCodeBlocks);

// Monitor for dynamically loaded code blocks
const observer = new MutationObserver(detectCodeBlocks);
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Security: Prevent tampering with extension
Object.freeze(chrome);
Object.freeze(chrome.runtime);
Object.freeze(chrome.storage);
