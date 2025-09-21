// TypeScript declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
    webkitAudioContext: typeof AudioContext;
  }
}

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

declare class SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  
  constructor();
  
  start(): void;
  stop(): void;
  abort(): void;
  
  addEventListener(type: 'audiostart', listener: (event: Event) => void): void;
  addEventListener(type: 'audioend', listener: (event: Event) => void): void;
  addEventListener(type: 'end', listener: (event: Event) => void): void;
  addEventListener(type: 'error', listener: (event: SpeechRecognitionErrorEvent) => void): void;
  addEventListener(type: 'nomatch', listener: (event: Event) => void): void;
  addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'soundstart', listener: (event: Event) => void): void;
  addEventListener(type: 'soundend', listener: (event: Event) => void): void;
  addEventListener(type: 'speechstart', listener: (event: Event) => void): void;
  addEventListener(type: 'speechend', listener: (event: Event) => void): void;
  addEventListener(type: 'start', listener: (event: Event) => void): void;
}

export {};