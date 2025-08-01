/**
 * Audio utilities for note detection
 */

export type AudioContextType = AudioContext | null;
export type AnalyserNodeType = AnalyserNode | null;

// Frequency mapping for notes (A4 = 440Hz)
const NOTE_FREQUENCIES: Record<string, number> = {
  'C3': 130.81,
  'C#3/Db3': 138.59,
  'D3': 146.83,
  'D#3/Eb3': 155.56,
  'E3': 164.81,
  'F3': 174.61,
  'F#3/Gb3': 185.00,
  'G3': 196.00,
  'G#3/Ab3': 207.65,
  'A3': 220.00,
  'A#3/Bb3': 233.08,
  'B3': 246.94,
  'C4': 261.63,
  'C#4/Db4': 277.18,
  'D4': 293.66,
  'D#4/Eb4': 311.13,
  'E4': 329.63,
  'F4': 349.23,
  'F#4/Gb4': 369.99,
  'G4': 392.00,
  'G#4/Ab4': 415.30,
  'A4': 440.00,
  'A#4/Bb4': 466.16,
  'B4': 493.88,
  'C5': 523.25,
  'C#5/Db5': 554.37,
  'D5': 587.33,
  'D#5/Eb5': 622.25,
  'E5': 659.25,
  'F5': 698.46,
  'F#5/Gb5': 739.99,
  'G5': 783.99,
  'G#5/Ab5': 830.61,
  'A5': 880.00,
  'A#5/Bb5': 932.33,
  'B5': 987.77,
  'C6': 1046.50,
};

// Object to store samples for note detection on beat
type AudioSample = {
  frequency: number;
  note: string | null;
};

// Initialize audio context and analyzer
export const initAudioContext = () => {
  let audioContext: AudioContextType = null;
  let analyser: AnalyserNodeType = null;
  let mediaStream: MediaStream | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let sampleBuffer: AudioSample[] = [];
  
  const start = async (): Promise<void> => {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      
      // Request microphone access
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(analyser);

      console.log("Microphone connected successfully");
    } catch (error) {
      console.error("Error initializing audio:", error);
      throw error;
    }
  };

  const stop = (): void => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    
    if (source) {
      source.disconnect();
      source = null;
    }
    
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    
    analyser = null;
    sampleBuffer = [];
  };
  
  // Store a sample for beat detection
  const addSample = (frequency: number, note: string | null): void => {
    sampleBuffer.push({ frequency, note });
    // Keep only the last 4 samples
    if (sampleBuffer.length > 4) {
      sampleBuffer.shift();
    }
  };
  
  // Get the most frequent note from the buffer (for beat detection)
  const getMostFrequentNote = (): string | null => {
    if (sampleBuffer.length === 0) return null;
    
    // Count notes
    const noteCounts: Record<string, number> = {};
    
    sampleBuffer.forEach(sample => {
      if (sample.note) {
        noteCounts[sample.note] = (noteCounts[sample.note] || 0) + 1;
      }
    });
    
    // Find the most frequent note
    let mostFrequentNote: string | null = null;
    let highestCount = 0;
    
    Object.entries(noteCounts).forEach(([note, count]) => {
      if (count > highestCount) {
        mostFrequentNote = note;
        highestCount = count;
      }
    });
    
    // Only return if the note appears in at least 2 samples
    return highestCount >= 2 ? mostFrequentNote : null;
  };
  
  // Clear the buffer
  const clearSamples = (): void => {
    sampleBuffer = [];
  };

  return {
    get audioContext() {
      return audioContext;
    },
    get analyser() {
      return analyser;
    },
    start,
    stop,
    addSample,
    getMostFrequentNote,
    clearSamples
  };
};

// Detect the dominant frequency from audio data
export const detectDominantFrequency = (analyser: AnalyserNodeType): number => {
  if (!analyser) return 0;
  
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  
  // Find the maximum frequency
  let maxValue = 0;
  let maxIndex = 0;
  
  for (let i = 0; i < bufferLength; i++) {
    if (dataArray[i] > maxValue) {
      maxValue = dataArray[i];
      maxIndex = i;
    }
  }
  
  // Only return if the signal is strong enough
  if (maxValue < 100) return 0; // Lower threshold to increase sensitivity
  
  const nyquist = (analyser.context as AudioContext).sampleRate / 2;
  const frequency = maxIndex * nyquist / bufferLength;
  
  return frequency;
};

// Detect the note from a frequency
export const detectNote = (frequency: number): string | null => {
  if (frequency <= 0) return null;
  
  let closestNote = null;
  let minDifference = Infinity;
  
  // Find the closest note frequency
  for (const [note, noteFreq] of Object.entries(NOTE_FREQUENCIES)) {
    const difference = Math.abs(frequency - noteFreq);
    
    if (difference < minDifference) {
      minDifference = difference;
      closestNote = note;
    }
  }
  
  // Increase the tolerance for piano detection
  if (minDifference > 15) return null;
  
  return closestNote;
};

// Get the simple note name (C, D, E, etc.) from a full note name (C4, D#3, etc.)
export const getSimpleNoteName = (note: string | null): string | null => {
  if (!note) return null;
  return note.charAt(0).toLowerCase();
};
