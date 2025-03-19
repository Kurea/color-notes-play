
import React, { useState, useEffect } from 'react';
import { Music2, Trash2 } from 'lucide-react';
import { Note, createNote, parseNoteString } from '@/utils/musicTheory';
import { toast } from 'sonner';
import NoteInput from './music/NoteInput';
import DurationSelector from './music/DurationSelector';
import ClearNotesButton from './music/ClearNotesButton';
import { Button } from './ui/button';

interface NoteEditorProps {
  onAddNote: (note: Note) => void;
  onUpdateNote: (id: string, note: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  onClearNotes: () => void;
  selectedNote: Note | null;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ 
  onAddNote, 
  onUpdateNote,
  onDeleteNote,
  onClearNotes,
  selectedNote 
}) => {
  const [noteInput, setNoteInput] = useState('');
  const [duration, setDuration] = useState<Note['duration']>('quarter');
  
  // Update input when selected note changes
  useEffect(() => {
    if (selectedNote) {
      const noteString = `${selectedNote.value.toUpperCase()}${selectedNote.octave}${selectedNote.accidental === 'sharp' ? '#' : selectedNote.accidental === 'flat' ? 'b' : ''}`;
      setNoteInput(noteString);
      setDuration(selectedNote.duration);
    }
  }, [selectedNote]);

  const handleAddNote = () => {
    if (!noteInput.trim()) {
      toast.error('Please enter a note (e.g., C4)');
      return;
    }
    
    try {
      const { value, octave, accidental } = parseNoteString(noteInput);
      
      if (selectedNote) {
        // Update existing note
        onUpdateNote(selectedNote.id, {
          value,
          octave,
          duration,
          accidental
        });
        toast.success(`Updated note to ${noteInput}`);
      } else {
        // Add new note
        const newNote = createNote(value, octave, duration, 'treble', accidental);
        onAddNote(newNote);
        toast.success(`Added ${noteInput} note`);
      }
      
      setNoteInput('');
      setDuration('quarter');
    } catch (error) {
      toast.error('Invalid note format. Use format like C4, D#4, Eb5, etc.');
    }
  };

  const handleDeleteNote = () => {
    if (selectedNote) {
      onDeleteNote(selectedNote.id);
      toast.success('Note deleted');
      setNoteInput('');
      setDuration('quarter');
    }
  };

  const isEditing = !!selectedNote;

  return (
    <div className="glass p-4 rounded-lg flex flex-col gap-4 animate-scale-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5">
          <Music2 className="h-4 w-4" />
          <span>{isEditing ? 'Edit Note' : 'Note Editor'}</span>
        </h3>
        {isEditing && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDeleteNote}
            className="h-7 px-2"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Note
          </Button>
        )}
      </div>
      
      <NoteInput
        noteInput={noteInput}
        onNoteInputChange={setNoteInput}
        onAddNote={handleAddNote}
      />
      
      <DurationSelector
        selectedDuration={duration}
        onDurationChange={setDuration}
      />
      
      <div className="flex gap-2">
        <Button 
          onClick={handleAddNote} 
          className="w-full"
        >
          {isEditing ? 'Update Note' : 'Add Note'}
        </Button>
        
        {isEditing && (
          <Button 
            variant="outline" 
            onClick={() => {
              setNoteInput('');
              setDuration('quarter');
              // This will be handled in the Index component
              onUpdateNote('', {});
            }}
          >
            Cancel
          </Button>
        )}
      </div>
      
      <ClearNotesButton onClearNotes={onClearNotes} />
    </div>
  );
};

export default NoteEditor;
