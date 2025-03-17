
import React from 'react';
import { PlusCircle } from 'lucide-react';

interface NoteInputProps {
  noteInput: string;
  onNoteInputChange: (value: string) => void;
  onAddNote: () => void;
}

const NoteInput: React.FC<NoteInputProps> = ({
  noteInput,
  onNoteInputChange,
  onAddNote,
}) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={noteInput}
        onChange={(e) => onNoteInputChange(e.target.value)}
        placeholder="Enter note (e.g., C4)"
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onKeyDown={(e) => {
          if (e.key === 'Enter') onAddNote();
        }}
      />
      
      <button
        onClick={onAddNote}
        className="h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
      >
        <PlusCircle className="h-4 w-4" />
        <span className="text-sm">Add</span>
      </button>
    </div>
  );
};

export default NoteInput;
