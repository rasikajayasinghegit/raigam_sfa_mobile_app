import { getCurrentLocation } from './location';
import { getCurrentDateTime12h } from './datetime';

export async function getCurrentDeviceContext() {
  const location = await getCurrentLocation();
  const dateTime = getCurrentDateTime12h();
  return { location, dateTime };
}
