const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Platform-specific exclusions - exclude desktop files from mobile builds
const platformExclusions = {
  // Exclude from mobile (android/ios) builds
  mobile: [
    /public\/electron\.js$/,
    /public\/preload\.js$/,
    /scripts\/.*\.js$/,
    /dist\/.*$/,
    /dist-fixed\/.*$/,
    /web-build\/.*$/,
    /electron-builder\.yml$/,
    /forge\.config\.js$/,
  ],
  // Could add web-specific exclusions here if needed
  web: [],
};

// Dynamic blacklist based on platform
const createPlatformBlacklist = (platform) => {
  const exclusions = [];
  
  if (platform === 'android' || platform === 'ios') {
    exclusions.push(...platformExclusions.mobile);
  }
  
  // Combine all exclusions into a single regex
  if (exclusions.length > 0) {
    return new RegExp(exclusions.map(regex => regex.source).join('|'));
  }
  
  return null;
};

// Apply blacklist configuration
config.resolver.blacklistRE = createPlatformBlacklist('mobile');

// Platform-specific source extensions  
config.resolver.platforms = ['android', 'ios', 'native', 'web'];
config.resolver.sourceExts = [...config.resolver.sourceExts];

// Optimization configuration
config.transformer.minifierConfig = {
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

// Platform-specific transform options with dynamic blacklist
const originalGetTransformOptions = config.transformer.getTransformOptions;
config.transformer.getTransformOptions = (entryPoints, options, getDependenciesOf) => {
  const result = originalGetTransformOptions(entryPoints, options, getDependenciesOf);
  
  // Update blacklist based on current platform
  const platformBlacklist = createPlatformBlacklist(options.platform);
  if (platformBlacklist) {
    config.resolver.blacklistRE = platformBlacklist;
  }
  
  // Platform-specific optimizations
  if (options.platform === 'android' || options.platform === 'ios') {
    result.transform = {
      ...result.transform,
      experimentalImportSupport: false,
      inlineRequires: true,
    };
  }
  
  return result;
};

module.exports = config;