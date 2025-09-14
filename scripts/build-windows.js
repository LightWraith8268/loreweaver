#!/usr/bin/env node

/**
 * Streamlined Windows Build Script for LoreWeaver
 * 
 * This script creates a consistent Windows build process:
 * 1. Cleans previous builds
 * 2. Builds web export
 * 3. Creates Windows executable
 * 4. Moves everything to a clean win/ folder
 * 5. Always keeps only the latest version
 * 
 * Usage: npm run build:win
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const winDir = path.join(rootDir, 'win');
const tempBuildDir = path.join(rootDir, 'dist-temp');

function log(message) {
  console.log(`🔨 ${message}`);
}

function logError(message) {
  console.error(`❌ ${message}`);
}

function success(message) {
  console.log(`✅ ${message}`);
}

function removeDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  
  ensureDir(dest);
  const items = fs.readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function moveFile(src, dest) {
  if (fs.existsSync(src)) {
    ensureDir(path.dirname(dest));
    fs.renameSync(src, dest);
    return true;
  }
  return false;
}

async function buildWindows() {
  try {
    log('Starting streamlined Windows build...');
    
    // Step 1: Clean previous builds
    log('Cleaning previous builds...');
    removeDir(winDir);
    removeDir(tempBuildDir);
    removeDir(path.join(rootDir, 'dist-fixed'));
    removeDir(path.join(rootDir, 'web-build'));
    success('Cleaned previous builds');
    
    // Step 2: Build web export
    log('Building web export...');
    try {
      // Try direct expo export first
      execSync('node_modules\\.bin\\expo export --platform web', { 
        cwd: rootDir, 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      // Run electron paths fix
      log('Fixing Electron paths...');
      execSync('node scripts/fix-electron-paths.js', { 
        cwd: rootDir, 
        stdio: 'inherit'
      });
      
    } catch (exportError) {
      // Fallback to npm script
      log('Direct export failed, trying npm script...');
      execSync('npm run build:web', { 
        cwd: rootDir, 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
    }
    success('Web export completed');
    
    // Step 3: Temporarily configure electron-builder output
    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const originalBuildConfig = { ...packageJson.build };
    
    // Override build config for temp directory and correct paths
    packageJson.build = {
      ...originalBuildConfig,
      directories: {
        output: 'dist-temp'
      },
      extraResources: [
        {
          "from": "dist",
          "to": "dist"
        },
        {
          "from": "assets/images",
          "to": "assets/images"
        }
      ]
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    
    // Step 4: Build Windows executable
    log('Building Windows executable...');
    
    // Set main to electron.js for build
    packageJson.main = 'public/electron.js';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    
    try {
      execSync('node_modules\\.bin\\electron-builder --win', { 
        cwd: rootDir, 
        stdio: 'inherit'
      });
    } catch (builderError) {
      // Fallback to npx
      execSync('npx electron-builder --win', { 
        cwd: rootDir, 
        stdio: 'inherit'
      });
    }
    
    // Restore main
    packageJson.main = 'index.js';
    packageJson.build = originalBuildConfig;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    
    success('Windows executable built');
    
    // Step 5: Organize builds in win/ folder
    log('Organizing builds in win/ folder...');
    ensureDir(winDir);
    
    // Move unpacked version (for development/testing)
    const unpackedSrc = path.join(tempBuildDir, 'win-unpacked');
    const unpackedDest = path.join(winDir, 'unpacked');
    if (fs.existsSync(unpackedSrc)) {
      copyDir(unpackedSrc, unpackedDest);
      success('Moved unpacked version to win/unpacked/');
    }
    
    // Move installer (for distribution)
    const installerPattern = /LoreWeaver.*Setup.*\.exe$/;
    const tempFiles = fs.readdirSync(tempBuildDir);
    
    for (const file of tempFiles) {
      if (installerPattern.test(file)) {
        const srcPath = path.join(tempBuildDir, file);
        const destPath = path.join(winDir, 'LoreWeaver-Setup.exe');
        moveFile(srcPath, destPath);
        success(`Moved installer to win/LoreWeaver-Setup.exe`);
        break;
      }
    }
    
    // Move metadata files
    const metadataFiles = ['latest.yml', 'builder-debug.yml'];
    for (const file of metadataFiles) {
      const srcPath = path.join(tempBuildDir, file);
      const destPath = path.join(winDir, file);
      if (moveFile(srcPath, destPath)) {
        log(`Moved ${file} to win/`);
      }
    }
    
    // Step 6: Clean up temporary directories
    log('Cleaning up temporary files...');
    removeDir(tempBuildDir);
    success('Cleaned up temporary files');
    
    // Step 7: Create build info
    const buildInfo = {
      buildTime: new Date().toISOString(),
      version: packageJson.version,
      platform: 'win32',
      files: {
        unpacked: fs.existsSync(path.join(winDir, 'unpacked', 'LoreWeaver.exe')),
        installer: fs.existsSync(path.join(winDir, 'LoreWeaver-Setup.exe'))
      }
    };
    
    fs.writeFileSync(
      path.join(winDir, 'build-info.json'), 
      JSON.stringify(buildInfo, null, 2) + '\n'
    );
    
    success('Windows build completed successfully!');
    console.log('');
    console.log('📁 Build output in win/ folder:');
    console.log('   • win/unpacked/LoreWeaver.exe - For development and testing');  
    console.log('   • win/LoreWeaver-Setup.exe - For distribution');
    console.log('   • win/build-info.json - Build metadata');
    console.log('');
    console.log('🚀 Ready to test: cd win/unpacked && ./LoreWeaver.exe');
    
  } catch (error) {
    logError(`Build failed: ${error.message}`);
    
    // Restore original package.json on error
    try {
      const packageJsonPath = path.join(rootDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.main !== 'index.js') {
        packageJson.main = 'index.js';
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      }
    } catch (restoreError) {
      logError(`Failed to restore package.json: ${restoreError.message}`);
    }
    
    process.exit(1);
  }
}

// Run the build
buildWindows();