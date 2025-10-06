const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// GET /templates
router.get('/', async (req, res) => {
  try {
    const storagePath = process.env.STORAGE_PATH || './storage/metadata';
    
    // Check if storage directory exists
    if (!fs.existsSync(storagePath)) {
      return res.json([]);
    }
    
    // Read all JSON files from storage
    const files = fs.readdirSync(storagePath)
      .filter(file => file.endsWith('.json'));
    
    // Parse and collect metadata
    const templates = [];
    
    for (const file of files) {
      try {
        const filePath = path.join(storagePath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const metadata = JSON.parse(content);
        
        // Build template object
        templates.push({
          id: metadata.filename || file.replace('.json', ''),
          imageUrl: metadata.imageUrl,
          thumbnailUrl: metadata.thumbnailUrl || metadata.imageUrl,
          prompt: metadata.prompt,
          style: metadata.style,
          aspect_ratio: metadata.aspect_ratio,
          model: metadata.model,
          timestamp: metadata.timestamp || metadata.uploadedAt
        });
      } catch (error) {
        console.error(`Error parsing ${file}:`, error.message);
        // Skip invalid files
      }
    }
    
    // Sort by timestamp (newest first)
    templates.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB - dateA;
    });
    
    console.log(`Returning ${templates.length} templates`);
    res.json(templates);
    
  } catch (error) {
    console.error('Templates error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch templates', 
      message: error.message 
    });
  }
});

module.exports = router;
