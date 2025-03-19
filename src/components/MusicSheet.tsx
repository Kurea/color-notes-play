
import React, { useRef, useEffect, useState } from 'react';
import { Note, StaffType } from '@/utils/musicTheory';
import StaffClef from './music/StaffClef';
import NotesDisplay from './music/NotesDisplay';

interface MusicSheetProps {
  notes: Note[];
  staffType?: StaffType;
  selectedNoteId: string | null;
  onSelectNote: (note: Note) => void;
}

const MusicSheet: React.FC<MusicSheetProps> = ({
  notes,
  staffType = 'treble',
  selectedNoteId,
  onSelectNote
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (sheetRef.current) {
        setDimensions({
          width: sheetRef.current.clientWidth,
          height: sheetRef.current.clientHeight,
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Auto-scroll to the end when notes are added
  useEffect(() => {
    if (sheetRef.current) {
      // Scroll to the far right to show the newly added note
      sheetRef.current.scrollTo({
        left: sheetRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
  }, [notes.length]); // Only run when the number of notes changes


  return (
    <div className="w-full overflow-hidden glass p-4 rounded-lg animate-fade-in">
      <div 
        ref={sheetRef}
        className="relative w-full music-sheet rounded-md bg-white/80 border border-gray-200 p-4 overflow-x-auto overflow-y-hidden"
        style={{ height: '350px' }}
      >
        {/* Clef on the left */}
        <StaffClef staffType={staffType} />
        
        {/* Notes */}
        <NotesDisplay 
          notes={notes} 
          selectedNoteId={selectedNoteId}
          onSelectNote={onSelectNote}
        />
      </div>
    </div>
  );
};

export default MusicSheet;
