const API_URL = 'https://landing-chi-lovat.vercel.app';
let extractedCodeBlocks = [];
let userTier = 'free';
let licenseKey = null;

// Load license dari storage
chrome.storage.sync.get(['licenseKey', 'tier'], async (result) => {
  if (result.licenseKey) {
    licenseKey = result.licenseKey;
    await verifyLicense(licenseKey);
  }
  userTier = result.tier || 'free';
});

async function verifyLicense(key) {
  try {
    const response = await fetch(`${API_URL}/api/verify-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: key })
    });
    
    const data = await response.json();
    if (data.valid) {
      userTier = data.tier;
      chrome.storage.sync.set({ tier: data.tier });
    } else {
      userTier = 'free';
      chrome.storage.sync.set({ tier: 'free' });
    }
  } catch (error) {
    console.error('License verification failed:', error);
  }
}

async function trackUsage() {
  if (userTier === 'pro') return true;
  
  const userId = await getOrCreateUserId();
  
  try {
    const response = await fetch(`${API_URL}/api/track-usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, tier: userTier })
    });
    
    const data = await response.json();
    
    if (!data.canUse) {
      showUpgradePrompt(data);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Track usage failed:', error);
    return true; // Allow on error
  }
}

async function getOrCreateUserId() {
  const result = await chrome.storage.local.get(['userId']);
  if (result.userId) return result.userId;
  
  const userId = 'user_' + Math.random().toString(36).substr(2, 9);
  await chrome.storage.local.set({ userId });
  return userId;
}

function showUpgradePrompt(data) {
  document.getElementById('status').innerHTML = `
    <div style="color:#dc2626;font-weight:700;font-size:14px;margin-bottom:10px;">
      ⚠️ Daily Limit Reached (${data.usage}/${data.limit})
    </div>
    <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:12px;">
      Upgrade to Pro for unlimited extractions!
    </div>
    <button onclick="window.open('${API_URL}/pricing')" style="padding:12px 24px;background:linear-gradient(135deg,#dc2626,#991b1b);color:white;border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:13px;width:100%;">
      ⭐ Upgrade to Pro - $4.99/mo
    </button>
  `;
}

// Extract Button
document.getElementById('extractBtn').addEventListener('click', async () => {
  const canProceed = await trackUsage();
  if (!canProceed) return;
  
  const statusDiv = document.getElementById('status');
  const fileManager = document.getElementById('fileManager');
  const fileList = document.getElementById('fileList');
  const sendBtn = document.getElementById('sendBtn');
  const statsContainer = document.getElementById('statsContainer');
  
  statusDiv.innerHTML = '⏳ Extracting code blocks...';
  fileList.innerHTML = '';
  extractedCodeBlocks = [];
  fileManager.style.display = 'none';
  sendBtn.style.display = 'none';
  statsContainer.style.display = 'none';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('perplexity.ai')) {
      statusDiv.innerHTML = '❌ Please open Perplexity.ai first!';
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractCodeBlocks,
    }, (results) => {
      if (chrome.runtime.lastError || !results || !results[0]) {
        statusDiv.innerHTML = '❌ Failed to extract code blocks!';
        return;
      }

      const codeBlocks = results[0].result;
      
      if (codeBlocks.length === 0) {
        statusDiv.innerHTML = '⚠️ No code blocks found!';
        return;
      }

      extractedCodeBlocks = codeBlocks;
      updateStats();
      renderFileList();
      fileManager.style.display = 'block';
      statusDiv.innerHTML = `✅ Found ${codeBlocks.length} code block(s)!`;
      sendBtn.style.display = 'block';
    });
  } catch (error) {
    statusDiv.innerHTML = `❌ Error: ${error.message}`;
  }
});

function updateStats() {
  const statsContainer = document.getElementById('statsContainer');
  let totalLines = 0;
  let totalSize = 0;

  extractedCodeBlocks.forEach(block => {
    totalLines += block.content.split('\n').length;
    totalSize += block.content.length;
  });

  document.getElementById('fileCount').textContent = extractedCodeBlocks.length;
  document.getElementById('lineCount').textContent = totalLines;
  document.getElementById('sizeCount').textContent = (totalSize / 1024).toFixed(1) + 'KB';
  document.getElementById('fileCountLabel').textContent = `${extractedCodeBlocks.length} files`;
  statsContainer.style.display = 'grid';
}

function renderFileList() {
  const fileList = document.getElementById('fileList');
  fileList.innerHTML = '';

  extractedCodeBlocks.forEach((block, index) => {
    const fileCard = createFileCard(block, index);
    fileList.appendChild(fileCard);
  });
}

function createFileCard(block, index) {
  const card = document.createElement('div');
  card.className = 'file-card';
  card.id = `file-card-${index}`;

  const header = document.createElement('div');
  header.className = 'file-header';

  const leftSide = document.createElement('div');
  leftSide.className = 'file-left';

  const number = document.createElement('div');
  number.className = 'file-number';
  number.textContent = index + 1;

  const lang = document.createElement('div');
  lang.className = 'file-lang';
  lang.textContent = block.language || 'text';

  leftSide.appendChild(number);
  leftSide.appendChild(lang);

  const actions = document.createElement('div');
  actions.className = 'file-actions';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-delete';
  deleteBtn.innerHTML = '🗑️ Delete';
  deleteBtn.onclick = () => deleteFile(index);

  actions.appendChild(deleteBtn);
  header.appendChild(leftSide);
  header.appendChild(actions);

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'file-input';
  input.value = block.filename;
  input.id = `filename-${index}`;
  input.placeholder = 'Enter filename...';

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'toggle-preview';
  toggleBtn.textContent = 'Show Preview';
  toggleBtn.onclick = () => togglePreview(index);

  const preview = document.createElement('div');
  preview.className = 'code-preview';
  preview.id = `preview-${index}`;
  preview.style.display = 'none';
  preview.textContent = block.content.substring(0, 500) + (block.content.length > 500 ? '\n...' : '');

  card.appendChild(header);
  card.appendChild(input);
  card.appendChild(toggleBtn);
  card.appendChild(preview);

  return card;
}

function deleteFile(index) {
  const card = document.getElementById(`file-card-${index}`);
  card.classList.add('removing');

  setTimeout(() => {
    extractedCodeBlocks.splice(index, 1);
    updateStats();
    renderFileList();

    if (extractedCodeBlocks.length === 0) {
      document.getElementById('fileManager').style.display = 'none';
      document.getElementById('sendBtn').style.display = 'none';
      document.getElementById('statsContainer').style.display = 'none';
      document.getElementById('status').innerHTML = '⚠️ All files removed!';
    }
  }, 300);
}

function togglePreview(index) {
  const preview = document.getElementById(`preview-${index}`);
  const btn = preview.previousElementSibling;
  
  if (preview.style.display === 'none') {
    preview.style.display = 'block';
    btn.textContent = 'Hide Preview';
  } else {
    preview.style.display = 'none';
    btn.textContent = 'Show Preview';
  }
}

// Send Button
document.getElementById('sendBtn').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status');
  
  if (extractedCodeBlocks.length === 0) {
    statusDiv.innerHTML = '❌ No files to send!';
    return;
  }

  // Update filenames dari input
  extractedCodeBlocks.forEach((block, index) => {
    const input = document.getElementById(`filename-${index}`);
    if (input && input.value.trim()) {
      block.filename = input.value.trim();
    }
  });

  statusDiv.innerHTML = '⏳ Sending to VS Code...';

  try {
    const response = await fetch('http://localhost:3000/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codeBlocks: extractedCodeBlocks }),
    });

    const data = await response.json();
    
    if (data.success) {
      statusDiv.innerHTML = `✅ Success! ${extractedCodeBlocks.length} file(s) sent!`;
      
      setTimeout(() => {
        document.getElementById('fileManager').style.display = 'none';
        document.getElementById('sendBtn').style.display = 'none';
        document.getElementById('statsContainer').style.display = 'none';
        extractedCodeBlocks = [];
        statusDiv.innerHTML = 'Ready to extract code blocks from Perplexity';
      }, 2500);
    } else {
      statusDiv.innerHTML = `❌ Failed: ${data.message}`;
    }
  } catch (err) {
    statusDiv.innerHTML = '❌ Server offline! Run: <code>node server.js</code>';
  }
});

// Extract function (runs in page context)
function extractCodeBlocks() {
  const codeBlocks = [];
  const seenContent = new Set();
  let fileCounter = 1;

  const codeElements = document.querySelectorAll('pre code');
  const preElements = document.querySelectorAll('pre');

  codeElements.forEach((block) => {
    const content = (block.textContent || block.innerText).trim();
    if (!content || content.length < 10) return;
    if (seenContent.has(content)) return;
    seenContent.add(content);

    let language = 'txt';
    const classList = block.className;
    if (classList.includes('language-')) {
      language = classList.split('language-')[1].split(' ')[0];
    }

    const extensionMap = {
      'javascript': 'js', 'typescript': 'ts', 'python': 'py',
      'html': 'html', 'css': 'css', 'php': 'php', 'java': 'java',
      'csharp': 'cs', 'cpp': 'cpp', 'c': 'c', 'json': 'json',
      'xml': 'xml', 'sql': 'sql', 'bash': 'sh', 'shell': 'sh',
      'go': 'go', 'rust': 'rs', 'ruby': 'rb', 'swift': 'swift'
    };

    const ext = extensionMap[language] || 'txt';
    let filename = null;

    const lines = content.split('\n');
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i].trim();
      const commentMatch = line.match(/^[\/\/#]+\s*([a-zA-Z0-9_\-\.\/\\]+\.[a-z]+)/i);
      if (commentMatch) {
        filename = commentMatch[1];
        break;
      }
    }

    if (!filename) {
      filename = `file_${fileCounter}.${ext}`;
      fileCounter++;
    }

    codeBlocks.push({ filename, content, language });
  });

  preElements.forEach((block) => {
    if (block.querySelector('code')) return;
    
    const content = (block.textContent || block.innerText).trim();
    if (!content || content.length < 10) return;
    if (seenContent.has(content)) return;
    seenContent.add(content);

    let language = 'txt';
    const classList = block.className;
    if (classList.includes('language-')) {
      language = classList.split('language-')[1].split(' ')[0];
    }

    const extensionMap = {
      'javascript': 'js', 'typescript': 'ts', 'python': 'py',
      'html': 'html', 'css': 'css', 'php': 'php'
    };

    const ext = extensionMap[language] || 'txt';
    let filename = `file_${fileCounter}.${ext}`;
    fileCounter++;

    codeBlocks.push({ filename, content, language });
  });

  return codeBlocks;
}
