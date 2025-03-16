
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Volume1, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MicrophoneControlProps {
  onMicrophoneToggle: (isActive: boolean) => void;
  detectedNote: string | null;
  signalStrength: number; // 0-100
}

const MicrophoneControl: React.FC<MicrophoneControlProps> = ({
  onMicrophoneToggle,
  detectedNote,
  signalStrength,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Check if browser supports audio API
  const isBrowserSupported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

  // Handle microphone toggle
  const handleToggle = async () => {
    if (!isBrowserSupported) {
      toast.error('Your browser does not support audio input.');
      return;
    }

    if (isActive) {
      // Turn off microphone
      setIsActive(false);
      onMicrophoneToggle(false);
      toast('Microphone turned off', {
        icon: <MicOff className="h-4 w-4" />,
      });
    } else {
      try {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop stream immediately, we just needed the permission
        
        setHasPermission(true);
        setIsActive(true);
        onMicrophoneToggle(true);
        
        toast('Microphone activated', {
          icon: <Mic className="h-4 w-4" />
        });
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setHasPermission(false);
        toast.error('Unable to access microphone. Please check permissions.');
      }
    }
  };

  // Get the appropriate volume icon based on signal strength
  const getVolumeIcon = () => {
    if (signalStrength < 10 || !isActive) return <VolumeX className="h-4 w-4 text-muted-foreground" />;
    if (signalStrength < 50) return <Volume1 className="h-4 w-4 text-primary" />;
    return <Volume2 className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="glass p-4 rounded-lg flex flex-col items-center animate-scale-in">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleToggle}
          disabled={!isBrowserSupported}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ease-spring",
            isActive 
              ? "bg-primary text-white shadow-lg" 
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          )}
        >
          {isActive ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </button>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {getVolumeIcon()}
            <div className="h-1 bg-secondary w-24 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-150 ease-out"
                style={{ width: `${isActive ? signalStrength : 0}%` }}
              />
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground mt-1">
            {isActive 
              ? detectedNote 
                ? `Detected: ${detectedNote}` 
                : "Listening..." 
              : "Microphone off"}
          </div>
        </div>
      </div>
      
      {!isBrowserSupported && (
        <p className="text-xs text-destructive">
          Your browser doesn't support audio input.
        </p>
      )}
    </div>
  );
};

export default MicrophoneControl;
