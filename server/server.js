const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../client/build')));
app.use('/api', routes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Endpoint to analyze code
app.post('/api/analyze', async (req, res) => {
  try {
    const { files, options } = req.body;

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    // Validate file sizes and content
    for (const [filename, content] of Object.entries(files)) {
      if (typeof content !== 'string') {
        return res.status(400).json({ error: 'File content must be a string' });
      }

      if (content.length > 1000000) { // 1MB limit per file
        return res.status(400).json({ error: 'File size exceeds the limit (1MB)' });
      }

      if (!filename.match(/\.(c|cpp|h|hpp)$/i)) {
        return res.status(400).json({ error: 'Only C/C++ files are allowed' });
      }
    }

    const result = await runCoreTrace(files, options || {});
    res.json(result);
  } catch (error) {
    console.error('Error analyzing code:', error);
    res.status(500).json({ error: 'An error occurred during analysis' });
  }
});

// Catch-all handler for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'An unexpected error occurred',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
