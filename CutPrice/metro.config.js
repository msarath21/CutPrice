const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  };

  config.resolver = {
    ...resolver,
    sourceExts: [...resolver.sourceExts, 'cjs'],
    assetExts: [...resolver.assetExts, 'db', 'sqlite'],
  };

  return config;
})(); 