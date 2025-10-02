const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'running', 
    message: 'Code Bridge Server is active!',
    version: '1.0.0'
  });
});

// Receive code from Chrome extension
app.post('/code', (req, res) => {
  const { codeBlocks } = req.body;

  if (!codeBlocks || codeBlocks.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'No code blocks provided' 
    });
  }

  // Create output folder with timestamp
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const outputDir = path.join(process.cwd(), 'extracted-code', timestamp);

  try {
    // Create directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save each code block
    codeBlocks.forEach((block, index) => {
      const filePath = path.join(outputDir, block.filename);
      const fileDir = path.dirname(filePath);
      
      // Create subdirectories if needed
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      fs.writeFileSync(filePath, block.content, 'utf8');
      console.log(`✅ Saved: ${block.filename}`);
    });

    console.log(`\n🎉 Successfully saved ${codeBlocks.length} file(s) to:`);
    console.log(`📁 ${outputDir}\n`);

    res.json({ 
      success: true, 
      message: `Saved ${codeBlocks.length} file(s)`,
      path: outputDir
    });

  } catch (error) {
    console.error('❌ Error saving files:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log('⚡ Code Bridge Server Started!');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📡 Ready to receive code from Chrome extension\n');
});
