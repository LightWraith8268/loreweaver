const fs = require('fs');
const path = require('path');

// Fix HTML paths for Electron compatibility
function fixElectronPaths() {
  const webBuildPath = path.join(__dirname, '..', 'dist');
  const indexHtmlPath = path.join(webBuildPath, 'index.html');
  
  if (!fs.existsSync(indexHtmlPath)) {
    console.log('index.html not found, skipping path fixes');
    return;
  }

  console.log('Fixing HTML paths for Electron compatibility...');
  
  let html = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // Fix absolute paths to relative paths
  html = html.replace(/href="\/favicon\.ico"/g, 'href="./assets/images/favicon.png"');
  html = html.replace(/src="\/_expo\//g, 'src="./_expo/');
  html = html.replace(/href="\/_expo\//g, 'href="./_expo/');
  
  // Fix any other absolute asset paths
  html = html.replace(/src="\/assets\//g, 'src="./assets/');
  html = html.replace(/href="\/assets\//g, 'href="./assets/');
  
  // Write the fixed HTML back
  fs.writeFileSync(indexHtmlPath, html);
  console.log('✓ Fixed HTML paths in index.html');
  console.log('✓ Updated favicon path to point to assets/images/favicon.png');
  
  // Copy assets directory to dist if it doesn't exist
  const assetsSrc = path.join(__dirname, '..', 'assets');
  const assetsDest = path.join(webBuildPath, 'assets');
  
  if (fs.existsSync(assetsSrc) && !fs.existsSync(assetsDest)) {
    copyDirectory(assetsSrc, assetsDest);
    console.log('✓ Copied assets directory to dist');
  }
}

// Helper function to copy directory recursively
function copyDirectory(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (require.main === module) {
  fixElectronPaths();
}

module.exports = { fixElectronPaths };