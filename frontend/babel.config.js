// babel.config.js
module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      // ... any other plugins
      'react-native-reanimated/plugin', // This MUST be last
    ],
  };