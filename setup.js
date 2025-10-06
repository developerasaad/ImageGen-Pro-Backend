const fs = require('fs');
const path = require('path');

console.log('🚀 ImageGen Pro Backend Setup\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('⚠️  .env file not found!');
  console.log('📝 Creating .env from .env.example...\n');
  
  if (fs.existsSync('.env.example')) {
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env file created!');
    console.log('⚠️  Please edit .env and add your ImageKit credentials:\n');
    console.log('   - IMAGEKIT_PUBLIC_KEY');
    console.log('   - IMAGEKIT_PRIVATE_KEY');
    console.log('   - IMAGEKIT_URL_ENDPOINT\n');
  } else {
    console.log('❌ .env.example not found!');
  }
} else {
  console.log('✅ .env file exists');
}

// Create storage directory
const storagePath = process.env.STORAGE_PATH || './storage/metadata';
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
  console.log(`✅ Created storage directory: ${storagePath}`);
} else {
  console.log(`✅ Storage directory exists: ${storagePath}`);
}

console.log('\n✨ Setup complete!');
console.log('\n📚 Next steps:');
console.log('   1. Edit .env with your ImageKit credentials');
console.log('   2. Run: npm run dev');
console.log('   3. Test: http://localhost:3000/health\n');
