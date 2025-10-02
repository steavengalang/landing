// Content script untuk detect code blocks di Perplexity
console.log('Code Bridge: Content script loaded on Perplexity.ai');

// Optional: Auto-detect code blocks saat page load
window.addEventListener('load', () => {
  const codeBlocks = document.querySelectorAll('pre code');
  if (codeBlocks.length > 0) {
    console.log(`Code Bridge: Found ${codeBlocks.length} code blocks`);
  }
});
