import { useCallback, useEffect, useRef, useState } from 'react';
import type { SupportedLanguage } from '@chitthi/shared';
import { api } from '../services/api';

const BAND_COUNT = 12;
const ZERO_BANDS = new Array<number>(BAND_COUNT).fill(0);

function pickBestVoice(voices: SpeechSynthesisVoice[], language: SupportedLanguage): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const target = language.toLowerCase();
  const base = target.split('-')[0];

  return (
    voices.find((v) => v.lang.toLowerCase() === target) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(`${base}-in`)) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(base)) ||
    null
  );
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioBands, setAudioBands] = useState<number[]>(ZERO_BANDS);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const boundaryPulseRef = useRef<number>(0);
  const lastBoundaryTimeRef = useRef<number>(0);
  const speakingActiveRef = useRef(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const syncVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    syncVoices();
    window.speechSynthesis.addEventListener('voiceschanged', syncVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', syncVoices);
    };
  }, []);

  const stopMeter = useCallback(() => {
    speakingActiveRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    boundaryPulseRef.current = 0;
    setAudioLevel(0);
    setAudioBands(ZERO_BANDS);
  }, []);

  const stop = useCallback(() => {
    stopMeter();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [stopMeter]);

  useEffect(() => stop, [stop]);

  const startSynthesisMeter = useCallback(() => {
    speakingActiveRef.current = true;
    const tick = (now: number) => {
      if (!speakingActiveRef.current) return;
      const synthSpeaking =
        typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        window.speechSynthesis.speaking &&
        !window.speechSynthesis.paused;

      if (!synthSpeaking) {
        setAudioLevel(0);
        setAudioBands(ZERO_BANDS);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Decay real onboundary syllable pulse over ~220ms
      const elapsedSinceBoundary = now - lastBoundaryTimeRef.current;
      const pulse =
        elapsedSinceBoundary < 260
          ? boundaryPulseRef.current * Math.max(0, 1 - elapsedSinceBoundary / 260)
          : // Gentle natural vocal envelope only while browser speechSynthesis is actively speaking
            0.28 + 0.16 * Math.abs(Math.sin(now * 0.014));

      const level = Math.min(1, Math.max(0.08, pulse));
      const bands = Array.from({ length: BAND_COUNT }, (_, idx) => {
        const centerWeight = 1 - Math.abs(idx - (BAND_COUNT - 1) / 2) / (BAND_COUNT * 0.7);
        const harmonic = 0.72 + 0.28 * Math.sin(now * 0.018 + idx * 0.85);
        return Math.min(1, Math.max(0.06, level * centerWeight * harmonic));
      });

      setAudioLevel(level);
      setAudioBands(bands);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startAudioElementMeter = useCallback((audio: HTMLAudioElement) => {
    speakingActiveRef.current = true;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      audioCtxRef.current = ctx;
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.68;
      source.connect(analyser);
      analyser.connect(ctx.destination);

      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        if (!speakingActiveRef.current) return;
        analyser.getByteFrequencyData(data);
        let sum = 0;
        const bands: number[] = [];
        // Sample voice-active frequency bins (~180 Hz - 4.5 kHz) across 12 bands
        for (let i = 0; i < BAND_COUNT; i++) {
          const binStart = 1 + i * 2;
          const v1 = data[binStart] ?? 0;
          const v2 = data[binStart + 1] ?? v1;
          const val = Math.min(1, ((v1 + v2) / 510) * 1.35);
          sum += val;
          bands.push(val);
        }
        setAudioLevel(Math.min(1, (sum / BAND_COUNT) * 1.5));
        setAudioBands(bands);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      // If Web Audio analyser cannot attach, keep basic speaking state without crashing playback
      setAudioLevel(0.45);
      setAudioBands(ZERO_BANDS.map((_, i) => 0.35 + (i % 3) * 0.15));
    }
  }, []);

  const speak = useCallback(
    async (text: string, language: SupportedLanguage, rate = 1.0) => {
      stop();
      if (!text.trim()) return;
      setIsSpeaking(true);

      try {
        const res = await api.speakText(text, language);
        if (!res.useBrowserFallback && res.audioBase64) {
          const audio = new Audio(`data:${res.mimeType || 'audio/wav'};base64,${res.audioBase64}`);
          audio.playbackRate = rate;
          audioRef.current = audio;
          audio.onplay = () => startAudioElementMeter(audio);
          audio.onended = () => {
            stopMeter();
            setIsSpeaking(false);
          };
          audio.onerror = () => {
            stopMeter();
            setIsSpeaking(false);
          };
          await audio.play();
          return;
        }
      } catch {
        // Fall through to browser speechSynthesis
      }

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = rate;
        const voices = voicesRef.current.length ? voicesRef.current : window.speechSynthesis.getVoices();
        const matchedVoice = pickBestVoice(voices, language);
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        utterance.onstart = () => {
          boundaryPulseRef.current = 0.88;
          lastBoundaryTimeRef.current = performance.now();
          startSynthesisMeter();
        };
        utterance.onboundary = (event) => {
          const wordLen = Math.min(10, Math.max(2, event.charLength || 5));
          boundaryPulseRef.current = 0.68 + (wordLen / 10) * 0.32;
          lastBoundaryTimeRef.current = performance.now();
        };
        utterance.onend = () => {
          stopMeter();
          setIsSpeaking(false);
        };
        utterance.onerror = () => {
          stopMeter();
          setIsSpeaking(false);
        };
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } else {
        stopMeter();
        setIsSpeaking(false);
      }
    },
    [startAudioElementMeter, startSynthesisMeter, stop, stopMeter]
  );

  return { isSpeaking, audioLevel, audioBands, speak, stop };
}
