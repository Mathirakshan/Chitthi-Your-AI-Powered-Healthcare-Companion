import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Mic,
  RefreshCw,
  Square,
  Users,
  Volume2,
} from 'lucide-react';
import type {
  SupportedLanguage,
  TeachBackQuestionResponse,
  TeachBackVerifyResponse,
} from '@chitthi/shared';
import type { UIStrings } from '../i18n/translations';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { api } from '../services/api';

interface TeachBackScreenProps {
  documentId: string;
  language: SupportedLanguage;
  strings: UIStrings;
  onSpeak: (text: string) => void;
  onBack: () => void;
  onGoToCaregiver: () => void;
}

export function TeachBackScreen({
  documentId,
  language,
  strings,
  onSpeak,
  onBack,
  onGoToCaregiver,
}: TeachBackScreenProps) {
  const { micStatus, startRecording, stopRecording } = useAudioRecorder();
  const [question, setQuestion] = useState<TeachBackQuestionResponse | null>(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<TeachBackVerifyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQuestion = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAnswer('');
    try {
      const q = await api.createTeachBackQuestion(documentId, language);
      setQuestion(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load teach-back question.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, [documentId, language]);

  const handleMicToggle = async () => {
    if (micStatus === 'recording') {
      const blob = await stopRecording();
      const res = await api.transcribeAudio(blob, language);
      setAnswer(res.transcript);
    } else {
      await startRecording();
    }
  };

  const handleVerify = async () => {
    if (!question || !answer.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyTeachBack(question.questionId, answer, language);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setLoading(false);
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

      <div className="rounded-card border border-stroke bg-card p-6 shadow-md">
        <h1 className="text-2xl font-bold text-ink">{strings.teachBackHeader}</h1>
        <p className="mt-1 text-base text-muted">{strings.teachBackSubheader}</p>

        {error && (
          <div role="alert" className="mt-4 rounded-xl bg-danger/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}

        {question && (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-lg font-semibold text-ink">{question.questionText}</p>
                <button
                  type="button"
                  onClick={() => onSpeak(question.questionText)}
                  className="inline-flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-full border border-stroke bg-card text-primary shadow-sm"
                  aria-label={strings.listen}
                >
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleMicToggle}
              className={`flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full px-6 text-base font-semibold text-white shadow-md ${
                micStatus === 'recording'
                  ? 'bg-danger animate-pulse'
                  : 'bg-gradient-to-r from-primary to-indigo-600'
              }`}
            >
              {micStatus === 'recording' ? (
                <>
                  <Square className="h-5 w-5 fill-current" aria-hidden="true" />
                  <span>{strings.recording}</span>
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" aria-hidden="true" />
                  <span>{strings.holdToSpeak}</span>
                </>
              )}
            </button>

            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={strings.answerPlaceholder}
              className="min-h-[48px] w-full rounded-full border border-stroke bg-canvas px-4 text-base text-ink"
            />

            <button
              type="button"
              onClick={handleVerify}
              disabled={loading || !answer.trim()}
              className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-base font-semibold text-white disabled:opacity-40"
            >
              <span>{strings.checkAnswer}</span>
            </button>

            {result && (
              <div
                className={`rounded-2xl border p-4 animate-slide-up-fade ${
                  result.result === 'correct'
                    ? 'border-success/40 bg-success/10 shadow-sm'
                    : 'border-warning/30 bg-warning/10'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {result.result === 'correct' ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                  ) : (
                    <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
                  )}
                  <p className="text-base font-medium text-ink">{result.feedback}</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={loadQuestion}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-stroke bg-canvas text-sm font-semibold text-ink hover:bg-stroke/30"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>{strings.nextQuestion}</span>
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onGoToCaregiver}
        className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full border border-stroke bg-card px-6 text-base font-semibold text-ink shadow-sm hover:border-primary/40 hover:bg-primary/5"
      >
        <Users className="h-5 w-5 text-primary" aria-hidden="true" />
        <span>{strings.goToCaregiver}</span>
      </button>
    </div>
  );
}
