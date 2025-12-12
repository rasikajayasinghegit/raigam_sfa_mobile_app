const path = require('path');
const os = require('os');
const { FileStore } = require('metro-cache');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const maxWorkerThreads =
  Number(process.env.METRO_MAX_WORKER_THREADS) ||
  Math.max(1, Math.min(4, os.cpus().length - 1));

const config = {
  maxWorkers: maxWorkerThreads,
  cacheStores: [
    new FileStore({
      root: path.join(__dirname, '.metro-cache'),
    }),
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
