
import React, { useRef, useEffect } from 'react';
import { Note as NoteType } from '@/utils/musicTheory';
import Note from './Note';


interface NotesDisplayProps {
  notes: NoteType[];
  selectedNoteId: string | null;
  onSelectNote: (note: NoteType) => void;
  missedNotes?: string[];
}

const NotesDisplay: React.FC<NotesDisplayProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  missedNotes = []
}) => {
  return (
    <div className="flex items-start pl-16 pr-16 gap-14 mt-6 notes-display">
      {notes.map((note) => (
        <Note 
          key={note.id} 
          note={note}
          isSelected={note.id === selectedNoteId}
          onSelect={onSelectNote}
          isMissed={missedNotes.includes(note.id)}
        />
      ))}
      <div className="p-0.5"></div>
    </div>
  );
};

export default NotesDisplay;
