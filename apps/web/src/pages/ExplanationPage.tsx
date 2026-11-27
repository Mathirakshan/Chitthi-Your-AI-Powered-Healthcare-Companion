import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Mic, Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import type {
  DocumentSummary,
  ExplanationResponse,
  SupportedLanguage,
} from '@chitthi/shared';
import type { UIStrings } from '../i18n/translations';
import { ChitthiRobot } from '../components/ChitthiRobot';
import { RobotSpeechBubble } from '../components/RobotSpeechBubble';
import { VoiceVisualizer } from '../components/VoiceVisualizer';
import { LanguageSelector } from '../components/LanguageSelector';

interface ExplanationPageProps {
  document: DocumentSummary;
  language: SupportedLanguage;
  explanation: ExplanationResponse;
  strings: UIStrings;
  isSpeaking: boolean;
  audioLevel?: number;
  audioBands?: number[];
  onChangeLanguage: (lang: SupportedLanguage) => void;
  onSpeak: (text: string, rate?: number) => void;
  onStopSpeaking: () => void;
  onGoToAssistant: () => void;
  onGoToTeachBack: () => void;
}

export function ExplanationPage({
  document,
  language,
  explanation,
  strings,
  isSpeaking,
  audioLevel = 0,
  audioBands,
  onChangeLanguage,
  onSpeak,
  onStopSpeaking,
  onGoToAssistant,
  onGoToTeachBack,
}: ExplanationPageProps) {
  const [activeCardIdx, setActiveCardIdx] = useState<number | null>(null);
  const robotState = isSpeaking ? 'speaking' : 'idle';

  useEffect(() => {
    if (!isSpeaking) {
      setActiveCardIdx(null);
    }
  }, [isSpeaking]);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-stroke bg-white p-4 shadow-soft">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            {strings.nav.documents}
          </p>
          <h1 className="truncate text-base font-extrabold text-ink sm:text-lg">
            {document.filename}
          </h1>
        </div>
        <LanguageSelector language={language} onChange={onChangeLanguage} variant="header" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left/Main: Simple Language Instruction Cards */}
        <div className="min-w-0 space-y-4 lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            {!isSpeaking ? (
              <button
                type="button"
                onClick={() => {
                  setActiveCardIdx(null);
                  onSpeak(explanation.summary, 1.0);
                }}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white shadow-glow"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                <span>{strings.listen}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onStopSpeaking();
                  setActiveCardIdx(null);
                }}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-white"
              >
                <Pause className="h-4 w-4" aria-hidden="true" />
                <span>{strings.pause}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setActiveCardIdx(null);
                onSpeak(explanation.summary, 1.0);
              }}
              className="inline-flex min-h-[46px] items-center gap-1.5 rounded-full border border-stroke bg-white px-4 text-sm font-semibold text-ink"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>{strings.replay}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveCardIdx(null);
                onSpeak(explanation.summary, 0.8);
              }}
              className="inline-flex min-h-[46px] items-center gap-1.5 rounded-full border border-stroke bg-white px-4 text-sm font-semibold text-ink"
            >
              <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{strings.slower}</span>
            </button>
          </div>

          {explanation.sections.map((sec, idx) => {
            const playingThis = isSpeaking && activeCardIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-card border p-4 shadow-soft transition-all sm:p-5 ${
                  playingThis
                    ? 'border-primary bg-primary/[0.03] ring-2 ring-primary/20'
                    : 'border-stroke bg-white'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2.5">
                  <h2 className="min-w-0 flex-1 break-words text-lg font-bold text-ink">
                    {sec.title}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      if (playingThis) {
                        onStopSpeaking();
                        setActiveCardIdx(null);
                      } else {
                        setActiveCardIdx(idx);
                        onSpeak(sec.text, 1.0);
                      }
                    }}
                    className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-4 text-xs font-semibold transition ${
                      playingThis
                        ? 'border-ink bg-ink text-white'
                        : 'border-stroke bg-canvas text-primary hover:border-primary/40'
                    }`}
                  >
                    {playingThis ? (
                      <>
                        <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{strings.pause}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{strings.listen}</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="mt-2 break-words text-base leading-relaxed text-ink/90">{sec.text}</p>

                {sec.sourceQuotes.length > 0 && (
                  <p className="mt-3 break-words text-xs text-muted">
                    <span className="font-semibold">{strings.sourceLabel}:</span> “
                    {sec.sourceQuotes[0]}”
                  </p>
                )}
              </div>
            );
          })}

          {explanation.warnings.length > 0 && (
            <div className="rounded-card border border-warning/35 bg-amber-50 p-4 text-sm text-amber-900">
              {explanation.warnings.map((w, i) => (
                <p key={i} className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                  <span>{w}</span>
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: AI Robot Explainer + Actions */}
        <div className="min-w-0 space-y-4">
          <div className="rounded-card border border-stroke bg-white p-5 text-center shadow-soft sm:p-6 lg:sticky lg:top-24">
            <ChitthiRobot
              state={robotState}
              size="lg"
              audioLevel={audioLevel}
              audioBands={audioBands}
              statusLabel={strings.robotStatusLabels[robotState]}
            />
            <div className="mt-2">
              <VoiceVisualizer
                active={isSpeaking}
                mode="speaking"
                audioLevel={audioLevel}
                audioBands={audioBands}
              />
            </div>

            <div className="mt-3">
              <RobotSpeechBubble
                message={strings.voiceHeader}
                submessage={strings.reviewSubheader}
              />
            </div>

            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={onGoToAssistant}
                className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white shadow-glow"
              >
                <Mic className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{strings.askByVoiceBtn}</span>
              </button>

              <button
                type="button"
                onClick={onGoToTeachBack}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-stroke bg-canvas px-5 text-sm font-bold text-ink hover:border-primary/40"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                <span>{strings.goToTeachBack}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
