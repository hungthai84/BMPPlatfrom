import { UIConfig } from './types';

export function playClickSound(config: UIConfig['sound']) {
  if (!config.enabled) return;

  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    
    // Tactile Switch Specs: 950Hz to 1400Hz
    oscillator.frequency.setValueAtTime(950, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.04);

    // Gain Specs: 0.06 to 0.001
    gainNode.gain.setValueAtTime(config.volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.04);
  } catch (error) {
    console.error('Audio feedback failed:', error);
  }
}
