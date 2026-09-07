module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {},
  transformIgnorePatterns: [
    'node_modules/(?!(?:@react-native|@react-navigation|react-native|react-native-gesture-handler|react-native-linear-gradient|react-native-safe-area-context|react-native-screens|react-native-svg|react-native-vector-icons)/)',
  ],
};
