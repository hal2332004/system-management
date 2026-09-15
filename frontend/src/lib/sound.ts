/**
 * Tiện ích quản lý âm thanh thông báo và tổng hợp âm thanh bằng Web Audio API
 */

const NOTIFICATION_SOUND_KEY = 'tourflow_notification_sound_enabled';

export function isNotificationSoundEnabled(): boolean {
  const stored = localStorage.getItem(NOTIFICATION_SOUND_KEY);
  // Mặc định là BẬT (true)
  return stored === null ? true : stored === 'true';
}

export function setNotificationSoundEnabled(enabled: boolean): void {
  localStorage.setItem(NOTIFICATION_SOUND_KEY, String(enabled));
  window.dispatchEvent(
    new CustomEvent('tourflow_sound_setting_changed', { detail: enabled })
  );
}

/**
 * Phát âm thanh chuông 2 nốt cao cấp (Chime: D5 -> A5)
 * @param force Phát âm thanh ngay cả khi đang tắt (dùng cho nút Nghe thử)
 */
export function playNotificationSound(force = false): void {
  if (!force && !isNotificationSoundEnabled()) return;

  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Nốt 1: D5 (587.33 Hz) - Trong trẻo
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.32, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Nốt 2: A5 (880.00 Hz) - Âm vang thanh thoát
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.11);
    gain2.gain.setValueAtTime(0, now + 0.11);
    gain2.gain.linearRampToValueAtTime(0.38, now + 0.13);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.11);
    osc2.stop(now + 0.85);
  } catch (err) {
    console.warn('Không thể phát âm thanh thông báo:', err);
  }
}
