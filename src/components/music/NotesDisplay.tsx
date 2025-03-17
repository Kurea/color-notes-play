
import React from 'react';
import { Note as NoteType } from '@/utils/musicTheory';
import Note from './Note';

interface NotesDisplayProps {
  notes: NoteType[];
}

const NotesDisplay: React.FC<NotesDisplayProps> = ({ notes }) => {
  return (
    <div className="flex items-start pl-16 pr-16 gap-14 mt-6 notes-display">
      {notes.map((note) => (
        <Note key={note.id} note={note} />
      ))}
      <div className="p-0.5"></div>
    </div>
  );
};

export default NotesDisplay;
