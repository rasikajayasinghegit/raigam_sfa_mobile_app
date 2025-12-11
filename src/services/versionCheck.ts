import { Platform } from 'react-native';
import { APP_VERSION, VERSION_CHECK_TIMEOUT_MS, VERSION_CHECK_URL } from '../config/appConfig';
import { compareSemver } from '../utils/semver';

export type VersionCheckResult = {
  version: string;
  mandatory?: boolean;
  updateUrl?: string;
  message?: string;
};

export type VersionCheckOutcome =
  | { status: 'ok'; payload: VersionCheckResult }
  | { status: 'outdated'; payload: VersionCheckResult }
  | { status: 'error'; error: Error };

type PlatformVersionEntry = {
  versionCode?: number;
  versionName?: string;
  url?: string;
  mandatory?: boolean;
  message?: string;
};

type VersionResponse =
  | {
      version: string;
      mandatory?: boolean;
      updateUrl?: string;
      message?: string;
    }
  | {
      android?: PlatformVersionEntry;
      ios?: PlatformVersionEntry;
    };

function normalizePayload(raw: VersionResponse): VersionCheckResult | null {
  // Supports flat shape { version, mandatory, updateUrl } and platform-specific shape { android: { versionName, url, mandatory }, ios: { ... } }
  if ('version' in raw) {
    return {
      version: raw.version,
      mandatory: raw.mandatory,
      updateUrl: raw.updateUrl,
      message: raw.message,
    };
  }

  const platformEntry =
    Platform.OS === 'ios'
      ? raw.ios ?? raw.android // fall back to android if ios missing
      : raw.android ?? raw.ios;

  if (!platformEntry) {
    return null;
  }

  return {
    version: platformEntry.versionName ?? String(platformEntry.versionCode ?? ''),
    mandatory: platformEntry.mandatory,
    updateUrl: platformEntry.url,
    message: platformEntry.message,
  };
}

export async function checkVersion(): Promise<VersionCheckOutcome> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VERSION_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(VERSION_CHECK_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Version check failed with status ${response.status}`);
    }
    const json = (await response.json()) as VersionResponse;
    const normalized = normalizePayload(json);
    if (!normalized || !normalized.version) {
      throw new Error('Version check response missing version');
    }

    const latest = normalized.version;
    const mandatory = Boolean(normalized.mandatory);
    const isOutdated = compareSemver(latest, APP_VERSION) === 1;

    if (isOutdated && mandatory) {
      return { status: 'outdated', payload: normalized };
    }
    return { status: 'ok', payload: normalized };
  } catch (error: any) {
    return { status: 'error', error };
  } finally {
    clearTimeout(timeout);
  }
}
