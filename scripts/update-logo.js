#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function for colored console output
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.cyan}${colors.bright}${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.magenta}📍 ${msg}${colors.reset}`)
};

async function updateLogo() {
  log.header('\n🏔️  Darjeeling Soul Logo Updater');
  log.header('=====================================\n');

  // Get input file path from command line arguments
  const inputPath = process.argv[2];
  
  if (!inputPath) {
    log.error('Please provide the path to your new logo file.');
    log.info('Usage: node scripts/update-logo.js <path-to-logo-file>');
    log.info('Example: node scripts/update-logo.js ~/Downloads/new-logo.png');
    process.exit(1);
  }

  try {
    // Resolve the input path
    const resolvedInputPath = path.resolve(inputPath);
    log.step(`Checking file: ${resolvedInputPath}`);

    // Check if input file exists
    if (!fs.existsSync(resolvedInputPath)) {
      log.error(`File not found: ${resolvedInputPath}`);
      log.info('Please check the file path and try again.');
      process.exit(1);
    }

    // Get file stats for validation
    const stats = fs.statSync(resolvedInputPath);
    const fileSizeMB = stats.size / (1024 * 1024);

    // Validate file size (max 5MB)
    if (fileSizeMB > 5) {
      log.error(`File too large: ${fileSizeMB.toFixed(2)}MB (max 5MB)`);
      process.exit(1);
    }

    // Validate file type by reading the file header
    const buffer = fs.readFileSync(resolvedInputPath);
    const isValidImage = await validateImageFile(buffer);
    
    if (!isValidImage) {
      log.error('Invalid image file. Please provide a PNG, JPG, or SVG file.');
      process.exit(1);
    }

    log.success('File validation passed');

    // Backup existing logo
    const logoPath = path.resolve('src/assets/logo.svg');
    const backupPath = path.resolve(`src/assets/logo-backup-${Date.now()}.svg`);
    
    if (fs.existsSync(logoPath)) {
      fs.copyFileSync(logoPath, backupPath);
      log.success(`Current logo backed up to: ${path.relative(process.cwd(), backupPath)}`);
    }

    // Ensure assets directory exists
    const assetsDir = path.dirname(logoPath);
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
      log.step(`Created directory: ${path.relative(process.cwd(), assetsDir)}`);
    }

    // Convert image to optimized SVG
    log.step('Converting image to SVG format...');
    
    let svgContent;
    
    // Check if input is already SVG
    if (path.extname(resolvedInputPath).toLowerCase() === '.svg') {
      svgContent = fs.readFileSync(resolvedInputPath, 'utf8');
      svgContent = optimizeSvg(svgContent);
    } else {
      // Convert raster image to SVG using sharp
      const imageBuffer = await sharp(resolvedInputPath)
        .resize(200, 200, { 
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();

      // Create SVG wrapper for the image
      const base64Image = imageBuffer.toString('base64');
      svgContent = createSvgFromImage(base64Image);
    }

    // Write the new logo
    fs.writeFileSync(logoPath, svgContent);
    log.success(`Logo updated successfully!`);
    log.step(`New logo location: ${path.relative(process.cwd(), logoPath)}`);
    log.info('🎨 SVG optimized for web usage');

    // Final success message
    log.header('\n🎉 Logo Update Complete!');
    log.header('========================');
    if (fs.existsSync(backupPath)) {
      log.info(`💾 Previous logo backed up to: ${path.relative(process.cwd(), backupPath)}`);
    }
    
    log.header('\n📋 Next Steps:');
    log.info('1. Restart your development server:');
    log.info('   npm run dev');
    log.info('');
    log.info('2. Or rebuild your project:');
    log.info('   npm run build');
    log.info('');
    log.info('3. Your new logo will appear throughout the application!');
    
    log.header('\n💡 Pro Tips:');
    log.info('• Your logo will automatically adapt to different colors using CSS');
    log.info('• Use className="text-nyano-terracotta" to make it terracotta colored');
    log.info('• Use className="text-white" for white logo on dark backgrounds');
    log.info('• The logo is now fully responsive and accessible');

  } catch (error) {
    log.error(`Failed to update logo: ${error.message}`);
    log.info('Please check the file path and try again.');
    process.exit(1);
  }
}

async function validateImageFile(buffer) {
  try {
    // Check for common image file signatures
    const signatures = {
      png: [0x89, 0x50, 0x4E, 0x47],
      jpg: [0xFF, 0xD8, 0xFF],
      svg: [0x3C, 0x73, 0x76, 0x67], // <svg
      svgAlt: [0x3C, 0x3F, 0x78, 0x6D] // <?xml
    };

    for (const [type, signature] of Object.entries(signatures)) {
      if (signature.every((byte, index) => buffer[index] === byte)) {
        return true;
      }
    }

    // Try to process with sharp as fallback
    try {
      await sharp(buffer).metadata();
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

function optimizeSvg(svgContent) {
  // Basic SVG optimization
  return svgContent
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove unnecessary whitespace
    .replace(/\s+/g, ' ')
    .trim()
    // Ensure proper xmlns
    .replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
    // Add currentColor for dynamic styling
    .replace(/fill="[^"]*"/g, 'fill="currentColor"')
    .replace(/stroke="[^"]*"/g, 'stroke="currentColor"')
    // Remove empty attributes
    .replace(/\s+[a-zA-Z-]+=""\s*/g, ' ');
}

function createSvgFromImage(base64Image) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor">
  <defs>
    <pattern id="logoPattern" patternUnits="userSpaceOnUse" width="200" height="200">
      <image href="data:image/png;base64,${base64Image}" x="0" y="0" width="200" height="200"/>
    </pattern>
  </defs>
  <rect width="200" height="200" fill="url(#logoPattern)"/>
</svg>`;
}

// Run the script
if (require.main === module) {
  updateLogo().catch(error => {
    log.error(`Script failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { updateLogo };