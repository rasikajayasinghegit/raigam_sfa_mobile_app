import { config } from '../config/appConfig';

type ApiError = {
  code: 'unauthorized' | 'server' | 'network' | 'unknown';
  message: string;
  status?: number;
};

type ApiOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  token?: string;
  auth?: boolean;
};

type StoredTokens = {
  token?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: number;
  refreshTokenExpiresAt?: number;
};

let tokens: StoredTokens | null = null;
let onTokensChanged: ((updated: StoredTokens | null) => void | Promise<void>) | null =
  null;

export function setAuthTokens(
  nextTokens: StoredTokens | null,
  onChange?: (updated: StoredTokens | null) => void | Promise<void>,
) {
  tokens = nextTokens;
  if (onChange !== undefined) {
    onTokensChanged = onChange;
  } else if (!nextTokens) {
    onTokensChanged = null;
  }
}

function isAccessExpired() {
  if (!tokens?.accessTokenExpiresAt) {
    return false;
  }
  return Date.now() >= tokens.accessTokenExpiresAt - 5000; // refresh 5s early
}

function isRefreshExpired() {
  if (!tokens?.refreshTokenExpiresAt) {
    return false;
  }
  return Date.now() >= tokens.refreshTokenExpiresAt - 5000;
}

async function performRefresh(): Promise<string | undefined> {
  if (!tokens?.refreshToken || isRefreshExpired()) {
    throw <ApiError>{ code: 'unauthorized', message: 'Session expired' };
  }

  const url = `${config.apiBaseUrl}/api/v1/auth/refresh`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens.refreshToken}`,
    },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });

  if (!response.ok) {
    throw <ApiError>{ code: 'unauthorized', message: 'Session expired' };
  }

  const json = await response.json();
  const payload = json?.payload;
  if (!payload?.token) {
    throw <ApiError>{ code: 'unauthorized', message: 'Session expired' };
  }

  const updated: StoredTokens = {
    token: payload.token,
    refreshToken: payload.refreshToken || tokens.refreshToken,
    accessTokenExpiresAt: payload.accessTokenExpiry
      ? Date.now() + Number(payload.accessTokenExpiry)
      : tokens.accessTokenExpiresAt,
    refreshTokenExpiresAt: payload.refreshTokenExpiry
      ? Date.now() + Number(payload.refreshTokenExpiry)
      : tokens.refreshTokenExpiresAt,
  };

  tokens = updated;
  if (onTokensChanged) {
    await onTokensChanged(updated);
  }

  return updated.token;
}

async function getValidToken(explicit?: string): Promise<string | undefined> {
  if (explicit) {
    return explicit;
  }

  if (!tokens?.token) {
    return undefined;
  }

  if (isAccessExpired()) {
    return performRefresh();
  }

  return tokens.token;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, headers, body, method = 'GET', auth = true } = options;
  const url = `${config.apiBaseUrl}${path}`;

  const doRequest = async (authToken?: string) => {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return response;
  };

  try {
    const authToken = auth ? await getValidToken(token) : token;
    let response = await doRequest(authToken);

    if (auth && response.status === 401) {
      const refreshed = await performRefresh();
      if (refreshed) {
        response = await doRequest(refreshed);
      }
    }

    if (response.status === 401) {
      throw <ApiError>{ code: 'unauthorized', message: 'Session expired', status: 401 };
    }

    if (!response.ok) {
      const message = `Request failed (${response.status})`;
      throw <ApiError>{ code: 'server', message, status: response.status };
    }

    const text = await response.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
  } catch (error: any) {
    if (error?.code === 'unauthorized') {
      throw error;
    }

    if (error?.message?.includes('Network request failed')) {
      throw <ApiError>{ code: 'network', message: 'Network unavailable' };
    }

    throw <ApiError>{ code: 'unknown', message: error?.message || 'Unexpected error' };
  }
}
