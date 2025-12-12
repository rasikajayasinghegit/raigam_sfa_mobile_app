import { Platform } from 'react-native';

let ImmersiveMode: any;

try {
  // Lazy require to avoid crashes on iOS or during tests
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ImmersiveMode = require('react-native-immersive-mode').default;
  if (ImmersiveMode && ImmersiveMode.default) {
    ImmersiveMode = ImmersiveMode.default;
  }
} catch {
  ImmersiveMode = null;
}

/**
 * 🟢 Regular Fullscreen UI (Recommended)
 * BarMode: FullSticky
 * Translucent: true
 * fullLayout: true
 * Swipe Reveal: Yes
 */
export function enableImmersiveMode() {
  if (Platform.OS !== 'android' || !ImmersiveMode) return;

  try {
    // Allow layout under status and navigation bars
    ImmersiveMode.fullLayout?.(true);

    // Hide system bars but allow swipe-to-reveal
    ImmersiveMode.setBarMode?.('FullSticky');

    // Enable translucent system bars for glass-like effect
    ImmersiveMode.setBarTranslucent?.(true);

    console.log('✅ Immersive mode enabled: FullSticky + translucent');
  } catch (e) {
    console.warn('⚠️ Failed to enable immersive mode:', e);
  }
}

/**
 * 🔵 Restore normal system UI
 */
export function disableImmersiveMode() {
  if (Platform.OS !== 'android' || !ImmersiveMode) return;

  try {
    ImmersiveMode.setBarMode?.('Normal');
    ImmersiveMode.fullLayout?.(false);
    ImmersiveMode.setBarTranslucent?.(false);

    console.log('🔄 Immersive mode disabled');
  } catch (e) {
    console.warn('⚠️ Failed to disable immersive mode:', e);
  }
}
