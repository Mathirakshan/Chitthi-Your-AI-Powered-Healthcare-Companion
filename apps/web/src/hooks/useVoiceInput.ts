import { useCallback, useEffect, useRef, useState } from 'react';
import type { SupportedLanguage } from '@chitthi/shared';
import type { UIStrings } from '../i18n/translations';
import { useAudioRecorder } from './useAudioRecorder';
import { api } from '../services/api';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export interface UseVoiceInputOptions {
  language: SupportedLanguage;
  strings: UIStrings;
  onLiveTranscript?: (text: string) => void;
}

export function useVoiceInput({ language, strings, onLiveTranscript }: UseVoiceInputOptions) {
  const { micStatus, audioLevel, audioBands, startRecording, stopRecording } = useAudioRecorder();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const languageRef = useRef<SupportedLanguage>(language);
  const stringsRef = useRef<UIStrings>(strings);
  const onLiveTranscriptRef = useRef(onLiveTranscript);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const interimTranscriptRef = useRef<string>('');
  const recognitionFailedRef = useRef<string | null>(null);
  const isListeningRef = useRef<boolean>(false);

  stringsRef.current = strings;
  onLiveTranscriptRef.current = onLiveTranscript;

  const startBrowserRecognition = useCallback((targetLang: SupportedLanguage) => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return false;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      }

      const recognition = new Ctor();
      recognition.lang = targetLang;
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 3;

      recognition.onresult = (event) => {
        let interim = '';
        let finalAdditions = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const best = result[0]?.transcript ?? '';
          if (result.isFinal) {
            finalAdditions += (finalAdditions ? ' ' : '') + best.trim();
          } else {
            interim += (interim ? ' ' : '') + best;
          }
        }
        if (finalAdditions) {
          finalTranscriptRef.current = [finalTranscriptRef.current, finalAdditions]
            .filter(Boolean)
            .join(' ')
            .trim();
        }
        interimTranscriptRef.current = interim.trim();
        const combined = [finalTranscriptRef.current, interimTranscriptRef.current]
          .filter(Boolean)
          .join(' ')
          .trim();
        setInterimTranscript(combined);
        if (combined && onLiveTranscriptRef.current) {
          onLiveTranscriptRef.current(combined);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'aborted') return;
        recognitionFailedRef.current = event.error;
      };

      recognition.onend = () => {
        // Keep recognition alive if user hasn't tapped stop yet (mobile browsers often auto-end)
        if (isListeningRef.current && !recognitionFailedRef.current) {
          try {
            recognition.lang = languageRef.current;
            recognition.start();
          } catch {
            // Ignore restart error if already stopped
          }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      return true;
    } catch {
      recognitionRef.current = null;
      return false;
    }
  }, []);

  // Dynamically update transcription language configuration when language changes without page refresh
  useEffect(() => {
    languageRef.current = language;
    setError(null);

    if (isListeningRef.current && recognitionRef.current) {
      recognitionFailedRef.current = null;
      startBrowserRecognition(language);
    }
  }, [language, startBrowserRecognition]);

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const startListening = useCallback(async () => {
    setError(null);
    setInterimTranscript('');
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    recognitionFailedRef.current = null;

    const started = await startRecording();
    if (!started) {
      const errMsgs = stringsRef.current.transcriptionErrors;
      setError(
        !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia
          ? errMsgs.micUnsupported
          : errMsgs.micDenied
      );
      return false;
    }

    isListeningRef.current = true;
    startBrowserRecognition(languageRef.current);
    return true;
  }, [startBrowserRecognition, startRecording]);

  const stopListening = useCallback(async (): Promise<string | null> => {
    isListeningRef.current = false;
    const activeStrings = stringsRef.current;
    const activeLang = languageRef.current;

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors
      }
    }

    // Give browser SpeechRecognition a brief moment to flush final segment before reading
    await new Promise((r) => setTimeout(r, 180));
    const blob = await stopRecording();

    const browserTranscript = [finalTranscriptRef.current, interimTranscriptRef.current]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setInterimTranscript('');

    if (browserTranscript) {
      return browserTranscript;
    }

    // If browser SpeechRecognition was denied mic access explicitly
    if (
      recognitionFailedRef.current === 'not-allowed' ||
      recognitionFailedRef.current === 'service-not-allowed'
    ) {
      setError(activeStrings.transcriptionErrors.micDenied);
      return null;
    }

    // Fall back to server STT when browser SpeechRecognition isn't supported or didn't produce text
    if (blob && blob.size > 0) {
      setIsTranscribing(true);
      try {
        const res = await api.transcribeAudio(blob, activeLang);
        if (res.transcript && res.transcript.trim()) {
          return res.transcript.trim();
        }
        setError(activeStrings.transcriptionErrors.noSpeech);
        return null;
      } catch (err) {
        if (recognitionFailedRef.current === 'no-speech') {
          setError(activeStrings.transcriptionErrors.noSpeech);
        } else if (err instanceof Error && err.message) {
          setError(err.message);
        } else {
          setError(activeStrings.transcriptionErrors.serverUnavailable);
        }
        return null;
      } finally {
        setIsTranscribing(false);
      }
    }

    if (recognitionFailedRef.current === 'no-speech') {
      setError(activeStrings.transcriptionErrors.noSpeech);
    } else {
      setError(activeStrings.transcriptionErrors.emptyAudio);
    }
    return null;
  }, [stopRecording]);

  return {
    isListening: micStatus === 'recording',
    isTranscribing,
    micStatus,
    interimTranscript,
    audioLevel,
    audioBands,
    error,
    clearError,
    startListening,
    stopListening,
  };
}
