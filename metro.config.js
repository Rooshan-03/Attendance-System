// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// Get Expo's default Metro config
const defaultConfig = getDefaultConfig(__dirname);

// Ensure NativeWind knows where your Tailwind input CSS is
const nativeWindConfig = withNativeWind(defaultConfig, {
  input: path.resolve(__dirname, 'global.css'),
});

module.exports = nativeWindConfig;
