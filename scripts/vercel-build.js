// Custom build script for Vercel deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Create in-memory database for production
  console.log('🗄️ Setting up production database...');
  
  // Copy sample data for production
  const fixturesPath = path.join(__dirname, '..', 'fixtures');
  const publicPath = path.join(__dirname, '..', 'public');
  
  if (fs.existsSync(fixturesPath)) {
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }
    
    // Copy fixtures to public folder for production access
    const fixtureFiles = fs.readdirSync(fixturesPath);
    fixtureFiles.forEach(file => {
      const src = path.join(fixturesPath, file);
      const dest = path.join(publicPath, file);
      fs.copyFileSync(src, dest);
      console.log(`📋 Copied ${file} to public folder`);
    });
  }

  console.log('✅ Vercel build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}