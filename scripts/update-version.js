#!/usr/bin/env node

/**
 * Version Update Script for LoreWeaver
 * 
 * This script ensures version consistency across all configuration files:
 * - package.json
 * - app.json (Expo config)
 * 
 * Usage: node scripts/update-version.js <new-version>
 * Example: node scripts/update-version.js 1.0.17
 */

const fs = require('fs');
const path = require('path');

function updateVersion(newVersion) {
  if (!newVersion) {
    console.error('❌ Error: Please provide a version number');
    console.log('Usage: node scripts/update-version.js <new-version>');
    console.log('Example: node scripts/update-version.js 1.0.17');
    process.exit(1);
  }

  // Validate version format (basic semantic versioning)
  if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
    console.error('❌ Error: Version must be in format x.y.z (e.g., 1.0.17)');
    process.exit(1);
  }

  const rootDir = path.resolve(__dirname, '..');
  
  console.log(`🔄 Updating version to ${newVersion}...`);

  try {
    // Update package.json
    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const oldVersion = packageJson.version;
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`✅ Updated package.json: ${oldVersion} → ${newVersion}`);

    // Update app.json (Expo config)
    const appJsonPath = path.join(rootDir, 'app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const oldExpoVersion = appJson.expo.version;
    const oldVersionCode = appJson.expo.android.versionCode;
    
    appJson.expo.version = newVersion;
    
    // Auto-increment Android versionCode based on version
    // Convert version 1.0.17 to versionCode 17 (using patch number)
    const versionParts = newVersion.split('.');
    const newVersionCode = parseInt(versionParts[2]) + (parseInt(versionParts[1]) * 100) + (parseInt(versionParts[0]) * 10000);
    appJson.expo.android.versionCode = newVersionCode;
    
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
    console.log(`✅ Updated app.json: ${oldExpoVersion} → ${newVersion}`);
    console.log(`✅ Updated Android versionCode: ${oldVersionCode} → ${newVersionCode}`);

    // Regenerate package-lock.json to maintain consistency
    console.log('🔄 Regenerating package-lock.json...');
    const { execSync } = require('child_process');
    execSync('npm install', { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ Updated package-lock.json');

    console.log('');
    console.log('🎉 Version update complete!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   • package.json version: ${newVersion}`);
    console.log(`   • app.json version: ${newVersion}`);
    console.log(`   • Android versionCode: ${newVersionCode}`);
    console.log(`   • package-lock.json: regenerated`);
    console.log('');
    console.log('🚀 Ready to build with synchronized versions!');

  } catch (error) {
    console.error('❌ Error updating version:', error.message);
    process.exit(1);
  }
}

// Run the script
const newVersion = process.argv[2];
updateVersion(newVersion);