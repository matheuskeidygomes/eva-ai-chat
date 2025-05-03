"use client";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionAPIConstructor = new () => ISpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionAPIConstructor;
    webkitSpeechRecognition?: SpeechRecognitionAPIConstructor;
  }
}

const SpeechRecognitionAPI: SpeechRecognitionAPIConstructor | undefined = window.SpeechRecognition || window.webkitSpeechRecognition;

export class SpeechRecognizer {
  private recognition: ISpeechRecognition;
  private silenceTimer: NodeJS.Timeout | null = null;
  private silenceTimeout: number = 2000; // 2 seconds of silence before stopping
  private isSpeaking: boolean = false;
  private onTranscriptChange: (text: string) => void = () => {};
  private onFinalTranscript: (text: string) => void = () => {};
  private transcript: string = '';

  constructor() {
    if (!SpeechRecognitionAPI) {
      throw new Error('Speech recognition not supported in this browser');
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US'; // Default language
  }

  setLanguage(lang: string): void {
    this.recognition.lang = lang;
  }

  setSilenceTimeout(ms: number): void {
    this.silenceTimeout = ms;
  }

  onTranscript(callback: (text: string) => void): void {
    this.onTranscriptChange = callback;
  }

  onFinal(callback: (text: string) => void): void {
    this.onFinalTranscript = callback;
  }

  start(): void {
    try {
      this.recognition.onresult = this.handleResult.bind(this);
      this.recognition.onend = this.handleEnd.bind(this);
      this.recognition.start();
      this.transcript = '';
      this.isSpeaking = false;
      this.resetSilenceTimer();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      throw error;
    }
  }

  stop(): void {
    try {
      this.recognition.stop();
      this.clearSilenceTimer();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  private handleResult(event: SpeechRecognitionEvent): void {
    let interimTranscript = '';
    let finalTranscript = this.transcript;

    const results = event.results;
    for (let i = event.resultIndex; i < results.length; i++) {
      const result = results.item(i);
      if (result && result.length > 0) {
        const alternative = result.item(0);
        if (alternative) {
          const transcript = alternative.transcript;

          if (result.isFinal) {
            finalTranscript += transcript + ' ';
            this.transcript = finalTranscript;
          } else {
            interimTranscript += transcript;
          }
        }
      }
    }

    if (interimTranscript) {
      this.isSpeaking = true;
      this.resetSilenceTimer();
    } else if (this.isSpeaking) {
      this.resetSilenceTimer();
    }

    this.onTranscriptChange(finalTranscript + interimTranscript);
  }

  private handleEnd(): void {
    if (this.transcript) {
      this.onFinalTranscript(this.transcript.trim());
    }
    
    this.clearSilenceTimer();
  }

  private resetSilenceTimer(): void {
    this.clearSilenceTimer();
    
    this.silenceTimer = setTimeout(() => {
      if (this.isSpeaking) {
        this.isSpeaking = false;
        this.stop();
      }
    }, this.silenceTimeout);
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }
}

// Static helper functions
export const speechRecognitionService = {
  isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  },
  
  // Get list of available languages (this is a mock as Web Speech API doesn't provide this)
  getAvailableLanguages(): { code: string, name: string }[] {
    return [
      { code: 'en-US', name: 'English (US)' },
      { code: 'en-GB', name: 'English (UK)' },
      { code: 'es-ES', name: 'Spanish' },
      { code: 'fr-FR', name: 'French' },
      { code: 'de-DE', name: 'German' },
      { code: 'it-IT', name: 'Italian' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)' }
      // Add more languages as needed
    ];
  }
}; 