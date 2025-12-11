import { API_BASE_URL } from '@env';

export const APP_VERSION = '1.0.7';
export const VERSION_CHECK_URL =
  'https://sfasadevsea001.blob.core.windows.net/sfa-app-version-check/version.json';
export const VERSION_CHECK_TIMEOUT_MS = 10000;
export const MIN_LOADING_MS = 1200;
export const PULSE_DURATION_MS = 1200;

function assertConfig(value: string | undefined, key: string) {
  if (!value) {
    throw new Error(`Missing required config: ${key}`);
  }
}

assertConfig(API_BASE_URL, 'API_BASE_URL');

export const config = {
  apiBaseUrl: API_BASE_URL,
};
