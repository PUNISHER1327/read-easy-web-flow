
const fs = require('fs');
const path = require('path');

// Create extension directory
const extensionDir = 'extension';
if (!fs.existsSync(extensionDir)) {
  fs.mkdirSync(extensionDir);
}

// Copy necessary files
const filesToCopy = [
  'public/manifest.json',
  'public/background.js',
  'public/content.js',
  'public/content.css',
  'public/popup.html',
  'public/popup.js'
];

filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    const fileName = path.basename(file);
    fs.copyFileSync(file, path.join(extensionDir, fileName));
    console.log(`Copied ${fileName}`);
  }
});

// Create simple icons (16x16, 32x32, 48x48, 128x128)
const iconSizes = [16, 32, 48, 128];
iconSizes.forEach(size => {
  const iconPath = path.join(extensionDir, `icon${size}.png`);
  // Create a simple colored square as placeholder
  // In production, you would use actual icon files
  if (!fs.existsSync(iconPath)) {
    fs.writeFileSync(iconPath, ''); // Placeholder
    console.log(`Created placeholder icon${size}.png`);
  }
});

console.log('\n✅ Extension files prepared in /extension directory');
console.log('\nTo install the extension:');
console.log('1. Open Chrome and go to chrome://extensions/');
console.log('2. Enable "Developer mode" in the top right');
console.log('3. Click "Load unpacked" and select the /extension directory');
console.log('4. The extension will be loaded and ready to use!');
