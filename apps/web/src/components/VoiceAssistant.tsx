import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Mic, MicOff, Send, Square, Volume2 } from 'lucide-react';
import type { QuestionResponse, SupportedLanguage } from '@chitthi/shared';
import type { UIStrings } from '../i18n/translations';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { api } from '../services/api';
import { ChitthiRobot, type RobotState } from './ChitthiRobot';
import { VoiceVisualizer } from './VoiceVisualizer';

interface VoiceAssistantProps {
  documentId: string;
  language: SupportedLanguage;
  strings: UIStrings;
  isSpeaking: boolean;
  speechAudioLevel?: number;
  speechAudioBands?: number[];
  onSpeak: (text: string) => void;
  onStopSpeaking: () => void;
}

export function VoiceAssistant({
  documentId,
  language,
  strings,
  isSpeaking,
  speechAudioLevel = 0,
  speechAudioBands,
  onSpeak,
  onStopSpeaking,
}: VoiceAssistantProps) {
  const [questionText, setQuestionText] = useState('');
  const [recognizedSpeech, setRecognizedSpeech] = useState('');
  const [asking, setAsking] = useState(false);
  const [latestResponse, setLatestResponse] = useState<QuestionResponse | null>(null);
  const [qaError, setQaError] = useState<string | null>(null);

  const {
    isListening,
    isTranscribing,
    micStatus,
    audioLevel: micAudioLevel,
    audioBands: micAudioBands,
    error: transcriptionError,
    clearError: clearTranscriptionError,
    startListening,
    stopListening,
  } = useVoiceInput({
    language,
    strings,
    onLiveTranscript: (live) => {
      setQuestionText(live);
    },
  });

  const robotState: RobotState = isListening
    ? 'listening'
    : asking || isTranscribing
    ? 'thinking'
    : isSpeaking
    ? 'speaking'
    : latestResponse?.needsClinician
    ? 'warning'
    : latestResponse
    ? 'success'
    : 'idle';

  const activeAudioLevel = isListening ? micAudioLevel : isSpeaking ? speechAudioLevel : 0;
  const activeAudioBands = isListening
    ? micAudioBands
    : isSpeaking
    ? speechAudioBands
    : undefined;

  const combinedError = qaError || transcriptionError;

  const handleMicToggle = async () => {
    setQaError(null);
    clearTranscriptionError();

    if (isListening) {
      const transcript = await stopListening();
      if (transcript) {
        setRecognizedSpeech(transcript);
        setQuestionText(transcript);
      }
    } else {
      onStopSpeaking();
      await startListening();
    }
  };

  const handleAsk = async (textToAsk?: string) => {
    const q = (textToAsk ?? questionText).trim();
    if (!q) return;
    setQaError(null);
    clearTranscriptionError();
    setAsking(true);
    setRecognizedSpeech(q);
    try {
      const res = await api.askQuestion(documentId, q, language);
      setLatestResponse(res);
      setQuestionText('');
      onSpeak(res.answerText);
    } catch (err) {
      setQaError(err instanceof Error ? err.message : strings.transcriptionErrors.generic);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Centerpiece Voice-First Robot Stage */}
      <div className="relative overflow-hidden rounded-card border border-stroke bg-white p-5 text-center shadow-soft sm:p-8">
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-cyan/20 blur-3xl" />

        <div className="relative flex flex-col items-center">
          <ChitthiRobot
            state={robotState}
            size="lg"
            audioLevel={activeAudioLevel}
            audioBands={activeAudioBands}
            statusLabel={strings.robotStatusLabels[robotState]}
            onClick={
              isSpeaking
                ? onStopSpeaking
                : latestResponse
                ? () => onSpeak(latestResponse.answerText)
                : handleMicToggle
            }
          />

          <div className="mt-2">
            <VoiceVisualizer
              active={isListening || isSpeaking}
              mode={isListening ? 'listening' : 'speaking'}
              audioLevel={activeAudioLevel}
              audioBands={activeAudioBands}
            />
          </div>

          <h2 className="mt-2 text-xl font-bold text-ink sm:text-2xl">
            {strings.talkToChitthiTitle}
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted">{strings.talkToChitthiSubtitle}</p>

          {/* Animated Circular Microphone Button */}
          <motion.button
            type="button"
            onClick={handleMicToggle}
            disabled={isTranscribing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isListening ? strings.recording : strings.holdToSpeak}
            aria-pressed={isListening}
            className={`mt-5 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-glow transition-colors disabled:opacity-60 sm:h-20 sm:w-20 ${
              isListening
                ? 'bg-danger animate-pulse'
                : 'bg-gradient-to-br from-primary to-indigo-600'
            }`}
          >
            {isListening ? (
              <Square className="h-7 w-7 fill-current" aria-hidden="true" />
            ) : micStatus === 'denied' ? (
              <MicOff className="h-7 w-7" aria-hidden="true" />
            ) : (
              <Mic className="h-7 w-7" aria-hidden="true" />
            )}
          </motion.button>

          <span className="mt-2 text-xs font-semibold text-primary">
            {isListening
              ? strings.recording
              : isTranscribing
              ? strings.transcribingLabel
              : strings.holdToSpeak}
          </span>

          {micStatus === 'denied' && !transcriptionError && (
            <p className="mt-2 text-xs font-medium text-warning">{strings.micDeniedMsg}</p>
          )}
        </div>

        {/* Recognized Speech & Text Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="relative mt-6 flex flex-col gap-2 sm:flex-row"
        >
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder={strings.typeQuestionPlaceholder}
            className="min-h-[48px] min-w-0 flex-1 rounded-full border border-stroke bg-canvas px-4 text-base text-ink"
          />
          <button
            type="submit"
            disabled={asking || !questionText.trim()}
            className="inline-flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            <span>{strings.send}</span>
          </button>
        </form>

        {/* Example Questions */}
        <div className="mt-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {strings.suggestedQuestionsTitle}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {strings.suggestedQuestions.map((sq) => (
              <button
                key={sq}
                type="button"
                disabled={asking}
                onClick={() => handleAsk(sq)}
                className="min-h-[44px] max-w-full whitespace-normal break-words rounded-full border border-stroke bg-canvas px-4 py-2 text-left text-xs font-medium text-ink hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 sm:text-sm"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {combinedError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-danger/30 bg-red-50 p-4 text-sm text-danger"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{combinedError}</span>
        </div>
      )}

      {/* Grounded Answer Card */}
      {latestResponse && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-card border p-5 shadow-soft ${
            latestResponse.needsClinician
              ? 'border-warning/35 bg-amber-50/70'
              : 'border-success/35 bg-emerald-50/60'
          }`}
        >
          {recognizedSpeech && (
            <p className="mb-2 break-words text-xs font-medium text-muted">
              {strings.youAskedLabel}: “{recognizedSpeech}”
            </p>
          )}

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              {latestResponse.needsClinician ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              )}
              <span>
                {latestResponse.answerStatus === 'answered'
                  ? strings.groundedStatus
                  : strings.needsClinicianStatus}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onSpeak(latestResponse.answerText)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-stroke bg-white px-4 text-xs font-semibold text-primary shadow-sm"
            >
              <Volume2 className="h-4 w-4" aria-hidden="true" />
              <span>{strings.listen}</span>
            </button>
          </div>

          <p className="mt-2.5 break-words text-base font-medium leading-relaxed text-ink">
            {latestResponse.answerText}
          </p>

          {latestResponse.sourceSnippets.length > 0 && (
            <p className="mt-2.5 break-words text-xs text-muted">
              <span className="font-semibold">{strings.sourceLabel}:</span> “
              {latestResponse.sourceSnippets[0]}”
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
