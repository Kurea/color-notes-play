
import React, { useRef, useEffect, useState } from 'react';
import { Note, StaffType } from '@/utils/musicTheory';
import { Music } from 'lucide-react';
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
    <div className="w-full overflow-hidden glass p-6 rounded-lg animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-medium">Music Sheet</h2>
        </div>
        <div className="text-xs text-muted-foreground">
          {staffType === 'treble' ? 'Treble Clef' : 'Bass Clef'}
        </div>
      </div>
      
      <div 
        ref={sheetRef}
        className="relative w-full music-sheet rounded-md bg-white/80 border border-gray-200 p-4 overflow-x-auto"
        style={{ height: '240px' }}
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
