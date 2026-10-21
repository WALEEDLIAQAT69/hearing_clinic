/**
 * Audio Chime and Browser / Mobile Notification Service
 * Supports Web Notifications API and Web Audio API synthesized alert sound
 */

// Synthesized pleasant medical chime using Web Audio API (no external MP3 required)
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1 (High tone, D5 ~ 587.3 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Tone 2 (Higher tone, A5 ~ 880 Hz, slightly delayed for classic chime)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    gain2.gain.setValueAtTime(0.25, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.7);
  } catch (e) {
    console.warn('Audio chime playback failed:', e);
  }
}

/**
 * Check if the browser / mobile phone supports system push notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current notification permission
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch (e) {
    console.error('Failed to request notification permission:', e);
    return false;
  }
}

/**
 * Trigger phone/desktop push notification with vibration & sound
 */
export function triggerPhoneNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): boolean {
  // Always play the audible chime
  playNotificationChime();

  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    // If running with service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'hearing-clinic-appointment',
          data,
          // Mobile vibration pattern: vibrate 200ms, pause 100ms, vibrate 200ms
          // @ts-expect-error vibration pattern in NotificationOptions
          vibrate: [200, 100, 200],
        });
      });
      return true;
    }

    // Direct Notification fallback
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'hearing-clinic-appointment',
      data,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (e) {
    console.error('Error triggering notification:', e);
    return false;
  }
}
