
import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { startMetronome } from '@/utils/metronomeUtils';
import { toast } from 'sonner';

type MetronomeContextType = {
  tempo: number;
  metronomeActive: boolean;
  setTempo: (tempo: number) => void;
  toggleMetronome: (isActive: boolean) => void;
  onBeat: (callback: (beat: number) => void) => void;
};

const MetronomeContext = createContext<MetronomeContextType | undefined>(undefined);

export const useMetronome = () => {
  const context = useContext(MetronomeContext);
  if (context === undefined) {
    throw new Error('useMetronome must be used within a MetronomeProvider');
  }
  return context;
};

export const MetronomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tempo, setTempo] = useState<number>(80);
  const [metronomeActive, setMetronomeActive] = useState(false);
  const metronomeRef = useRef<{ stopMetronome: () => void } | null>(null);
  const metronomeAudioContextRef = useRef<AudioContext | null>(null);
  const beatCallbackRef = useRef<(beat: number) => void>(() => {});

  const handleTempoChange = (newTempo: number) => {
    setTempo(newTempo);
    
    if (metronomeActive) {
      // Restart metronome with new tempo
      stopMetronome();
      startMetronomeWithTempo(newTempo);
    }
  };
  
  const toggleMetronome = (isActive: boolean) => {
    setMetronomeActive(isActive);
    
    if (isActive) {
      startMetronomeWithTempo(tempo);
    } else {
      stopMetronome();
    }
  };

  const startMetronomeWithTempo = (bpm: number) => {
    // Create audio context for metronome if it doesn't exist
    if (!metronomeAudioContextRef.current) {
      metronomeAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const metronome = startMetronome(
      metronomeAudioContextRef.current,
      bpm,
      (beat) => {
        beatCallbackRef.current(beat);
      }
    );
    
    metronomeRef.current = metronome;
  };
  
  const stopMetronome = () => {
    if (metronomeRef.current) {
      metronomeRef.current.stopMetronome();
      metronomeRef.current = null;
    }
  };

  const onBeat = useCallback((callback: (beat: number) => void) => {
    beatCallbackRef.current = callback;
  }, []);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      stopMetronome();
      
      // Close metronome audio context
      if (metronomeAudioContextRef.current) {
        metronomeAudioContextRef.current.close();
      }
    };
  }, []);

  const value = {
    tempo,
    metronomeActive,
    setTempo: handleTempoChange,
    toggleMetronome,
    onBeat,
  };

  return (
    <MetronomeContext.Provider value={value}>
      {children}
    </MetronomeContext.Provider>
  );
};
