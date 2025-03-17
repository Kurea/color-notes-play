
import React from 'react';
import { Trash2 } from 'lucide-react';

interface ClearNotesButtonProps {
  onClearNotes: () => void;
}

const ClearNotesButton: React.FC<ClearNotesButtonProps> = ({ onClearNotes }) => {
  return (
    <button
      onClick={onClearNotes}
      className="flex items-center justify-center gap-1.5 mt-2 text-xs text-destructive hover:text-destructive/80 transition-colors"
    >
      <Trash2 className="h-3.5 w-3.5" />
      <span>Clear all notes</span>
    </button>
  );
};

export default ClearNotesButton;
