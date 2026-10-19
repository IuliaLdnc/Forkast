module.exports = {
  preset: '@react-native/jest-preset',
  // AsyncStorage and safe-area-context ship untranspiled ESM, so they have to
  // be excluded from the default node_modules transform skip list.
  transformIgnorePatterns: [
    'node_modules/(?!(?:jest-)?react-native|@react-native(?:-community)?|' +
      '@react-native-async-storage|react-native-safe-area-context)',
  ],
};
