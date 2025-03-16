
import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import MusicSheet from '@/components/MusicSheet';
import NoteEditor from '@/components/NoteEditor';
import MicrophoneControl from '@/components/MicrophoneControl';
import { Note, getDefaultNotes } from '@/utils/musicTheory';
import { 
  AudioContextType, 
  AnalyserNodeType,
  initAudioContext, 
  detectDominantFrequency, 
  detectNote,
  getSimpleNoteName
} from '@/utils/audioUtils';
import { toast } from 'sonner';

const Index = () => {
  const [notes, setNotes] = useState<Note[]>(getDefaultNotes());
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [signalStrength, setSignalStrength] = useState(0);
  
  // Refs for audio context and analyzer
  const audioContextRef = useRef<{
    audioContext: AudioContextType;
    analyser: AnalyserNodeType;
    start: () => Promise<void>;
    stop: () => void;
  }>(initAudioContext());
  
  // Animation frame reference for the audio processing loop
  const animationFrameRef = useRef<number | null>(null);
  
  // Add a new note to the sheet
  const handleAddNote = (newNote: Note) => {
    setNotes(prevNotes => [...prevNotes, newNote]);
  };
  
  // Clear all notes from the sheet
  const handleClearNotes = () => {
    setNotes([]);
    toast('All notes cleared');
  };
  
  // Update active notes based on microphone input
  const updateActiveNotes = (detectedSimpleNote: string | null) => {
    setNotes(prevNotes => 
      prevNotes.map(note => ({
        ...note,
        isActive: note.value === detectedSimpleNote
      }))
    );
  };
  
  // Toggle microphone
  const handleMicrophoneToggle = async (isActive: boolean) => {
    setMicrophoneActive(isActive);
    
    if (isActive) {
      try {
        // Start audio processing
        await audioContextRef.current.start();
        
        // Start audio processing loop
        const processAudio = () => {
          if (!audioContextRef.current.analyser) return;
          
          // Detect frequency and corresponding note
          const frequency = detectDominantFrequency(audioContextRef.current.analyser);
          const currentNote = detectNote(frequency);
          const simpleNote = getSimpleNoteName(currentNote);
          
          // Calculate signal strength from frequency (0-100)
          const strength = Math.min(100, Math.max(0, frequency / 10));
          setSignalStrength(strength);
          
          // Update detected note and active notes
          setDetectedNote(currentNote);
          updateActiveNotes(simpleNote);
          
          // Continue the loop
          animationFrameRef.current = requestAnimationFrame(processAudio);
        };
        
        // Start the processing loop
        animationFrameRef.current = requestAnimationFrame(processAudio);
      } catch (error) {
        console.error('Error starting audio processing:', error);
        setMicrophoneActive(false);
        toast.error('Failed to start audio processing');
      }
    } else {
      // Stop the processing loop
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Stop audio context
      audioContextRef.current.stop();
      
      // Reset state
      setDetectedNote(null);
      setSignalStrength(0);
      
      // Reset active notes
      setNotes(prevNotes => 
        prevNotes.map(note => ({
          ...note,
          isActive: false
        }))
      );
    }
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

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header />
      
      <main className="pt-24 pb-16 px-6 max-w-6xl mx-auto">
        <div className="mb-6 animate-slide-up">
          <h1 className="text-3xl font-semibold mb-2 tracking-tight">Chromatic Sheet Player</h1>
          <p className="text-lg text-muted-foreground">
            Create simple music sheets and play them on your piano
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <MusicSheet 
              notes={notes} 
              activeNote={getSimpleNoteName(detectedNote)}
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
