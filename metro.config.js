const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude electron files from web builds
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.sourceExts = [...config.resolver.sourceExts];

// Filter out electron files when building for web
const originalGetTransformOptions = config.transformer.getTransformOptions;
config.transformer.getTransformOptions = (entryPoints, options, getDependenciesOf) => {
  const result = originalGetTransformOptions(entryPoints, options, getDependenciesOf);
  
  // Exclude electron directory for web builds
  if (options.platform === 'web') {
    config.resolver.blacklistRE = /electron\/.*/;
  }
  
  return result;
};

module.exports = config;