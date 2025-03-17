
import React from 'react';
import { Note as NoteType } from '@/utils/musicTheory';
import { cn } from '@/lib/utils';

interface NoteProps {
  note: NoteType;
}

const Note: React.FC<NoteProps> = ({ note }) => {
  const isActive = note.isActive;
  
  // Calculate note position on staff
  const getNoteTopPosition = (note: NoteType): string => {
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
  const getNoteShape = (): JSX.Element => {
    // For simplicity, we're using basic shapes for notes
    // In a more complete implementation, you'd use proper musical notation symbols
    switch (note.duration) {
      case 'whole':
        return <div className="w-8 h-8 rounded-full border-2 border-current" />;
      case 'half':
        return <div className="w-8 h-8 rounded-full border-2 border-current bg-white" />;
      case 'quarter':
        return (
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-current" />
            <div className="h-16 w-0.5 bg-current -ml-1 -translate-y-1/2" />
          </div>
        );
      case 'eighth':
        return (
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-current" />
            <div className="h-16 w-0.5 bg-current -ml-1 -translate-y-1/2" />
            <div className="h-8 w-8 border-t-2 border-current rounded-tr-full -ml-0.5 mt-4 -translate-y-1/2" />
          </div>
        );
      case 'sixteenth':
        return (
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-current" />
            <div className="h-16 w-0.5 bg-current -ml-1 -translate-y-1/2" />
            <div className="flex flex-col -ml-0.5 mt-4 -translate-y-1/2">
              <div className="w-8 h-8 border-t-2 border-current rounded-tr-full" />
              <div className="w-8 h-8 border-t-2 border-current rounded-tr-full" />
            </div>
          </div>
        );
      default:
        return <div className="w-8 h-8 rounded-full bg-current" />;
    }
  };

  // Render accidental symbol if needed
  const renderAccidental = (): JSX.Element | null => {
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
  const needsLedgerLines = (): boolean => {
    return note.position < 0 || note.position > 8;
  };

  // Render ledger lines for notes above or below the staff
  const renderLedgerLines = (): JSX.Element | null => {
    if (!needsLedgerLines()) return null;
    
    const lines = [];
    
    if (note.position < 0) {
      // Add ledger lines below the staff
      for (let i = -2; i >= note.position; i -= 2) {
        lines.push(
          <div 
            key={`ledger-${i}`} 
            className="absolute w-10 h-0.5 bg-gray-300 left-1/2 -translate-x-1/2"
            style={{ top: `${(-i * 8)}px` }}
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
            style={{ top: `${(-i * 8)}px` }}
          />
        );
      }
    }
    
    return <>{lines}</>;
  };

  return (
    <div 
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
        {renderAccidental()}
        {getNoteShape()}
        {renderLedgerLines()}
      </div>
    </div>
  );
};

export default Note;
