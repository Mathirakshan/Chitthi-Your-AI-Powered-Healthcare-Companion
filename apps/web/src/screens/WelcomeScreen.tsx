import { FileText, Sparkles, Volume2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@chitthi/shared';
import type { UIStrings } from '../i18n/translations';
import { AudioOrb } from '../components/AudioOrb';

interface WelcomeScreenProps {
  language: SupportedLanguage;
  strings: UIStrings;
  isSpeaking: boolean;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onStartDocument: () => void;
  onTrySample: () => void;
  onPlayGreeting: () => void;
}

export function WelcomeScreen({
  language,
  strings,
  isSpeaking,
  onSelectLanguage,
  onStartDocument,
  onTrySample,
  onPlayGreeting,
}: WelcomeScreenProps) {
  return (
    <div className="space-y-6 animate-slide-up-fade">
      {/* Hero Card with Interactive Greeting Orb */}
      <div className="relative overflow-hidden rounded-card border border-stroke bg-card/90 p-6 shadow-md backdrop-blur">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-indigo-400/10 blur-2xl" />

        <div className="relative flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Voice-first care guide</span>
          </div>

          <div className="mt-5">
            <AudioOrb
              state={isSpeaking ? 'speaking' : 'idle'}
              label={strings.listen}
              onClick={onPlayGreeting}
            />
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {strings.appTitle}
          </h1>
          <p className="mt-2 max-w-sm text-base leading-relaxed text-muted">{strings.tagline}</p>

          <button
            type="button"
            onClick={onPlayGreeting}
            className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-stroke bg-canvas px-4 text-sm font-medium text-ink shadow-sm hover:border-primary/40 hover:bg-primary/5"
          >
            <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>{strings.listen}</span>
          </button>
        </div>
      </div>

      {/* Language Selector */}
      <section aria-labelledby="lang-heading" className="space-y-3 animate-slide-up-fade stagger-2">
        <h2 id="lang-heading" className="text-sm font-semibold uppercase tracking-wide text-muted">
          {strings.chooseLanguage}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const active = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onSelectLanguage(lang.code)}
                className={`flex min-h-[60px] items-center justify-between rounded-card border p-4 text-left transition-all ${
                  active
                    ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20'
                    : 'border-stroke bg-card hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm'
                }`}
                aria-pressed={active}
              >
                <div>
                  <div className="text-lg font-semibold text-ink">{lang.nativeLabel}</div>
                  <div className="text-xs text-muted">{lang.englishLabel}</div>
                </div>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                    active ? 'border-primary bg-primary' : 'border-stroke'
                  }`}
                  aria-hidden="true"
                >
                  {active && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Primary Actions */}
      <div className="space-y-3 pt-1 animate-slide-up-fade stagger-3">
        <button
          type="button"
          onClick={onStartDocument}
          className="flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-primary to-indigo-600 px-6 text-base font-semibold text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30"
        >
          <FileText className="h-5 w-5" aria-hidden="true" />
          <span>{strings.startWithDocument}</span>
        </button>

        <button
          type="button"
          onClick={onTrySample}
          className="flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-full border border-stroke bg-card px-6 text-base font-semibold text-ink shadow-sm hover:border-primary/40 hover:bg-primary/5"
        >
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          <span>{strings.trySampleDocument}</span>
        </button>
      </div>
    </div>
  );
}
