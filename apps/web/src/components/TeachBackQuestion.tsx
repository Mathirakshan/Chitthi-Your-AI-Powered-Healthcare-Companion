import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Mic,
  Pause,
  RefreshCw,
  Square,
  Users,
  Volume2,
} from 'lucide-react';
import type {
  TeachBackQuestionResponse,
  TeachBackVerifyResponse,
} from '@chitthi/shared';
import type { UIStrings } from '../i18n/translations';
import { ChitthiRobot, type RobotState } from './ChitthiRobot';
import { VoiceVisualizer } from './VoiceVisualizer';

interface TeachBackQuestionProps {
  question: TeachBackQuestionResponse | null;
  answer: string;
  result: TeachBackVerifyResponse | null;
  loading: boolean;
  error?: string | null;
  isRecording: boolean;
  isTranscribing: boolean;
  isSpeaking: boolean;
  audioLevel?: number;
  audioBands?: number[];
  transcriptionError: string | null;
  strings: UIStrings;
  onChangeAnswer: (val: string) => void;
  onSpeakQuestion: () => void;
  onToggleMic: () => void;
  onVerify: (overrideAnswer?: string) => void;
  onNextQuestion: () => void;
  onGoToCaregiver?: () => void;
}

export function TeachBackQuestion({
  question,
  answer,
  result,
  loading,
  error,
  isRecording,
  isTranscribing,
  isSpeaking,
  audioLevel = 0,
  audioBands,
  transcriptionError,
  strings,
  onChangeAnswer,
  onSpeakQuestion,
  onToggleMic,
  onVerify,
  onNextQuestion,
  onGoToCaregiver,
}: TeachBackQuestionProps) {
  const robotState: RobotState = isRecording
    ? 'listening'
    : loading || isTranscribing
    ? 'thinking'
    : isSpeaking
    ? 'speaking'
    : result?.result === 'correct'
    ? 'success'
    : result
    ? 'greeting'
    : 'idle';

  const busy = loading || isTranscribing;

  return (
    <div className="rounded-card border border-stroke bg-white p-5 shadow-soft sm:p-8">
      <div className="flex flex-col items-center text-center">
        <ChitthiRobot
          state={robotState}
          size="md"
          audioLevel={audioLevel}
          audioBands={audioBands}
          statusLabel={strings.robotStatusLabels[robotState]}
        />
        <div className="mt-1">
          <VoiceVisualizer
            active={isRecording || isSpeaking}
            mode={isRecording ? 'listening' : 'speaking'}
            audioLevel={audioLevel}
            audioBands={audioBands}
          />
        </div>
        <h1 className="mt-2 text-xl font-bold text-ink sm:text-2xl">{strings.teachBackHeader}</h1>
        <p className="mt-1 text-sm text-muted">{strings.teachBackSubheader}</p>
      </div>

      {!question && loading && (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-stroke bg-canvas p-6 text-sm font-medium text-muted">
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          <span>{strings.robotStatusLabels.thinking}...</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-red-50 p-3 text-sm text-danger"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {question && (
        <>
          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 flex-1 break-words text-base font-bold text-ink sm:text-lg">
                {question.questionText}
              </p>
              <button
                type="button"
                onClick={onSpeakQuestion}
                className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-stroke bg-white text-primary shadow-sm"
                aria-label={isSpeaking ? strings.pause : strings.listen}
              >
                {isSpeaking ? (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Large Tap Options */}
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {strings.quickOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={busy}
                onClick={() => {
                  onChangeAnswer(opt);
                  onVerify(opt);
                }}
                className={`min-h-[48px] min-w-0 break-words rounded-2xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                  answer === opt
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-stroke bg-canvas text-ink hover:border-primary/40'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={onToggleMic}
              disabled={isTranscribing}
              className={`flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white shadow-sm disabled:opacity-60 ${
                isRecording ? 'bg-danger animate-pulse' : 'bg-primary'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4 fill-current" aria-hidden="true" />
                  <span>{strings.recording}</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" aria-hidden="true" />
                  <span>{isTranscribing ? strings.transcribingLabel : strings.holdToSpeak}</span>
                </>
              )}
            </button>

            {transcriptionError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-danger/30 bg-red-50 p-3 text-sm text-danger"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{transcriptionError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!busy && answer.trim()) {
                  onVerify();
                }
              }}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <input
                type="text"
                value={answer}
                onChange={(e) => onChangeAnswer(e.target.value)}
                placeholder={strings.answerPlaceholder}
                className="min-h-[48px] min-w-0 flex-1 rounded-full border border-stroke bg-canvas px-4 text-base text-ink"
              />
              <button
                type="submit"
                disabled={busy || !answer.trim()}
                className="min-h-[48px] shrink-0 rounded-full bg-ink px-6 text-sm font-semibold text-white disabled:opacity-40"
              >
                {strings.checkAnswer}
              </button>
            </form>
          </div>
        </>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mt-5 rounded-2xl border p-4 ${
            result.result === 'correct'
              ? 'border-success/35 bg-emerald-50/70'
              : 'border-warning/35 bg-amber-50/70'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {result.result === 'correct' ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
            ) : (
              <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
            )}
            <p className="break-words text-base font-medium text-ink">{result.feedback}</p>
          </div>
        </motion.div>
      )}

      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={onNextQuestion}
          disabled={busy}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full border border-stroke bg-canvas px-4 text-sm font-semibold text-ink hover:bg-slate-100 disabled:opacity-60"
        >
          <RefreshCw className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{strings.nextQuestion}</span>
        </button>

        {onGoToCaregiver && (
          <button
            type="button"
            onClick={onGoToCaregiver}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{strings.goToCaregiver}</span>
          </button>
        )}
      </div>
    </div>
  );
}
