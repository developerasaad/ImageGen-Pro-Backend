const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const imagekit = require('../config/imagekit');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
    }
  }
});

// Middleware to check API key (optional)
const checkApiKey = (req, res, next) => {
  const apiKey = process.env.BACKEND_API_KEY;
  // Only check API key if it's set and not 'optional_api_key_for_additional_security'
  if (apiKey && apiKey !== 'optional_api_key_for_additional_security' && req.headers['x-api-key'] !== apiKey) {
    console.log('API key check failed. Expected:', apiKey, 'Got:', req.headers['x-api-key']);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename) => {
  // Only allow safe characters: alphanumeric, underscore, hyphen, dot
  const sanitized = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
  // Ensure it matches the expected pattern
  const pattern = /^IMG_[0-9A-Za-z_-]+\.(png|jpg|jpeg|webp)$/;
  if (!pattern.test(sanitized)) {
    throw new Error('Invalid filename format');
  }
  return sanitized;
};

// POST /upload
router.post('/', checkApiKey, upload.single('file'), async (req, res) => {
  try {
    console.log('=== Upload Request Received ===');
    console.log('File:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'None');
    console.log('Body keys:', Object.keys(req.body));
    
    // Validate request
    if (!req.file) {
      console.error('Validation failed: No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    if (!req.body.filename) {
      console.error('Validation failed: Filename is required');
      return res.status(400).json({ error: 'Filename is required' });
    }
    
    if (!req.body.metadata) {
      console.error('Validation failed: Metadata is required');
      return res.status(400).json({ error: 'Metadata is required' });
    }
    
    // Sanitize filename
    const filename = sanitizeFilename(req.body.filename);
    
    // Parse metadata
    let parsedMetadata;
    try {
      parsedMetadata = JSON.parse(req.body.metadata);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid metadata JSON' });
    }
    
    // Validate metadata fields
    const requiredFields = ['prompt', 'style', 'aspect_ratio', 'model', 'userId', 'timestamp'];
    const missingFields = requiredFields.filter(field => !parsedMetadata[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required metadata fields: ${missingFields.join(', ')}` 
      });
    }
    
    console.log(`Uploading file: ${filename}`);
    
    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: req.file.buffer,
      fileName: filename,
      folder: '/imagegen-pro',
      useUniqueFileName: false,
      tags: ['imagegen-pro', parsedMetadata.model, parsedMetadata.style]
    });
    
    console.log(`ImageKit upload successful: ${uploadResponse.url}`);
    
    // Build full metadata object
    const fullMetadata = {
      filename: filename,
      imageUrl: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl || uploadResponse.url,
      fileId: uploadResponse.fileId,
      ...parsedMetadata,
      uploadedAt: new Date().toISOString()
    };
    
    // Save metadata JSON file
    const storagePath = process.env.STORAGE_PATH || './storage/metadata';
    const metadataFilePath = path.join(storagePath, `${filename}.json`);
    
    fs.writeFileSync(metadataFilePath, JSON.stringify(fullMetadata, null, 2));
    console.log(`Metadata saved: ${metadataFilePath}`);
    
    // Return success response
    res.json({
      imageUrl: uploadResponse.url,
      metadata: fullMetadata
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    
    if (error.message === 'Invalid filename format') {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.message.includes('File size too large')) {
      return res.status(413).json({ error: 'File size exceeds 10MB limit' });
    }
    
    res.status(500).json({ 
      error: 'Upload failed', 
      message: error.message 
    });
  }
});

module.exports = router;
