/**
 * Court Hearing Audio Alarm & Web Notification Engine
 * Uses the HTML5 Web Audio API to synthesize a clean, resonant court bell chime
 * without requiring any external mp3 files or network downloads.
 */

export const playHearingChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // If context is suspended (browser autoplay policy), resume it
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Harmonic bell chime tones: D5 (587.33Hz), A5 (880Hz), and high D6 (1174.66Hz)
    const tones = [
      { freq: 587.33, start: 0, duration: 0.9, gain: 0.28 },
      { freq: 880.00, start: 0.12, duration: 1.2, gain: 0.24 },
      { freq: 1174.66, start: 0.28, duration: 1.6, gain: 0.20 }
    ];

    tones.forEach(({ freq, start, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(gain, now + start);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration);
    });
  } catch (err) {
    console.warn('[AudioAlarm] Web Audio API error:', err);
  }
};

/**
 * Double-pulse urgent hearing alert ring
 */
export const playUrgentAlarm = () => {
  playHearingChime();
  setTimeout(() => {
    playHearingChime();
  }, 750);
};

/**
 * Request Native Browser Push Notification Permission
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return 'denied';
  }
};

/**
 * Trigger a Desktop System Notification
 */
export const triggerDesktopAlert = (title, body) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'hearing-reminder'
      });
    } catch (e) {
      console.warn('[Notification] Failed to show desktop alert:', e);
    }
  }
};
