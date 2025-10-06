const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://192.168.1.11:3000';

async function testBackend() {
  console.log('Testing backend at:', BACKEND_URL);
  
  // Test 1: Health check
  try {
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BACKEND_URL}/health`);
    console.log('✓ Health check passed:', healthResponse.data);
  } catch (error) {
    console.error('✗ Health check failed:', error.message);
    return;
  }
  
  // Test 2: Get templates
  try {
    console.log('\n2. Testing templates endpoint...');
    const templatesResponse = await axios.get(`${BACKEND_URL}/templates`);
    console.log('✓ Templates endpoint passed. Found', templatesResponse.data.length, 'templates');
  } catch (error) {
    console.error('✗ Templates endpoint failed:', error.message);
  }
  
  // Test 3: Upload test image
  try {
    console.log('\n3. Testing upload endpoint...');
    
    // Create a simple test image buffer (1x1 PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    
    const form = new FormData();
    form.append('file', testImageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });
    form.append('filename', 'IMG_TEST_001.png');
    form.append('metadata', JSON.stringify({
      prompt: 'Test image',
      style: 'realistic',
      aspect_ratio: '1:1',
      model: 'pollinations.ai',
      userId: 'test-user',
      timestamp: new Date().toISOString()
    }));
    
    const uploadResponse = await axios.post(`${BACKEND_URL}/upload`, form, {
      headers: {
        ...form.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    console.log('✓ Upload successful!');
    console.log('  Image URL:', uploadResponse.data.imageUrl);
    console.log('  Metadata saved:', uploadResponse.data.metadata.filename);
    
  } catch (error) {
    console.error('✗ Upload failed:', error.response?.data || error.message);
  }
  
  console.log('\n=== Test Complete ===');
}

testBackend();
