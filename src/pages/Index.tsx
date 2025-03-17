import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import MusicSheet from '@/components/MusicSheet';
import NoteEditor from '@/components/NoteEditor';
import MicrophoneControl from '@/components/MicrophoneControl';
import SheetManager from '@/components/SheetManager';
import { Note, getDefaultNotes, getBaseNoteName } from '@/utils/musicTheory';
import { 
  AudioContextType, 
  AnalyserNodeType,
  initAudioContext, 
  detectDominantFrequency, 
  detectNote,
} from '@/utils/audioUtils';
import { toast } from 'sonner';

const Index = () => {
  const [notes, setNotes] = useState<Note[]>(getDefaultNotes());
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [signalStrength, setSignalStrength] = useState(0);
  
  const audioContextRef = useRef<{
    audioContext: AudioContextType;
    analyser: AnalyserNodeType;
    start: () => Promise<void>;
    stop: () => void;
  }>(initAudioContext());
  
  const animationFrameRef = useRef<number | null>(null);
  
  const handleAddNote = (newNote: Note) => {
    setNotes(prevNotes => [...prevNotes, newNote]);
  };
  
  const handleClearNotes = () => {
    setNotes([]);
    toast('All notes cleared');
  };

  const handleLoadNotes = (loadedNotes: Note[]) => {
    setNotes(loadedNotes);
  };
  
  const updateActiveNotes = (detectedNoteString: string | null) => {
    const baseNoteName = getBaseNoteName(detectedNoteString);
    const nextNoteIndex = notes.findIndex(note => note.isActive === false);
    const nextNote = notes[nextNoteIndex];
    
    if (baseNoteName && nextNote) {
      console.log("Detected note base name:", baseNoteName);
      console.log("Next note:", nextNote.value);
      if(baseNoteName === nextNote.value) {
        setNotes(prevNotes => {
          prevNotes[nextNoteIndex].isActive = true;
          return prevNotes;
        }
        );
      }
    }
  };
  
  const handleMicrophoneToggle = async (isActive: boolean) => {
    setMicrophoneActive(isActive);

    if (isActive) {
      try {
        setNotes(prevNotes => 
          prevNotes.map(note => ({
            ...note,
            isActive: false
          }))
        );

        await audioContextRef.current.start();

        const processAudio = () => {
          if (!audioContextRef.current.analyser) return;
          
          const frequency = detectDominantFrequency(audioContextRef.current.analyser);
          const currentNote = detectNote(frequency);
          
          const strength = Math.min(100, Math.max(0, frequency / 10));
          setSignalStrength(strength);
          
          setDetectedNote(currentNote);
          updateActiveNotes(currentNote);
          
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
  
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioContextRef.current.stop();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header />
      
      <main className="pt-24 pb-16 px-6 max-w-6xl mx-auto">
        <div className="mb-6 animate-slide-up">
          <h1 className="text-3xl font-semibold mb-2 tracking-tight">Chromatic Sheet Player</h1>
          <p className="text-lg text-muted-foreground">
            Create, save, and play music sheets on your piano
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <MusicSheet 
              notes={notes} 
            />
          </div>
          
          <div className="flex flex-col gap-6">
            <MicrophoneControl 
              onMicrophoneToggle={handleMicrophoneToggle}
              detectedNote={detectedNote}
              signalStrength={signalStrength}
            />
            
            <NoteEditor 
              onAddNote={handleAddNote} 
              onClearNotes={handleClearNotes}
            />
            
            <SheetManager
              notes={notes}
              onLoadNotes={handleLoadNotes}
              onClearNotes={handleClearNotes}
            />
          </div>
        </div>
      </main>
      
      <footer className="py-6 px-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Chromatic. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
