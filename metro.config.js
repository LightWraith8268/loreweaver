const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Android-optimized configuration
config.resolver.platforms = ['android', 'ios', 'native', 'web'];
config.resolver.sourceExts = [...config.resolver.sourceExts];

// Android-specific optimizations
config.transformer.minifierConfig = {
  // Optimize for Android builds
  keep_fnames: false,
  mangle: {
    keep_fnames: false,
  },
  output: {
    ascii_only: true,
    quote_keys: false,
    wrap_iife: false,
  },
};

// Platform-specific file filtering
const originalGetTransformOptions = config.transformer.getTransformOptions;
config.transformer.getTransformOptions = (entryPoints, options, getDependenciesOf) => {
  const result = originalGetTransformOptions(entryPoints, options, getDependenciesOf);
  
  // Exclude electron directory for web builds
  if (options.platform === 'web') {
    config.resolver.blacklistRE = /electron\/.*/;
  }
  
  // Android-specific transform options
  if (options.platform === 'android') {
    result.transform = {
      ...result.transform,
      experimentalImportSupport: false,
      inlineRequires: true,
    };
  }
  
  return result;
};

module.exports = config;