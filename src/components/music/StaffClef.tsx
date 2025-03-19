
import React from 'react';
import TrebleClef from '../TrebleClef';
import { StaffType } from '@/utils/musicTheory';

interface StaffClefProps {
  staffType: StaffType;
}

const StaffClef: React.FC<StaffClefProps> = ({ staffType }) => {
  return (
    <div className="absolute left-2 top-[98px]">
      {staffType === 'treble' ? (
        <TrebleClef 
          width={95} 
          height={170} 
          className="opacity-90 clef" 
        />
      ) : (
        <div className="text-4xl font-serif opacity-80">F</div>
      )}
    </div>
  );
};

export default StaffClef;
