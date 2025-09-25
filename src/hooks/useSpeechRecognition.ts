import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '@/types/speech';

// Enhanced Speech Recognition Hook optimized for mobile
export interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  timeout?: number; // Timeout in milliseconds
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
    timeout = 3000, // Default 3 seconds
    onResult,
    onEnd,
    onError,
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [manuallyStopped, setManuallyStopped] = useState(false);
  const isListeningRef = useRef(false);
  const manuallyStoppedRef = useRef(false);
  const autoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        isListeningRef.current = false;
        // Only restart if NOT manually stopped and still supposed to be listening
        if (isListening && continuous && !manuallyStoppedRef.current) {
          // Small delay to prevent rapid restarts
          timeoutRef.current = setTimeout(() => {
            // Triple check all conditions before restarting - ensure manuallyStopped is still false
            if (isListening && !manuallyStoppedRef.current && recognitionRef.current && !manuallyStoppedRef.current) {
              try {
                recognitionRef.current.start();
                isListeningRef.current = true;
              } catch (e) {
                // Ignore if already started
              }
            }
          }, 100);
        }
      });
      
      
      recognition.addEventListener('result', (event) => {
        // Reset inactivity timeout on speech detection
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
        }
        
        // Set new inactivity timeout
        if (timeout > 0 && isListening) {
          inactivityTimeoutRef.current = setTimeout(() => {
            if (isListening && recognitionRef.current) {
              try {
                recognitionRef.current.abort();
                setIsListening(false);
                isListeningRef.current = false;
              } catch (error) {
                console.error('Failed to stop recognition on timeout:', error);
              }
            }
          }, timeout);
        }

        // Set auto-stop timeout (30 seconds of complete silence)
        if (isListening && !manuallyStoppedRef.current) {
          if (autoStopTimeoutRef.current) {
            clearTimeout(autoStopTimeoutRef.current);
          }
          autoStopTimeoutRef.current = setTimeout(() => {
            if (isListening && !manuallyStoppedRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.stop();
                setIsListening(false);
                isListeningRef.current = false;
              } catch (error) {
                console.error('Failed to auto-stop recognition:', error);
              }
            }
          }, 3000); // 3 seconds
        }
        
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
        // Handle aborted error (often occurs during normal operation)
        if (event.error === 'aborted') {
          // Don't stop listening for aborted errors, as they often happen during normal operation
          // The audioend handler will restart recognition if needed
          return;
        }
        
        console.error('Speech recognition error:', event.error);
        onError?.(event.error);
        
        // Handle mobile-specific errors
        if (event.error === 'network' || event.error === 'not-allowed') {
          setIsListening(false);
        }
      });

      recognition.addEventListener('end', () => {
        isListeningRef.current = false;
        
        // Only call onEnd if not manually stopped
        if (!manuallyStoppedRef.current) {
          onEnd?.();
        }
        
        if (!continuous || manuallyStoppedRef.current) {
          setIsListening(false);
          setManuallyStopped(false); // Reset manual stop flag
          manuallyStoppedRef.current = false;
        }
      });

      recognitionRef.current = recognition;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
      }
    };
  }, [continuous, interimResults, lang, onResult, onEnd, onError]);

  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;

    try {
      setIsListening(true);
      isListeningRef.current = true;
      setManuallyStopped(false); // Reset manual stop flag when starting
      manuallyStoppedRef.current = false;
      setTranscript('');
      setFinalTranscript('');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    // Immediately set all flags to prevent any restarts
    setIsListening(false);
    isListeningRef.current = false;
    setManuallyStopped(true);
    manuallyStoppedRef.current = true;

    // Clear all timeouts immediately
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }

    // Force stop the recognition immediately with multiple methods
    try {
      // Abort is more forceful than stop - try multiple times
      recognitionRef.current.abort();
      recognitionRef.current.abort();
      recognitionRef.current.abort();
    } catch (error) {
      // If abort fails, try stop multiple times
      try {
        recognitionRef.current.stop();
        recognitionRef.current.stop();
        recognitionRef.current.stop();
      } catch (stopError) {
        console.error('Failed to stop speech recognition:', stopError);
      }
    }

    // Additional safety: ensure no restart can happen
    setTimeout(() => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
      } catch (e) {
        // Ignore errors
      }
    }, 50);

    // Final safety check
    setTimeout(() => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
      } catch (e) {
        // Ignore errors
      }
    }, 150);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setFinalTranscript('');
  }, []);

  const returnValue = useMemo(() => ({
    isSupported,
    isListening,
    transcript,
    finalTranscript,
    startListening,
    stopListening,
    resetTranscript,
  }), [isSupported, isListening, transcript, finalTranscript, startListening, stopListening, resetTranscript]);
  
  return returnValue;
};
