const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force Metro to transform these packages through Babel
// instead of skipping them as node_modules
config.transformer.unstable_allowRequireContext = true;
config.resolver.unstable_enablePackageExports = true;

module.exports = config;