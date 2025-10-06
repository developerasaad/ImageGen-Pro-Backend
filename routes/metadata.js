const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// GET /metadata/:filename
router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Sanitize filename to prevent path traversal
    const sanitized = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
    if (sanitized !== filename) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const storagePath = process.env.STORAGE_PATH || './storage/metadata';
    const metadataFilePath = path.join(storagePath, `${filename}.json`);
    
    // Check if file exists
    if (!fs.existsSync(metadataFilePath)) {
      return res.status(404).json({ error: 'Metadata not found' });
    }
    
    // Read and parse metadata
    const content = fs.readFileSync(metadataFilePath, 'utf8');
    const metadata = JSON.parse(content);
    
    res.json(metadata);
    
  } catch (error) {
    console.error('Metadata fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch metadata', 
      message: error.message 
    });
  }
});

module.exports = router;
