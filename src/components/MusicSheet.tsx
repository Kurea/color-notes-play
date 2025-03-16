
import React, { useRef, useEffect, useState } from 'react';
import { Note, StaffType } from '@/utils/musicTheory';
import { Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import TrebleClef from './TrebleClef';

interface MusicSheetProps {
  notes: Note[];
  staffType?: StaffType;
  activeNote: string | null;
}

const MusicSheet: React.FC<MusicSheetProps> = ({
  notes,
  staffType = 'treble',
  activeNote,
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

  // Calculate note position on staff
  const getNoteTopPosition = (note: Note): string => {
    // Each line/space is 16px apart
    // Staff has 5 lines, with notes possibly extending above and below
    // Position 0 = bottom line of staff
    const lineHeight = 16;
    const basePosition = 4 * lineHeight; // Bottom line position
    
    // Calculate vertical position (higher position = lower on staff)
    const topPosition = basePosition - (note.position * lineHeight / 2);
    
    return `${topPosition}px`;
  };

  // Get the correct note shape/symbol based on duration
  const getNoteShape = (note: Note): JSX.Element => {
    // For simplicity, we're using basic shapes for notes
    // In a more complete implementation, you'd use proper musical notation symbols
    switch (note.duration) {
      case 'whole':
        return <div className="w-7 h-4 rounded-full border-2 border-current" />;
      case 'half':
        return <div className="w-7 h-4 rounded-full border-2 border-current bg-white" />;
      case 'quarter':
        return (
          <div className="flex items-center">
            <div className="w-7 h-4 rounded-full bg-current" />
            <div className="h-16 w-0.5 bg-current -ml-1" />
          </div>
        );
      case 'eighth':
        return (
          <div className="flex items-center">
            <div className="w-7 h-4 rounded-full bg-current" />
            <div className="h-16 w-0.5 bg-current -ml-1" />
            <div className="h-8 w-4 border-b-2 border-current rounded-br-full -ml-0.5 mt-4" />
          </div>
        );
      case 'sixteenth':
        return (
          <div className="flex items-center">
            <div className="w-7 h-4 rounded-full bg-current" />
            <div className="h-16 w-0.5 bg-current -ml-1" />
            <div className="flex flex-col -ml-0.5 mt-4">
              <div className="h-4 w-4 border-b-2 border-current rounded-br-full" />
              <div className="h-4 w-4 border-b-2 border-current rounded-br-full" />
            </div>
          </div>
        );
      default:
        return <div className="w-7 h-4 rounded-full bg-current" />;
    }
  };

  // Render accidental symbol if needed
  const renderAccidental = (note: Note): JSX.Element | null => {
    if (!note.accidental) return null;
    
    switch (note.accidental) {
      case 'sharp':
        return <span className="absolute -left-4 -translate-y-2 text-lg">#</span>;
      case 'flat':
        return <span className="absolute -left-4 -translate-y-2 text-lg">♭</span>;
      case 'natural':
        return <span className="absolute -left-4 -translate-y-2 text-lg">♮</span>;
      default:
        return null;
    }
  };

  // Determine if a note should have ledger lines
  const needsLedgerLines = (note: Note): boolean => {
    return note.position < 0 || note.position > 8;
  };

  // Render ledger lines for notes above or below the staff
  const renderLedgerLines = (note: Note): JSX.Element | null => {
    if (!needsLedgerLines(note)) return null;
    
    const lines = [];
    
    if (note.position < 0) {
      // Add ledger lines below the staff
      for (let i = -2; i >= note.position; i -= 2) {
        lines.push(
          <div 
            key={`ledger-${i}`} 
            className="absolute w-10 h-0.5 bg-gray-300 left-1/2 -translate-x-1/2"
            style={{ top: `${4 * 16 - (i * 8)}px` }}
          />
        );
      }
    } else if (note.position > 8) {
      // Add ledger lines above the staff
      for (let i = 10; i <= note.position; i += 2) {
        lines.push(
          <div 
            key={`ledger-${i}`} 
            className="absolute w-10 h-0.5 bg-gray-300 left-1/2 -translate-x-1/2"
            style={{ top: `${4 * 16 - (i * 8)}px` }}
          />
        );
      }
    }
    
    return <>{lines}</>;
  };

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
        {/* Beautiful treble clef on the left */}
        <div className="absolute left-2 top-[24px]">
          {staffType === 'treble' ? (
            <TrebleClef 
              color="#9b87f5" 
              width={48} 
              height={96} 
              className="opacity-90"
            />
          ) : (
            <div className="text-4xl font-serif opacity-80">F</div>
          )}
        </div>
        
        {/* Notes */}
        <div className="flex items-start pl-16 gap-14 mt-6">
          {notes.map((note, index) => {
            const isActive = activeNote?.toLowerCase() === note.value;
            
            return (
              <div 
                key={note.id} 
                className={cn(
                  "note relative", 
                  isActive ? "note-active" : ""
                )}
                style={{ top: getNoteTopPosition(note) }}
              >
                <div 
                  className={cn(
                    "transition-colors duration-300 ease-spring",
                    isActive ? `text-note-${note.value}` : "text-gray-800"
                  )}
                >
                  {renderAccidental(note)}
                  {getNoteShape(note)}
                  {renderLedgerLines(note)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MusicSheet;
