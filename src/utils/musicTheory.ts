
/**
 * Music theory utilities
 */

export interface Note {
  id: string;
  value: string; // C, D, E, etc.
  octave: number;
  position: number; // 0-6 for line/space position on staff
  duration: 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth';
  accidental?: 'sharp' | 'flat' | 'natural';
  isActive: boolean;
}

export type StaffType = 'treble' | 'bass';

// Calculate the vertical position of a note on the staff (0 = bottom line, 1 = space above bottom line, etc.)
export const calculateNotePosition = (note: string, octave: number, clef: StaffType): number => {
  const noteValues: Record<string, number> = {
    'c': 0,
    'd': 1,
    'e': 2,
    'f': 3,
    'g': 4,
    'a': 5,
    'b': 6,
  };
  
  const baseValue = noteValues[note.toLowerCase()];
  
  if (baseValue === undefined) {
    console.error(`Invalid note: ${note}`);
    return 0;
  }
  
  // For treble clef (G clef): E4 is on the bottom line (position 0)
  // For bass clef (F clef): G2 is on the bottom line (position 0)
  let position = 0;
  
  if (clef === 'treble') {
    // Calculate position relative to E4 (bottom line in treble clef)
    position = baseValue - noteValues['e'] + (octave - 4) * 7;
  } else {
    // Calculate position relative to G2 (bottom line in bass clef)
    position = baseValue - noteValues['g'] + (octave - 2) * 7;
  }
  
  return position;
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Create a new note object
export const createNote = (
  value: string,
  octave: number,
  duration: Note['duration'] = 'quarter',
  clef: StaffType = 'treble',
  accidental?: Note['accidental']
): Note => {
  return {
    id: generateId(),
    value: value.toLowerCase(),
    octave,
    position: calculateNotePosition(value, octave, clef),
    duration,
    accidental,
    isActive: false,
  };
};

// Parse a note string (e.g., "C4") into components
export const parseNoteString = (noteString: string): { value: string; octave: number; accidental?: Note['accidental'] } => {
  const regex = /^([A-Ga-g])([#b])?(\d)$/;
  const match = noteString.match(regex);
  
  if (!match) {
    throw new Error(`Invalid note string: ${noteString}`);
  }
  
  const [, value, accidentalStr, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  
  let accidental: Note['accidental'] | undefined;
  if (accidentalStr === '#') accidental = 'sharp';
  else if (accidentalStr === 'b') accidental = 'flat';
  
  return { value, octave, accidental };
};

// Get the base note name (C, D, E, etc.) from a full note name (C4, D#3, etc.)
export const getBaseNoteName = (noteName: string | null): string | null => {
  if (!noteName) return null;
  
  const match = noteName.match(/^([A-Ga-g])/i);
  if (!match) return null;
  
  return match[1].toLowerCase();
};

// Default music sheet data
export const getDefaultNotes = (): Note[] => {
  return [
    createNote('c', 4, 'quarter', 'treble'),
    createNote('d', 4, 'quarter', 'treble'),
    createNote('e', 4, 'quarter', 'treble'),
    createNote('f', 4, 'quarter', 'treble'),
    createNote('g', 4, 'quarter', 'treble'),
    createNote('a', 4, 'quarter', 'treble'),
    createNote('b', 4, 'quarter', 'treble'),
    createNote('c', 5, 'quarter', 'treble'),
  ];
};
