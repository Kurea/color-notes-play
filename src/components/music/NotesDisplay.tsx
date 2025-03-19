
import React, { useRef, useEffect } from 'react';
import { Note as NoteType } from '@/utils/musicTheory';
import Note from './Note';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotesDisplayProps {
  notes: NoteType[];
  selectedNoteId: string | null;
  onSelectNote: (note: NoteType) => void;
}

const NotesDisplay: React.FC<NotesDisplayProps> = ({ notes, selectedNoteId, onSelectNote }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the end when notes are added
  useEffect(() => {
    if (containerRef.current && scrollAreaRef.current) {
      // Scroll to the far right to show the newly added note
      scrollAreaRef.current.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
  }, [notes.length]); // Only run when the number of notes changes

  return (
    <ScrollArea className="w-full" ref={scrollAreaRef}>
      <div 
        ref={containerRef} 
        className="flex items-start pl-16 pr-16 gap-14 mt-6 notes-display min-w-max"
      >
        {notes.map((note) => (
          <Note 
            key={note.id} 
            note={note}
            isSelected={note.id === selectedNoteId}
            onSelect={onSelectNote}
          />
        ))}
        <div className="p-0.5"></div>
      </div>
    </ScrollArea>
  );
};

export default NotesDisplay;
