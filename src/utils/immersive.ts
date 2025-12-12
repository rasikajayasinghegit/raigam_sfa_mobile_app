import { Platform } from 'react-native';

let ImmersiveMode: any;

try {
  // Lazy require to avoid crashes on iOS or during tests.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ImmersiveMode = require('react-native-immersive-mode').default;
  // Some builds export as module.exports = ImmersiveMode without .default
  if (ImmersiveMode && ImmersiveMode.default) {
    ImmersiveMode = ImmersiveMode.default;
  }
} catch {
  ImmersiveMode = null;
}

export function enableImmersiveMode() {
  if (Platform.OS !== 'android' || !ImmersiveMode) return;
  try {
    ImmersiveMode.fullLayout?.(true);
    // FullSticky keeps the nav bar hidden while allowing swipe-to-reveal.
    ImmersiveMode.setBarMode?.('FullSticky');
    ImmersiveMode.setBarTranslucent?.(true);
  } catch {
    // no-op: immersive mode is optional
  }
}

export function disableImmersiveMode() {
  if (Platform.OS !== 'android' || !ImmersiveMode) return;
  try {
    ImmersiveMode.setBarMode?.('Normal');
    ImmersiveMode.fullLayout?.(false);
    ImmersiveMode.setBarTranslucent?.(false);
  } catch {
    // no-op
  }
}
