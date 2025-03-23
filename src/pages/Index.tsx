
import React, { useState } from 'react';
import Header from '@/components/Header';
import NoteEditor from '@/components/NoteEditor';
import MicrophoneControl from '@/components/MicrophoneControl';
import SheetManager from '@/components/SheetManager';
import TempoControl from '@/components/TempoControl';
import MusicSheetContainer from '@/components/MusicSheetContainer';
import { Note, getDefaultNotes } from '@/utils/musicTheory';
import { MetronomeProvider, useMetronome } from '@/providers/MetronomeProvider';
import { NoteDetectionProvider, useNoteDetection } from '@/providers/NoteDetectionProvider';
import { toast } from 'sonner';

const Index = () => {
  const [notes, setNotes] = useState<Note[]>(getDefaultNotes());
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [sheetName, setSheetName] = useState<string>("Untitled Sheet");
  
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
  
  const selectedNote = notes.find(note => note.id === selectedNoteId) || null;
  
  // Import calculateNotePosition from musicTheory
  const { calculateNotePosition } = require('@/utils/musicTheory');

  return (
    <MetronomeProvider>
      <NoteDetectionProvider>
        <div className="min-h-screen bg-background overflow-hidden">
          <Header />
          
          <main className="pt-20 pb-16 px-6 max-w-7xl mx-auto">
            <div className="mb-6 animate-slide-up">
              <h1 className="text-3xl font-semibold mb-2 tracking-tight">Chromatic Sheet Player</h1>
              <p className="text-lg text-muted-foreground">
                Create, save, and play music sheets on your piano
              </p>
            </div>
            
            <MusicSheetContainer 
              notes={notes}
              setNotes={setNotes}
              selectedNoteId={selectedNoteId}
              onSelectNote={handleSelectNote}
              sheetName={sheetName}
            />
            
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
                <ControlPanel />
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
      </NoteDetectionProvider>
    </MetronomeProvider>
  );
};

// Control Panel component that combines TempoControl and MicrophoneControl
const ControlPanel = () => {
  const { tempo, metronomeActive, setTempo, toggleMetronome } = useMetronome();
  const { microphoneActive, detectedNote, signalStrength, toggleMicrophone } = useNoteDetection();

  return (
    <div className="flex flex-col gap-6">
      <TempoControl 
        tempo={tempo}
        onTempoChange={setTempo}
        isMetronomeActive={metronomeActive}
        onMetronomeToggle={toggleMetronome}
        isMicrophoneActive={microphoneActive}
      />
      <MicrophoneControl 
        onMicrophoneToggle={toggleMicrophone}
        detectedNote={detectedNote}
        signalStrength={signalStrength}
      />
    </div>
  );
};

export default Index;
