import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginPayload } from '../services/auth';

const SESSION_KEY = '@session';
const REMEMBER_KEY = '@remember';

export async function saveSession(session: LoginPayload, remember: boolean) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  await AsyncStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false');
}

export async function loadSession(): Promise<{
  session: LoginPayload | null;
  remember: boolean;
}> {
  const remember = (await AsyncStorage.getItem(REMEMBER_KEY)) === 'true';
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) {
    return { session: null, remember };
  }
  try {
    const parsed = JSON.parse(raw) as LoginPayload;
    return { session: parsed, remember };
  } catch (error) {
    return { session: null, remember };
  }
}

export async function clearSession() {
  await AsyncStorage.multiRemove([SESSION_KEY, REMEMBER_KEY]);
}
