
import React, { useState } from 'react';
import { Clock, Play, Square } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TempoControlProps {
  tempo: number;
  onTempoChange: (tempo: number) => void;
  isMetronomeActive: boolean;
  onMetronomeToggle: (isActive: boolean) => void;
  isMicrophoneActive: boolean;
}

const TempoControl: React.FC<TempoControlProps> = ({
  tempo,
  onTempoChange,
  isMetronomeActive,
  onMetronomeToggle,
  isMicrophoneActive
}) => {
  const [localTempo, setLocalTempo] = useState(tempo);
  
  const handleTempoChange = (value: number[]) => {
    const newTempo = value[0];
    setLocalTempo(newTempo);
    onTempoChange(newTempo);
  };
  
  const handleMetronomeToggle = () => {
    const newState = !isMetronomeActive;
    onMetronomeToggle(newState);
    
    if (newState) {
      toast.success(`Metronome started at ${tempo} BPM`);
    } else {
      toast('Metronome stopped');
    }
  };
  
  // Tempo ranges
  const getTempoDescription = (bpm: number): string => {
    if (bpm < 60) return 'Largo (Very Slow)';
    if (bpm < 76) return 'Adagio (Slow)';
    if (bpm < 108) return 'Andante (Moderate)';
    if (bpm < 120) return 'Moderato (Medium)';
    if (bpm < 168) return 'Allegro (Fast)';
    return 'Presto (Very Fast)';
  };

  return (
    <div className="glass p-4 rounded-lg flex flex-col gap-4 animate-scale-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>Tempo Control</span>
        </h3>
        <div className="text-xs font-medium text-muted-foreground">
          {getTempoDescription(localTempo)}
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="tempo-slider" className="text-sm">
            BPM: {localTempo}
          </Label>
          <Button
            onClick={handleMetronomeToggle}
            size="sm"
            variant={isMetronomeActive ? "default" : "outline"}
            className={cn(
              "h-8 w-8 p-0",
              isMetronomeActive ? "bg-primary text-primary-foreground" : ""
            )}
          >
            {isMetronomeActive ? (
              <Square className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <Slider
          id="tempo-slider"
          value={[localTempo]}
          min={40}
          max={208}
          step={4}
          onValueChange={handleTempoChange}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Slow</span>
          <span>Fast</span>
        </div>
      </div>
    </div>
  );
};

export default TempoControl;
