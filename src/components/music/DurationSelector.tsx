
import React from 'react';
import { Note } from '@/utils/musicTheory';

interface DurationSelectorProps {
  selectedDuration: Note['duration'];
  onDurationChange: (duration: Note['duration']) => void;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({
  selectedDuration,
  onDurationChange,
}) => {
  const durations: Array<[Note['duration'], string]> = [
    ['whole', 'Whole'],
    ['half', 'Half'],
    ['quarter', 'Quarter'],
    ['eighth', 'Eighth'],
    ['sixteenth', 'Sixteenth'],
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {durations.map(([value, label]) => (
        <button
          key={value}
          onClick={() => onDurationChange(value)}
          className={`text-xs py-1 px-2 rounded-md transition-colors ${
            selectedDuration === value
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default DurationSelector;
