import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export type LocationStatus = 'enabled' | 'disabled' | 'permission_denied';

export type LocationResult = {
  latitude: number;
  longitude: number;
  status: LocationStatus;
};

const DEFAULT_LOCATION: LocationResult = {
  latitude: 0,
  longitude: 0,
  status: 'disabled',
};

async function requestPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export async function getCurrentLocation(): Promise<LocationResult> {
  try {
    const permitted = await requestPermission();
    if (!permitted) {
      return { ...DEFAULT_LOCATION, status: 'permission_denied' };
    }

    return await new Promise<LocationResult>(resolve => {
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            status: 'enabled',
          });
        },
        error => {
          if (error?.code === 1) {
            resolve({ ...DEFAULT_LOCATION, status: 'permission_denied' });
          } else {
            resolve({ ...DEFAULT_LOCATION, status: 'disabled' });
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 },
      );
    });
  } catch (error: any) {
    if (error?.code === 1) {
      return { ...DEFAULT_LOCATION, status: 'permission_denied' };
    }
    return DEFAULT_LOCATION;
  }
}
