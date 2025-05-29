
const fs = require('fs');
const path = require('path');

// Create extension directory
const extensionDir = 'extension';
if (!fs.existsSync(extensionDir)) {
  fs.mkdirSync(extensionDir);
}

// Files that should exist
const filesToCopy = [
  'public/manifest.json',
  'public/background.js',
  'public/content.js',
  'public/content.css',
  'public/popup.html',
  'public/popup.js'
];

console.log('Building Chrome Extension...\n');

// Copy files that exist
filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    const fileName = path.basename(file);
    fs.copyFileSync(file, path.join(extensionDir, fileName));
    console.log(`✅ Copied ${fileName}`);
  } else {
    console.log(`❌ Missing ${file}`);
  }
});

// Create placeholder icons
const iconSizes = [16, 32, 48, 128];
iconSizes.forEach(size => {
  const iconPath = path.join(extensionDir, `icon${size}.png`);
  const sourceIcon = `public/icon${size}.png`;
  
  if (fs.existsSync(sourceIcon)) {
    fs.copyFileSync(sourceIcon, iconPath);
    console.log(`✅ Copied icon${size}.png`);
  } else {
    // Create a simple placeholder
    fs.writeFileSync(iconPath, '');
    console.log(`⚠️  Created placeholder icon${size}.png`);
  }
});

console.log('\n🎉 Extension files prepared in /extension directory');
console.log('\nTo install the extension:');
console.log('1. Open Chrome and go to chrome://extensions/');
console.log('2. Enable "Developer mode" in the top right');
console.log('3. Click "Load unpacked" and select the /extension directory');
console.log('4. The extension will be loaded and ready to use!');
console.log('\nNote: You may see warnings about missing icon files, but the extension will still work.');
