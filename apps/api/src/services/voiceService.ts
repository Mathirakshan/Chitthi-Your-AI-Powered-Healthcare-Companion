import type { SpeakResponse, SupportedLanguage, TranscribeResponse } from '@chitthi/shared';
import { safeLogger } from '../utils/logger.js';

const SARVAM_LANG_MAP: Record<SupportedLanguage, string> = {
  'en-IN': 'en-IN',
  'ta-IN': 'ta-IN',
  'hi-IN': 'hi-IN',
};

const SARVAM_SPEAKER_MAP: Record<SupportedLanguage, string> = {
  'en-IN': 'meera',
  'ta-IN': 'meera',
  'hi-IN': 'meera',
};

export class TranscriptionError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 503
  ) {
    super(message);
    this.name = 'TranscriptionError';
  }
}

export async function transcribeAudio(params: {
  audioBuffer?: Buffer;
  mimeType?: string;
  language: SupportedLanguage;
  mode?: 'transcribe' | 'codemix';
}): Promise<TranscribeResponse> {
  const { audioBuffer, mimeType, language, mode = 'transcribe' } = params;
  const sarvamApiKey = process.env.SARVAM_API_KEY;

  if (!audioBuffer || audioBuffer.length === 0) {
    throw new TranscriptionError(
      'EMPTY_AUDIO',
      'No audio was captured. Please check your microphone and speak clearly.',
      400
    );
  }

  if (!sarvamApiKey) {
    throw new TranscriptionError(
      'STT_NOT_CONFIGURED',
      'Server speech-to-text is not configured. Please use browser speech recognition or type your question.',
      503
    );
  }

  try {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType || 'audio/webm' });
    formData.append('file', blob, 'recording.webm');
    formData.append('language_code', SARVAM_LANG_MAP[language]);
    formData.append('model', 'saaras:v3');
    formData.append('mode', mode === 'codemix' ? 'codemix' : 'transcribe');

    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': sarvamApiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      safeLogger.warn('Sarvam STT returned non-OK status', { status: response.status, language });
      throw new TranscriptionError(
        'TRANSCRIPTION_FAILED',
        'Could not transcribe the recording. Please try speaking again or type your question.',
        502
      );
    }

    const data = (await response.json()) as {
      transcript?: string;
      language_code?: string;
    };
    const transcript = data.transcript?.trim();
    if (!transcript) {
      throw new TranscriptionError(
        'NO_SPEECH_DETECTED',
        'No speech was detected in your recording. Please try again.',
        422
      );
    }

    return {
      transcript,
      detectedLanguage: data.language_code ?? language,
      needsConfirmation: true,
      demoMode: false,
    };
  } catch (err) {
    if (err instanceof TranscriptionError) {
      throw err;
    }
    safeLogger.warn('Sarvam STT request error', { language });
    throw new TranscriptionError(
      'STT_UNAVAILABLE',
      'Speech transcription service is currently unavailable. Please try again or type your question.',
      503
    );
  }
}

export async function synthesizeSpeech(params: {
  text: string;
  language: SupportedLanguage;
}): Promise<SpeakResponse> {
  const { text, language } = params;
  const sarvamApiKey = process.env.SARVAM_API_KEY;

  if (sarvamApiKey && text.trim().length > 0) {
    try {
      const response = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': sarvamApiKey,
        },
        body: JSON.stringify({
          inputs: [text.slice(0, 500)],
          target_language_code: SARVAM_LANG_MAP[language],
          speaker: SARVAM_SPEAKER_MAP[language],
          model: 'bulbul:v2',
          enable_preprocessing: true,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { audios?: string[] };
        if (data.audios && data.audios[0]) {
          return {
            audioBase64: data.audios[0],
            mimeType: 'audio/wav',
            useBrowserFallback: false,
            demoMode: false,
          };
        }
      }
    } catch {
      safeLogger.warn('Sarvam TTS unavailable, using browser fallback');
    }
  }

  return {
    useBrowserFallback: true,
    demoMode: true,
  };
}
