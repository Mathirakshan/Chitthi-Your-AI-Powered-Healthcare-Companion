import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  Volume2,
} from 'lucide-react';
import type {
  ExplanationResponse,
  QuestionResponse,
  SupportedLanguage,
} from '@chitthi/shared';
import type { UIStrings } from '../i18n/translations';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { api } from '../services/api';
import { AudioOrb, type OrbState } from '../components/AudioOrb';

interface VoiceScreenProps {
  documentId: string;
  language: SupportedLanguage;
  explanation: ExplanationResponse;
  strings: UIStrings;
  isSpeaking: boolean;
  onSpeak: (text: string, rate?: number) => void;
  onStopSpeaking: () => void;
  onBack: () => void;
  onGoToTeachBack: () => void;
}

interface SessionTurn {
  id: string;
  question: string;
  response: QuestionResponse;
}

export function VoiceScreen({
  documentId,
  language,
  explanation,
  strings,
  isSpeaking,
  onSpeak,
  onStopSpeaking,
  onBack,
  onGoToTeachBack,
}: VoiceScreenProps) {
  const { micStatus, startRecording, stopRecording } = useAudioRecorder();
  const [questionText, setQuestionText] = useState('');
  const [asking, setAsking] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [activeChapterIdx, setActiveChapterIdx] = useState<number | null>(null);
  const [sessionTurns, setSessionTurns] = useState<SessionTurn[]>([]);
  const [error, setError] = useState<string | null>(null);

  const orbState: OrbState =
    micStatus === 'recording'
      ? 'listening'
      : asking || transcribing
      ? 'thinking'
      : isSpeaking
      ? 'speaking'
      : 'idle';

  const orbLabel =
    orbState === 'listening'
      ? strings.recording
      : orbState === 'speaking'
      ? strings.pause
      : strings.listen;

  const handleOrbClick = () => {
    if (isSpeaking) {
      onStopSpeaking();
      setActiveChapterIdx(null);
    } else {
      setActiveChapterIdx(null);
      onSpeak(explanation.summary, 1.0);
    }
  };

  const handlePlayChapter = (idx: number, text: string) => {
    if (isSpeaking && activeChapterIdx === idx) {
      onStopSpeaking();
      setActiveChapterIdx(null);
      return;
    }
    setActiveChapterIdx(idx);
    onSpeak(text, 1.0);
  };

  const handleMicToggle = async () => {
    setError(null);
    if (micStatus === 'recording') {
      const blob = await stopRecording();
      setTranscribing(true);
      try {
        const res = await api.transcribeAudio(blob, language);
        setQuestionText(res.transcript);
      } catch {
        setError('Could not transcribe audio. Please type your question.');
      } finally {
        setTranscribing(false);
      }
    } else {
      onStopSpeaking();
      setActiveChapterIdx(null);
      await startRecording();
    }
  };

  const handleAsk = async (textToAsk?: string) => {
    const q = (textToAsk ?? questionText).trim();
    if (!q) return;
    setError(null);
    setAsking(true);
    setActiveChapterIdx(null);
    try {
      const res = await api.askQuestion(documentId, q, language);
      setSessionTurns((prev) => [
        { id: `${Date.now()}`, question: q, response: res },
        ...prev,
      ]);
      setQuestionText('');
      // Speak the grounded answer immediately in response to the user's question
      onSpeak(res.answerText, 1.0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to answer question.');
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="space-y-5 animate-slide-up-fade">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>{strings.back}</span>
      </button>

      {/* Interactive AI Audio Session Explainer Hero */}
      <section className="relative overflow-hidden rounded-card border border-stroke bg-card p-6 shadow-md">
        <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-primary/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-14 -left-14 h-44 w-44 rounded-full bg-indigo-400/10 blur-2xl" />

        <div className="relative flex flex-col items-center">
          <h1 className="text-center text-2xl font-bold text-ink">{strings.voiceHeader}</h1>

          <div className="my-5">
            <AudioOrb
              state={orbState}
              label={orbLabel}
              sublabel="Tap orb to play or pause audio session"
              onClick={handleOrbClick}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {!isSpeaking ? (
              <button
                type="button"
                onClick={() => {
                  setActiveChapterIdx(null);
                  onSpeak(explanation.summary, 1.0);
                }}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                <span>{strings.listen}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onStopSpeaking();
                  setActiveChapterIdx(null);
                }}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white shadow-sm"
              >
                <Pause className="h-4 w-4" aria-hidden="true" />
                <span>{strings.pause}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setActiveChapterIdx(null);
                onSpeak(explanation.summary, 1.0);
              }}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-stroke bg-canvas px-4 text-sm font-medium text-ink"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>{strings.replay}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveChapterIdx(null);
                onSpeak(explanation.summary, 0.8);
              }}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-stroke bg-canvas px-4 text-sm font-medium text-ink"
            >
              <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{strings.slower}</span>
            </button>
          </div>
        </div>

        {/* Interactive Audio Chapters */}
        <div className="mt-6 space-y-3">
          {explanation.sections.map((sec, idx) => {
            const isChapterPlaying = isSpeaking && activeChapterIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePlayChapter(idx, sec.text)}
                className={`w-full rounded-2xl border p-4 text-left transition-all ${
                  isChapterPlaying
                    ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20'
                    : 'border-stroke bg-canvas hover:border-primary/40 hover:bg-card'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-ink">{sec.title}</span>
                  {isChapterPlaying ? (
                    <div className="flex h-5 items-center gap-0.5" aria-hidden="true">
                      {[0, 1, 2, 3].map((b) => (
                        <span
                          key={b}
                          style={{ animationDelay: `${b * 100}ms` }}
                          className="h-4 w-1 rounded-full bg-primary animate-wave-bar"
                        />
                      ))}
                    </div>
                  ) : (
                    <Play className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  )}
                </div>
                <p className="mt-1.5 text-base leading-relaxed text-ink/90">{sec.text}</p>
              </button>
            );
          })}
        </div>

        {explanation.warnings.length > 0 && (
          <div className="mt-4 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-ink">
            {explanation.warnings.map((w, i) => (
              <p key={i} className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                <span>{w}</span>
              </p>
            ))}
          </div>
        )}
      </section>

      {/* Interactive Voice Q&A Session */}
      <section className="rounded-card border border-stroke bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold text-ink">{strings.askQuestionTitle}</h2>

        <div className="mt-4 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleMicToggle}
            disabled={transcribing}
            className={`flex min-h-[60px] w-full items-center justify-center gap-3 rounded-full px-6 text-base font-semibold shadow-md transition-all ${
              micStatus === 'recording'
                ? 'bg-danger text-white shadow-danger/25 animate-pulse'
                : 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-primary/20 hover:shadow-lg'
            }`}
          >
            {micStatus === 'recording' ? (
              <>
                <Square className="h-5 w-5 fill-current" aria-hidden="true" />
                <span>{strings.recording}</span>
              </>
            ) : micStatus === 'denied' ? (
              <>
                <MicOff className="h-5 w-5" aria-hidden="true" />
                <span>{strings.holdToSpeak}</span>
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" aria-hidden="true" />
                <span>{transcribing ? '...' : strings.holdToSpeak}</span>
              </>
            )}
          </button>

          {micStatus === 'denied' && (
            <p className="text-center text-sm text-warning">{strings.micDeniedMsg}</p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="mt-4 flex gap-2"
        >
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder={strings.typeQuestionPlaceholder}
            className="min-h-[48px] flex-1 rounded-full border border-stroke bg-canvas px-4 text-base text-ink"
          />
          <button
            type="submit"
            disabled={asking || !questionText.trim()}
            className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{strings.send}</span>
          </button>
        </form>

        {/* Suggested questions */}
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {strings.suggestedQuestionsTitle}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {strings.suggestedQuestions.map((sq) => (
              <button
                key={sq}
                type="button"
                onClick={() => handleAsk(sq)}
                className="min-h-[40px] rounded-full border border-stroke bg-canvas px-3.5 py-1.5 text-left text-sm text-ink hover:border-primary/50 hover:bg-primary/5"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div role="alert" className="mt-4 rounded-xl bg-danger/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Interactive Audio Session History */}
        {sessionTurns.length > 0 && (
          <div className="mt-5 space-y-3">
            {sessionTurns.map((turn) => (
              <div
                key={turn.id}
                className={`rounded-2xl border p-4 animate-slide-up-fade ${
                  turn.response.needsClinician
                    ? 'border-warning/40 bg-warning/10'
                    : 'border-success/30 bg-success/5'
                }`}
              >
                <div className="mb-2 text-xs font-medium text-muted">“{turn.question}”</div>

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {turn.response.needsClinician ? (
                      <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                    )}
                    <span>
                      {turn.response.answerStatus === 'answered'
                        ? strings.statusConfirmed
                        : strings.statusPleaseCheck}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSpeak(turn.response.answerText, 1.0)}
                    className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-stroke bg-card px-3 text-xs font-semibold text-ink shadow-sm"
                  >
                    <Volume2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <span>{strings.listen}</span>
                  </button>
                </div>

                <p className="mt-2 text-base leading-relaxed text-ink">
                  {turn.response.answerText}
                </p>

                {turn.response.sourceSnippets.length > 0 && (
                  <p className="mt-2 text-xs text-muted">
                    <span className="font-semibold">{strings.sourceLabel}:</span> “
                    {turn.response.sourceSnippets[0]}”
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={onGoToTeachBack}
        className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-indigo-600 px-6 text-base font-semibold text-white shadow-md shadow-primary/20 hover:shadow-lg"
      >
        <Sparkles className="h-5 w-5" aria-hidden="true" />
        <span>{strings.goToTeachBack}</span>
      </button>
    </div>
  );
}
