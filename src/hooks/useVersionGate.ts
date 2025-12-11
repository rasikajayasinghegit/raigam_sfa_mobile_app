import { useCallback, useEffect, useRef, useState } from 'react';
import { APP_VERSION, MIN_LOADING_MS } from '../config/appConfig';
import { checkVersion, VersionCheckOutcome, VersionCheckResult } from '../services/versionCheck';

export type GateStatus = 'loading' | 'ready' | 'blocked' | 'error';

export function useVersionGate() {
  const [status, setStatus] = useState<GateStatus>('loading');
  const [statusMessage, setStatusMessage] = useState<string>('Checking version…');
  const [progress, setProgress] = useState<number>(0.12);
  const [versionInfo, setVersionInfo] = useState<VersionCheckResult>({
    version: '',
    mandatory: false,
    updateUrl: undefined,
    message: '',
  });
  const mountedRef = useRef(true);

  const ensureMinimumDelay = useCallback(async (startedAt: number) => {
    const elapsed = Date.now() - startedAt;
    const wait = Math.max(0, MIN_LOADING_MS - elapsed);
    if (wait > 0) {
      await new Promise(resolve => setTimeout(resolve, wait));
    }
  }, []);

  const runCheck = useCallback(async () => {
    const startedAt = Date.now();
    let nextStatus: GateStatus = 'ready';
    let nextMessage = '';
    let nextVersionInfo: VersionCheckResult = {
      version: '',
      mandatory: false,
      updateUrl: undefined,
      message: '',
    };

    setStatus('loading');
    setStatusMessage('Checking version…');
    setProgress(0.12);

    const outcome: VersionCheckOutcome = await checkVersion();

    if (outcome.status === 'ok') {
      nextStatus = 'ready';
      nextMessage = '';
      nextVersionInfo = outcome.payload;
    } else if (outcome.status === 'outdated') {
      nextStatus = 'blocked';
      nextMessage =
        outcome.payload.message ||
        `A new version (${outcome.payload.version}) is required to continue.`;
      nextVersionInfo = outcome.payload;
    } else {
      nextStatus = 'error';
      nextMessage =
        'Unable to verify app version right now. Please check your connection and retry.';
    }

    await ensureMinimumDelay(startedAt);
    if (!mountedRef.current) {
      return;
    }

    setVersionInfo(nextVersionInfo);
    setStatusMessage(nextMessage);
    setStatus(nextStatus);
    setProgress(1);
  }, [ensureMinimumDelay]);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  useEffect(() => {
    if (status !== 'loading') {
      return;
    }

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + 0.05;
        return next > 0.88 ? 0.88 : next;
      });
    }, 450);

    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    status,
    statusMessage,
    progress,
    versionInfo,
    appVersion: APP_VERSION,
    retry: runCheck,
  };
}
