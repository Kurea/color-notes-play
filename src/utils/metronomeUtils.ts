
/**
 * Metronome utilities for timing and tempo
 */

// Create an audio context for metronome sounds
export const createMetronomeSound = (audioContext: AudioContext): OscillatorNode => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.value = 800; // higher frequency for accent beat
  gainNode.gain.value = 0.5;
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  return oscillator;
};

// Start the metronome with given tempo (BPM)
export const startMetronome = (
  audioContext: AudioContext,
  tempo: number,
  onBeat: (beat: number) => void
): { stopMetronome: () => void } => {
  if (!audioContext) return { stopMetronome: () => {} };
  
  let beatCount = 0;
  let intervalId: number | null = null;
  
  // Calculate beat interval in milliseconds
  const beatInterval = 60000 / tempo; // Convert BPM to milliseconds
  
  // Function to play a single beat
  const playBeat = () => {
    const oscillator = createMetronomeSound(audioContext);
    const currentTime = audioContext.currentTime;
    
    // Make first beat of each measure slightly louder
    if (beatCount % 4 === 0) {
      oscillator.frequency.value = 1000; // Higher pitch for first beat
    } else {
      oscillator.frequency.value = 800;
    }
    
    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.1); // Short duration tick
    
    // Call the beat callback
    onBeat(beatCount);
    
    beatCount = (beatCount + 1) % 4; // 4 beats per measure
  };
  
  // Start the interval
  intervalId = window.setInterval(playBeat, beatInterval);
  
  // Return a function to stop the metronome
  return {
    stopMetronome: () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    }
  };
};
