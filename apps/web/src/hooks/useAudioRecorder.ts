import { useCallback, useEffect, useRef, useState } from 'react';

export type MicStatus = 'idle' | 'recording' | 'denied' | 'unsupported';

const BAND_COUNT = 12;
const ZERO_BANDS = new Array<number>(BAND_COUNT).fill(0);

function pickRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return undefined;
  }
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export function useAudioRecorder() {
  const [micStatus, setMicStatus] = useState<MicStatus>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioBands, setAudioBands] = useState<number[]>(ZERO_BANDS);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopMeter = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setAudioLevel(0);
    setAudioBands(ZERO_BANDS);
  }, []);

  const startMeter = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.68;
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!streamRef.current) return;
        analyser.getByteFrequencyData(data);
        let sum = 0;
        const bands: number[] = [];
        // Sample voice-active frequency range (~180 Hz - 4.5 kHz) across 12 bands
        for (let i = 0; i < BAND_COUNT; i++) {
          const binStart = 1 + i * 2;
          const v1 = data[binStart] ?? 0;
          const v2 = data[binStart + 1] ?? v1;
          const val = Math.min(1, ((v1 + v2) / 510) * 1.35);
          sum += val;
          bands.push(val);
        }
        setAudioLevel(Math.min(1, (sum / BAND_COUNT) * 1.6));
        setAudioBands(bands);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      // Live metering unavailable, recording still proceeds
    }
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
      setMicStatus('unsupported');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startMeter(stream);

      const preferredMime = pickRecorderMimeType();
      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(250);
      recorderRef.current = recorder;
      setMicStatus('recording');
      return true;
    } catch {
      stopMeter();
      setMicStatus('denied');
      return false;
    }
  }, [startMeter, stopMeter]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      stopMeter();
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setMicStatus('idle');
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setMicStatus('idle');
        resolve(blob.size > 0 ? blob : null);
      };

      recorder.stop();
    });
  }, [stopMeter]);

  useEffect(() => {
    return () => {
      stopMeter();
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [stopMeter]);

  return { micStatus, audioLevel, audioBands, startRecording, stopRecording };
}
