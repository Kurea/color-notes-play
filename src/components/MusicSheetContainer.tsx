
import React, { useState, useEffect, useRef } from 'react';
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
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [missedNotes, setMissedNotes] = useState<string[]>([]);
  const notesPlayedRef = useRef<boolean>(false);

  // Set up beat callback for metronome
  useEffect(() => {
    onBeat((beat) => {
      // Only check for notes if both metronome and microphone are active
      if (metronomeActive && microphoneActive) {
        setCurrentBeatIndex(prev => prev + 1);
        
        // Get the most frequent note detected during this beat
        const mostFrequentNote = getMostFrequentNote();
        
        if (mostFrequentNote) {
          notesPlayedRef.current = true;
          checkNextNoteMatch(mostFrequentNote);
        } else if (notesPlayedRef.current) {
          // If we've started playing notes but missed this beat
          markMissedNote();
        }
        
        // Clear samples after each beat
        clearSamples();
      }
    });
  }, [metronomeActive, microphoneActive, onBeat, getMostFrequentNote, clearSamples, notes]);

  const checkNextNoteMatch = (detectedNoteString: string | null) => {
    const nextNoteIndex = notes.findIndex(note => note.isActive === false);
    if (nextNoteIndex === -1) return; // All notes are already active
    
    const nextNote = notes[nextNoteIndex];
    const nextNoteString = `${nextNote.value.toUpperCase()}${nextNote.accidental === 'sharp' ? '#' : nextNote.accidental === 'flat' ? 'b' : ''}${nextNote.octave}`;
    
    if (detectedNoteString && nextNoteString) {
      const detectedNotesArray = detectedNoteString.split('/');
      if (detectedNotesArray.includes(nextNoteString)) {
        // Correct note was played - mark it as active
        setNotes(prevNotes => {
          const newNotes = [...prevNotes];
          newNotes[nextNoteIndex].isActive = true;
          return newNotes;
        });
        
        // Remove from missed notes if it was previously missed
        if (missedNotes.includes(nextNote.id)) {
          setMissedNotes(prev => prev.filter(id => id !== nextNote.id));
        }
      }
    }
  };

  const markMissedNote = () => {
    // Find the next note that should have been played
    const nextNoteIndex = notes.findIndex(note => note.isActive === false);
    if (nextNoteIndex === -1) return; // All notes are already active
    
    const nextNote = notes[nextNoteIndex];
    
    // Add the note ID to missed notes if it's not already there
    if (!missedNotes.includes(nextNote.id)) {
      setMissedNotes(prev => [...prev, nextNote.id]);
    }
  };

  // Reset missed notes and other state when notes change
  useEffect(() => {
    setMissedNotes([]);
    setCurrentBeatIndex(0);
    notesPlayedRef.current = false;
  }, [notes]);

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
          missedNotes={missedNotes}
        />
      </div>
    </div>
  );
};

export default MusicSheetContainer;
