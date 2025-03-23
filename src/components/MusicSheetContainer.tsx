
import React, { useState, useEffect } from 'react';
import MusicSheet from '@/components/MusicSheet';
import { Note } from '@/utils/musicTheory';
import { useMetronome } from '@/providers/MetronomeProvider';
import { useNoteDetection } from '@/providers/NoteDetectionProvider';
import { FileMusic } from 'lucide-react';

interface MusicSheetContainerProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  selectedNoteId: string | null;
  onSelectNote: (note: Note) => void;
  sheetName: string;
}

const MusicSheetContainer: React.FC<MusicSheetContainerProps> = ({
  notes,
  setNotes,
  selectedNoteId,
  onSelectNote,
  sheetName,
}) => {
  const { metronomeActive, onBeat } = useMetronome();
  const { microphoneActive, getMostFrequentNote, clearSamples } = useNoteDetection();

  // Set up beat callback for metronome
  useEffect(() => {
    onBeat((beat) => {
      // Only use samples from microphone if it's active
      if (microphoneActive) {
        // On each beat, check the most frequent note from the buffer
        const mostFrequentNote = getMostFrequentNote();
        
        if (mostFrequentNote) {
          checkNextNoteMatch(mostFrequentNote);
        }
        
        // Clear samples after each beat
        clearSamples();
      }
    });
  }, [microphoneActive, onBeat, getMostFrequentNote, clearSamples]);

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

  return (
    <div className="flex flex-col gap-6 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileMusic className="h-5 w-5 text-primary" />
          <h2 className="text-3xl font-medium">{sheetName}</h2>
        </div>
      </div>
      
      <div className="w-full">
        <MusicSheet 
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={onSelectNote}
        />
      </div>
    </div>
  );
};

export default MusicSheetContainer;
