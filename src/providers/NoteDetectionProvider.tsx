
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  AudioContextType, 
  AnalyserNodeType,
  initAudioContext, 
  detectDominantFrequency, 
  detectNote,
} from '@/utils/audioUtils';

type NoteDetectionContextType = {
  microphoneActive: boolean;
  detectedNote: string | null;
  signalStrength: number;
  toggleMicrophone: (isActive: boolean) => Promise<void>;
  getMostFrequentNote: () => string | null;
  clearSamples: () => void;
};

const NoteDetectionContext = createContext<NoteDetectionContextType | undefined>(undefined);

export const useNoteDetection = () => {
  const context = useContext(NoteDetectionContext);
  if (context === undefined) {
    throw new Error('useNoteDetection must be used within a NoteDetectionProvider');
  }
  return context;
};

export const NoteDetectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [signalStrength, setSignalStrength] = useState(0);
  
  const audioContextRef = useRef<{
    audioContext: AudioContextType;
    analyser: AnalyserNodeType;
    start: () => Promise<void>;
    stop: () => void;
    addSample: (frequency: number, note: string | null) => void;
    getMostFrequentNote: () => string | null;
    clearSamples: () => void;
  }>(initAudioContext());
  
  const animationFrameRef = useRef<number | null>(null);

  const toggleMicrophone = async (isActive: boolean) => {
    setMicrophoneActive(isActive);

    if (isActive) {
      try {
        await audioContextRef.current.start();

        const processAudio = () => {
          if (!audioContextRef.current.analyser) return;
          
          const frequency = detectDominantFrequency(audioContextRef.current.analyser);
          const currentNote = detectNote(frequency);
          
          const strength = Math.min(100, Math.max(0, frequency / 10));
          setSignalStrength(strength);
          
          setDetectedNote(currentNote);
          
          // Add current sample to the buffer for beat detection
          audioContextRef.current.addSample(frequency, currentNote);
          
          animationFrameRef.current = requestAnimationFrame(processAudio);
        };

        animationFrameRef.current = requestAnimationFrame(processAudio);
      } catch (error) {
        console.error('Error starting audio processing:', error);
        setMicrophoneActive(false);
        toast.error('Failed to start audio processing');
      }
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      audioContextRef.current.stop();
      
      setDetectedNote(null);
      setSignalStrength(0);
    }
  };

  const getMostFrequentNote = () => {
    return audioContextRef.current.getMostFrequentNote();
  };

  const clearSamples = () => {
    audioContextRef.current.clearSamples();
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioContextRef.current.stop();
    };
  }, []);

  const value = {
    microphoneActive,
    detectedNote,
    signalStrength,
    toggleMicrophone,
    getMostFrequentNote,
    clearSamples,
  };

  return (
    <NoteDetectionContext.Provider value={value}>
      {children}
    </NoteDetectionContext.Provider>
  );
};
