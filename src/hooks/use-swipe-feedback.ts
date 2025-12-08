import { useCallback, useRef } from 'react';

// Sound URLs (using base64 for reliability)
const SWIPE_SOUND_RIGHT = 'data:audio/wav;base64,UklGRl9vT19teleZWF2ZVlhdmVGb3JtYXRQQ00gIBAAAQACAAAAQBcAAEAXAAACAAQAZGF0YVRvAA==';
const SWIPE_SOUND_LEFT = 'data:audio/wav;base64,UklGRl9vT19teleZWF2ZVlhdmVGb3JtYXRQQ00gIBAAAQACAAAAQBcAAEAXAAACAAQAZGF0YVRvAA==';
const MATCH_SOUND = 'data:audio/wav;base64,UklGRl9vT19teleZWF2ZVlhdmVGb3JtYXRQQ00gIBAAAQACAAAAQBcAAEAXAAACAAQAZGF0YVRvAA==';

export const useSwipeFeedback = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on first interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Generate a simple beep sound
  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    try {
      const ctx = initAudio();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [initAudio]);

  // Haptic feedback
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Right swipe feedback (positive)
  const triggerRightSwipe = useCallback(() => {
    // Haptic: short double pulse
    vibrate([30, 50, 30]);
    
    // Sound: ascending happy tone
    playTone(440, 0.1, 'sine'); // A4
    setTimeout(() => playTone(554, 0.1, 'sine'), 80); // C#5
    setTimeout(() => playTone(659, 0.15, 'sine'), 160); // E5
  }, [vibrate, playTone]);

  // Left swipe feedback (neutral)
  const triggerLeftSwipe = useCallback(() => {
    // Haptic: single short pulse
    vibrate(20);
    
    // Sound: quick low swoosh
    playTone(200, 0.08, 'triangle');
  }, [vibrate, playTone]);

  // Match celebration feedback
  const triggerMatch = useCallback(() => {
    // Haptic: celebration pattern
    vibrate([50, 100, 50, 100, 100]);
    
    // Sound: fanfare
    playTone(523, 0.15, 'sine'); // C5
    setTimeout(() => playTone(659, 0.15, 'sine'), 150); // E5
    setTimeout(() => playTone(784, 0.15, 'sine'), 300); // G5
    setTimeout(() => playTone(1047, 0.3, 'sine'), 450); // C6
  }, [vibrate, playTone]);

  // Drag feedback (subtle)
  const triggerDragStart = useCallback(() => {
    vibrate(10);
  }, [vibrate]);

  return {
    triggerRightSwipe,
    triggerLeftSwipe,
    triggerMatch,
    triggerDragStart,
  };
};
