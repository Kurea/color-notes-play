
import React, { useState } from 'react';
import { PlusCircle, Trash2, Music2, ArrowLeftRight } from 'lucide-react';
import { Note, createNote, parseNoteString } from '@/utils/musicTheory';
import { toast } from 'sonner';

interface NoteEditorProps {
  onAddNote: (note: Note) => void;
  onClearNotes: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ onAddNote, onClearNotes }) => {
  const [noteInput, setNoteInput] = useState('');
  const [duration, setDuration] = useState<Note['duration']>('quarter');
  
  const durations: Array<[Note['duration'], string]> = [
    ['whole', 'Whole'],
    ['half', 'Half'],
    ['quarter', 'Quarter'],
    ['eighth', 'Eighth'],
    ['sixteenth', 'Sixteenth'],
  ];

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
      
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          placeholder="Enter note (e.g., C4)"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddNote();
          }}
        />
        
        <button
          onClick={handleAddNote}
          className="h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="text-sm">Add</span>
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {durations.map(([value, label]) => (
          <button
            key={value}
            onClick={() => setDuration(value)}
            className={`text-xs py-1 px-2 rounded-md transition-colors ${
              duration === value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {label}
          </button>
        ))}
        
        <button
          onClick={onClearNotes}
          className="col-span-3 flex items-center justify-center gap-1.5 mt-2 text-xs text-destructive hover:text-destructive/80 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear all notes</span>
        </button>
      </div>
    </div>
  );
};

export default NoteEditor;
