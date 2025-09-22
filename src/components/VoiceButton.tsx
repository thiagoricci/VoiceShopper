import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type VariantProps } from "class-variance-authority";

interface VoiceButtonProps {
  isListening: boolean;
  isRecording: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  size?: VariantProps<typeof import("@/components/ui/button").buttonVariants>["size"];
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening,
  isRecording,
  onStartListening,
  onStopListening,
  disabled,
  children,
  className,
  size = "lg"
}) => {
  const handleClick = () => {
    if (isListening || isRecording) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  // Dynamic sizing based on the size prop
  const iconSize = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";
  const gapSize = size === "sm" ? "gap-2" : "gap-3";
  const minHeights = {
    sm: "min-h-10",
    default: "min-h-12",
    lg: "min-h-12"  // Keep consistent height
  };
  const paddingX = {
    sm: "px-4",
    default: "px-6",
    lg: "px-8"
  };
  const fontSize = size === "sm" ? "text-sm" : size === "lg" ? "text-base" : "text-base"; // Consistent font size

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      variant={isListening ? "voice" : "default"}
      size={size}
      className={cn(
        minHeights[size || "lg"],
        paddingX[size || "lg"],
        "font-semibold",
        fontSize,
        "transition-smooth",
        isListening && "animate-pulse-voice shadow-voice",
        isRecording && "gradient-voice",
        className
      )}
    >
      <div className={`flex items-center ${gapSize}`}>
        {isListening ? (
          <Square className={iconSize} />
        ) : (
          <Mic className={iconSize} />
        )}
        {children || (isListening ? "Stop Listening" : "Start Voice Input")}
      </div>
    </Button>
  );
};
