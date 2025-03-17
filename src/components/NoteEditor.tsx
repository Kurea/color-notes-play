
import React, { useState } from 'react';
import { Music2 } from 'lucide-react';
import { Note, createNote, parseNoteString } from '@/utils/musicTheory';
import { toast } from 'sonner';
import NoteInput from './music/NoteInput';
import DurationSelector from './music/DurationSelector';
import ClearNotesButton from './music/ClearNotesButton';

interface NoteEditorProps {
  onAddNote: (note: Note) => void;
  onClearNotes: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ onAddNote, onClearNotes }) => {
  const [noteInput, setNoteInput] = useState('');
  const [duration, setDuration] = useState<Note['duration']>('quarter');
  
  const handleAddNote = () => {
    if (!noteInput.trim()) {
      toast.error('Please enter a note (e.g., C4)');
      return;
    }
    
    try {
      const { value, octave, accidental } = parseNoteString(noteInput);
      const newNote = createNote(value, octave, duration, 'treble', accidental);
      onAddNote(newNote);
      toast.success(`Added ${noteInput} note`);
      setNoteInput('');
    } catch (error) {
      toast.error('Invalid note format. Use format like C4, D#4, Eb5, etc.');
    }
  };

  return (
    <div className="glass p-4 rounded-lg flex flex-col gap-4 animate-scale-in">
      <h3 className="text-sm font-medium flex items-center gap-1.5">
        <Music2 className="h-4 w-4" />
        <span>Note Editor</span>
      </h3>
      
      <NoteInput
        noteInput={noteInput}
        onNoteInputChange={setNoteInput}
        onAddNote={handleAddNote}
      />
      
      <DurationSelector
        selectedDuration={duration}
        onDurationChange={setDuration}
      />
      
      <ClearNotesButton onClearNotes={onClearNotes} />
    </div>
  );
};

export default NoteEditor;
