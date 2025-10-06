const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const uploadRoute = require('./routes/upload');
const templatesRoute = require('./routes/templates');
const metadataRoute = require('./routes/metadata');

const app = express();
const PORT = process.env.PORT || 3000;
const STORAGE_PATH = process.env.STORAGE_PATH || './storage/metadata';

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_PATH)) {
  fs.mkdirSync(STORAGE_PATH, { recursive: true });
  console.log(`Created storage directory: ${STORAGE_PATH}`);
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/upload', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Routes
app.use('/upload', uploadRoute);
app.use('/templates', templatesRoute);
app.use('/metadata', metadataRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server - listen on all interfaces (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ImageGen Pro Backend running on http://0.0.0.0:${PORT}`);
  console.log(`Storage path: ${STORAGE_PATH}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`ImageKit configured: ${process.env.IMAGEKIT_PUBLIC_KEY ? 'Yes' : 'No'}`);
});

module.exports = app;
