const path = require('path');

const appEnv = process.env.APP_ENV || 'development';
const envFile = path.resolve(__dirname, `.env.${appEnv}`);

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: envFile,
        allowUndefined: false,
      },
    ],
  ],
};
