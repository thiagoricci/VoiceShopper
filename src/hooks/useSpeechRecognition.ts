import { useState, useEffect, useRef, useCallback } from 'react';
import type { SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '@/types/speech';

// Enhanced Speech Recognition Hook optimized for mobile
export interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  finalTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Mobile-optimized Speech Recognition
export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn => {
  const {
    continuous = true,
    interimResults = true,
    lang = 'en-US',
    onResult,
    onEnd,
    onError,
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition with mobile optimizations
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      
      // Mobile-optimized settings
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;
      
      // Critical for mobile: restart on audio end to maintain connection
      recognition.addEventListener('audioend', () => {
        if (isListening && continuous) {
          // Small delay to prevent rapid restarts
          timeoutRef.current = setTimeout(() => {
            if (isListening && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                // Ignore if already started
              }
            }
          }, 100);
        }
      });

      recognition.addEventListener('result', (event) => {
        let interimTranscript = '';
        let finalText = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        if (finalText) {
          setFinalTranscript(prev => prev + finalText);
          onResult?.(finalText, true);
        }
        
        if (interimTranscript) {
          setTranscript(interimTranscript);
          onResult?.(interimTranscript, false);
        }
      });

      recognition.addEventListener('error', (event) => {
        console.error('Speech recognition error:', event.error);
        onError?.(event.error);
        
        // Handle mobile-specific errors
        if (event.error === 'network' || event.error === 'not-allowed') {
          setIsListening(false);
        }
      });

      recognition.addEventListener('end', () => {
        onEnd?.();
        if (!continuous) {
          setIsListening(false);
        }
      });

      recognitionRef.current = recognition;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [continuous, interimResults, lang, onResult, onEnd, onError, isListening]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;

    try {
      setIsListening(true);
      setTranscript('');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    setIsListening(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setFinalTranscript('');
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    finalTranscript,
    startListening,
    stopListening,
    resetTranscript,
  };
};