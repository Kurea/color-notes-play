
import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import MusicSheet from '@/components/MusicSheet';
import NoteEditor from '@/components/NoteEditor';
import MicrophoneControl from '@/components/MicrophoneControl';
import SheetManager from '@/components/SheetManager';
import TempoControl from '@/components/TempoControl';
import { Note, getDefaultNotes, getBaseNoteName, calculateNotePosition } from '@/utils/musicTheory';
import { 
  AudioContextType, 
  AnalyserNodeType,
  initAudioContext, 
  detectDominantFrequency, 
  detectNote,
} from '@/utils/audioUtils';
import { startMetronome } from '@/utils/metronomeUtils';
import { toast } from 'sonner';
import { FileMusic, Headphones } from 'lucide-react';

const Index = () => {
  const [notes, setNotes] = useState<Note[]>(getDefaultNotes());
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [signalStrength, setSignalStrength] = useState(0);
  const [sheetName, setSheetName] = useState<string>("Untitled Sheet");
  
  // Tempo control state
  const [tempo, setTempo] = useState<number>(80); // Default 80 BPM
  const [metronomeActive, setMetronomeActive] = useState(false);
  const metronomeRef = useRef<{ stopMetronome: () => void } | null>(null);
  
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
  
  const handleAddNote = (newNote: Note) => {
    setNotes(prevNotes => [...prevNotes, newNote]);
    setSelectedNoteId(null);
  };
  
  const handleUpdateNote = (id: string, updatedFields: Partial<Note>) => {
    // If empty id is provided, it means cancel editing
    if (!id) {
      setSelectedNoteId(null);
      return;
    }
    
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id 
          ? {
              ...note,
              ...updatedFields,
              // Recalculate position if value or octave changed
              position: updatedFields.value || updatedFields.octave 
                ? calculateNotePosition(updatedFields.value || note.value, updatedFields.octave || note.octave, 'treble')
                : note.position
            }
          : note
      )
    );
    setSelectedNoteId(null);
  };
  
  const handleDeleteNote = (id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    setSelectedNoteId(null);
  };
  
  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(prevId => prevId === note.id ? null : note.id);
  };
  
  const handleClearNotes = () => {
    setNotes([]);
    setSelectedNoteId(null);
    toast('All notes cleared');
  };

  const handleLoadNotes = (loadedNotes: Note[], title?: string) => {
    setNotes(loadedNotes);
    setSelectedNoteId(null);
    if (title) {
      setSheetName(title);
    }
  };

  const handleNewTitle = (title: string) => {
    setSheetName(title || 'Untitled Sheet');
  };
  
  const handleTempoChange = (newTempo: number) => {
    setTempo(newTempo);
    
    if (metronomeActive) {
      // Restart metronome with new tempo
      stopMetronome();
      startMetronomeWithTempo(newTempo);
    }
  };
  
  const handleMetronomeToggle = (isActive: boolean) => {
    setMetronomeActive(isActive);
    
    if (isActive) {
      startMetronomeWithTempo(tempo);
    } else {
      stopMetronome();
    }
  };
  
  const startMetronomeWithTempo = (bpm: number) => {
    if (!audioContextRef.current.audioContext) return;
    
    const metronome = startMetronome(
      audioContextRef.current.audioContext,
      bpm,
      (beat) => {
        // On each beat, check the most frequent note from the buffer
        const mostFrequentNote = audioContextRef.current.getMostFrequentNote();
        
        if (mostFrequentNote) {
          checkNextNoteMatch(mostFrequentNote);
        }
        
        // Clear samples after each beat
        audioContextRef.current.clearSamples();
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
  
  const selectedNote = notes.find(note => note.id === selectedNoteId) || null;
  
  const checkNextNoteMatch = (detectedNoteString: string | null) => {
    const nextNoteIndex = notes.findIndex(note => note.isActive === false);
    if (nextNoteIndex === -1) return; // All notes are already active
    
    const nextNote = notes[nextNoteIndex];
    const nextNoteString = `${nextNote.value.toUpperCase()}${nextNote.accidental === 'sharp' ? '#' : nextNote.accidental === 'flat' ? 'b' : ''}${nextNote.octave}`;
    
    if (detectedNoteString && nextNoteString) {
      const detectedNotesArray = detectedNoteString.split('/');
      if (detectedNotesArray.includes(nextNoteString)) {
        setNotes(prevNotes => {
          const newNotes = [...prevNotes];
          newNotes[nextNoteIndex].isActive = true;
          return newNotes;
        });
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
          
          // Add current sample to the buffer for beat detection
          audioContextRef.current.addSample(frequency, currentNote);
          
          // Only update active notes directly if metronome is off
          if (!metronomeActive) {
            checkNextNoteMatch(currentNote);
          }
          
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
      
      stopMetronome();
      setMetronomeActive(false);
      
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
      stopMetronome();
      audioContextRef.current.stop();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header />
      
      <main className="pt-20 pb-16 px-6 max-w-7xl mx-auto">
        <div className="mb-6 animate-slide-up">
          <h1 className="text-3xl font-semibold mb-2 tracking-tight">Chromatic Sheet Player</h1>
          <p className="text-lg text-muted-foreground">
            Create, save, and play music sheets on your piano
          </p>
        </div>
        
        {/* Sheet section with name and listener info */}
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileMusic className="h-5 w-5 text-primary" />
              <h2 className="text-3xl font-medium">{sheetName}</h2>
            </div>
            <div className="flex items-center gap-2 ">
              <MicrophoneControl 
                onMicrophoneToggle={handleMicrophoneToggle}
                detectedNote={detectedNote}
                signalStrength={signalStrength}
              />
            </div>
          </div>
          
          {/* Enlarged music sheet */}
          <div className="w-full">
            <MusicSheet 
              notes={notes}
              selectedNoteId={selectedNoteId}
              onSelectNote={handleSelectNote}
            />
          </div>
        </div>
        
        {/* Controls section below the sheet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-1">
            <NoteEditor 
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onClearNotes={handleClearNotes}
              selectedNote={selectedNote}
            />
          </div>
          <div className="md:col-span-1">
            <TempoControl
              tempo={tempo}
              onTempoChange={handleTempoChange}
              isMetronomeActive={metronomeActive}
              onMetronomeToggle={handleMetronomeToggle}
              isMicrophoneActive={microphoneActive}
            />
          </div>          
          <div className="md:col-span-1">
            <SheetManager
              notes={notes}
              onLoadNotes={handleLoadNotes}
              onNewTitle={handleNewTitle}
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
