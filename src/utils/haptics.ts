/**
 * Haptic Vibration Feedback Utility for Android & Mobile Devices.
 * Safe fallback on devices/browsers that do not support navigator.vibrate.
 */
export const haptics = {
  // Light tap: used for list clicks, buttons, tabs
  tap: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }
  },

  // Success vibration: used when a book is added or saved
  success: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 40, 20]);
      } catch {
        // ignore
      }
    }
  },

  // Warning vibration: used when deleting or canceling
  warning: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 50, 35]);
      } catch {
        // ignore
      }
    }
  },

  // Sound mode switch
  modeSwitch: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // ignore
      }
    }
  }
};
