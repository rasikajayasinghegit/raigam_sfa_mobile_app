import { apiFetch } from './http';

export type LoginPayload = {
  token: string;
  refreshToken: string;
  accessTokenExpiry: number;
  refreshTokenExpiry: number;
  accessTokenExpiresAt?: number;
  refreshTokenExpiresAt?: number;
  userId: number;
  roleId: number;
  role: string;
  subRoleId: number;
  subRole: string;
  userTypeId: number;
  userType: string;
  rangeId: number;
  range: string;
  areaIds: number[];
  territoryId: number;
  territoryName: string;
  distributorId: number;
  distributorName: string;
  userAgencyId: number;
  agencyTerritoryId: number;
  agencyWarehouseId: number;
  agencyCode: number;
  agencyName: string;
  userName: string;
  personalName: string;
  gpsStatus: boolean;
  serverTime: string;
};

export type AuthResponse = {
  code: number;
  message: string;
  payload: LoginPayload;
};

export async function login(userName: string, password: string): Promise<LoginPayload> {
  const response = await apiFetch<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: { userName, password },
    auth: false,
  });

  if (!response?.payload) {
    throw new Error('Invalid login response');
  }

  return response.payload;
}

export async function refreshSession(refreshToken: string): Promise<LoginPayload> {
  const response = await apiFetch<AuthResponse>('/api/v1/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    token: refreshToken,
    auth: false,
  });

  if (!response?.payload) {
    throw new Error('Invalid refresh response');
  }

  return response.payload;
}
