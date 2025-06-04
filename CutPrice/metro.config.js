const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const config = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    assetExts: [...assetExts, 'db', 'sqlite', 'csv'],
    sourceExts: [...sourceExts, 'jsx', 'js', 'ts', 'tsx', 'json'],
    requireCycleIgnorePatterns: [/(java|com|org)\..*/, /.*\.gradle.*/],
  },
};

module.exports = config; 