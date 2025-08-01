
import React from 'react';
import { Note as NoteType } from '@/utils/musicTheory';
import { cn } from '@/lib/utils';

interface NoteProps {
  note: NoteType;
  isSelected: boolean;
  onSelect: (note: NoteType) => void;
  isMissed?: boolean;
}

const Note: React.FC<NoteProps> = ({ note, isSelected, onSelect, isMissed = false }) => {
  const isActive = note.isActive;
  
  // Calculate note position on staff
  const getNoteTopPosition = (note: NoteType): string => {
    // Each line/space is 16px apart
    // Staff has 5 lines, with notes possibly extending above and below
    // Position 0 = bottom line of staff
    const lineHeight = 32;
    const basePosition = 4 * lineHeight - 25 + 75; // Bottom line position
    
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
        return <div className="w-8 h-8 rounded-full border-2 border-current bg-white" />;
      case 'half':
        return (
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full border-2 border-current bg-white" />
            <div className="h-16 w-0.5 bg-current -ml-1 -translate-y-1/2" />
          </div>
        );
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
            <div className="relative h-16 w-0.5 bg-current -ml-1 -translate-y-1/2">
              <div className="absolute h-8 w-8 border-t-2 border-current rounded-tr-full left-0 top-0" />
            </div>
          </div>
        );
      case 'sixteenth':
        return (
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-current" />
            <div className="relative h-16 w-0.5 bg-current -ml-1 -translate-y-1/2">
              <div className="absolute h-4 w-8 border-t-2 border-current rounded-tr-full left-0 top-0" />
              <div className="absolute h-4 w-8 border-t-2 border-current rounded-tr-full left-0 top-4" />
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
            style={{ top: `${((note.position-i+1) * 16)}px` }}
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
            style={{ top: `${((note.position-i+1) * 16)}px` }}
          />
        );
      }
    }
    
    return <>{lines}</>;
  };

  const handleClick = () => {
    onSelect(note);
  };

  return (
    <div 
      className={cn(
        "note relative cursor-pointer", 
        isActive ? "note-active" : "",
        isSelected ? "ring-2 ring-offset-1 ring-primary" : ""
      )}
      style={{ top: getNoteTopPosition(note) }}
      onClick={handleClick}
    >
      <div 
        className={cn(
          "transition-colors duration-300 ease-spring",
          isMissed ? "text-red-600" : isActive ? `text-note-${note.value}` : "text-gray-800"
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
