
import React, { useRef, useEffect, useState } from 'react';
import { Note, StaffType } from '@/utils/musicTheory';
import StaffClef from './music/StaffClef';
import NotesDisplay from './music/NotesDisplay';

interface MusicSheetProps {
  notes: Note[];
  staffType?: StaffType;
}

const MusicSheet: React.FC<MusicSheetProps> = ({
  notes,
  staffType = 'treble',
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
        <NotesDisplay notes={notes} />
      </div>
    </div>
  );
};

export default MusicSheet;
