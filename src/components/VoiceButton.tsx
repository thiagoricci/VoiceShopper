import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  isListening: boolean;
  isRecording: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening,
  isRecording,
  onStartListening,
  onStopListening,
  disabled,
  children,
  className
}) => {
  const handleClick = () => {
    if (isListening || isRecording) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      variant={isListening ? "voice" : "default"}
      size="lg"
      className={cn(
        "min-h-16 px-8 font-semibold text-lg transition-smooth",
        isListening && "animate-pulse-voice shadow-voice",
        isRecording && "gradient-voice",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {isListening ? (
          <Square className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        {children || (isListening ? "Stop Listening" : "Start Voice Input")}
      </div>
    </Button>
  );
};