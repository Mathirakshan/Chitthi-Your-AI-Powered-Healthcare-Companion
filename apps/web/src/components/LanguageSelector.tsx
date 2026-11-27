import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@chitthi/shared';

interface LanguageSelectorProps {
  language: SupportedLanguage;
  onChange: (lang: SupportedLanguage) => void;
  compact?: boolean;
  variant?: 'card' | 'pill' | 'sidebar' | 'header';
}

const SHORT_LABELS: Record<SupportedLanguage, string> = {
  'en-IN': 'EN',
  'ta-IN': 'தமிழ்',
  'hi-IN': 'हिंदी',
};

export function LanguageSelector({
  language,
  onChange,
  compact = false,
  variant,
}: LanguageSelectorProps) {
  const mode = variant ?? (compact ? 'pill' : 'card');

  if (mode === 'sidebar') {
    return (
      <div
        role="group"
        aria-label="Language"
        className="grid w-full grid-cols-3 gap-1 rounded-2xl border border-stroke bg-canvas p-1"
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const active = lang.code === language;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onChange(lang.code)}
              aria-pressed={active}
              className={`flex min-h-[44px] items-center justify-center rounded-xl px-1 text-[11px] font-semibold transition sm:text-xs ${
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:bg-white hover:text-ink'
              }`}
            >
              <span className="truncate">{lang.nativeLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (mode === 'header') {
    return (
      <div
        role="group"
        aria-label="Language"
        className="inline-flex shrink-0 items-center rounded-full border border-stroke bg-canvas p-0.5 shadow-sm"
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const active = lang.code === language;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onChange(lang.code)}
              aria-pressed={active}
              aria-label={lang.englishLabel}
              className={`flex min-h-[44px] items-center justify-center rounded-full px-2 text-[11px] font-semibold transition sm:px-3 sm:text-xs ${
                active ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <span className="sm:hidden">{SHORT_LABELS[lang.code]}</span>
              <span className="hidden sm:inline">{lang.nativeLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (mode === 'pill') {
    return (
      <div
        role="group"
        aria-label="Language"
        className="inline-flex flex-wrap items-center rounded-full border border-stroke bg-card p-1 shadow-sm"
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const active = lang.code === language;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onChange(lang.code)}
              aria-pressed={active}
              className={`flex min-h-[44px] items-center justify-center rounded-full px-3.5 text-xs font-semibold transition ${
                active ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              {lang.nativeLabel}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {SUPPORTED_LANGUAGES.map((lang) => {
        const active = lang.code === language;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onChange(lang.code)}
            aria-pressed={active}
            className={`flex min-h-[60px] items-center justify-between rounded-card border p-4 text-left transition-all ${
              active
                ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20'
                : 'border-stroke bg-card hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft'
            }`}
          >
            <div>
              <div className="text-lg font-bold text-ink">{lang.nativeLabel}</div>
              <div className="text-xs text-muted">{lang.englishLabel}</div>
            </div>
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
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
  );
}
