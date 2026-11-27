import { Mic, Sparkles, Volume2 } from 'lucide-react';

export type OrbState = 'idle' | 'speaking' | 'listening' | 'thinking';

interface AudioOrbProps {
  state: OrbState;
  label: string;
  sublabel?: string;
  onClick?: () => void;
}

export function AudioOrb({ state, label, sublabel, onClick }: AudioOrbProps) {
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  const isThinking = state === 'thinking';

  return (
    <div className="flex flex-col items-center text-center">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="group relative flex h-32 w-32 items-center justify-center rounded-full focus-visible:outline-none"
      >
        {/* Outer concentric ripple rings when active */}
        {(isSpeaking || isListening) && (
          <>
            <span
              className={`absolute inset-0 rounded-full animate-pulse-ring ${
                isListening ? 'bg-danger/25' : 'bg-primary/25'
              }`}
            />
            <span
              style={{ animationDelay: '0.6s' }}
              className={`absolute inset-0 rounded-full animate-pulse-ring ${
                isListening ? 'bg-danger/20' : 'bg-indigo-400/25'
              }`}
            />
          </>
        )}

        {/* Ambient halo */}
        <span
          className={`absolute inset-2 rounded-full blur-xl transition-opacity duration-500 ${
            isListening
              ? 'bg-danger/35 opacity-100'
              : isSpeaking
              ? 'bg-primary/45 opacity-100'
              : 'bg-primary/20 opacity-75 group-hover:opacity-100'
          }`}
        />

        {/* Core morphing AI orb */}
        <span
          className={`relative flex h-24 w-24 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 ${
            isListening
              ? 'bg-gradient-to-br from-danger via-rose-500 to-orange-500 animate-orb-speak'
              : isSpeaking
              ? 'bg-gradient-to-br from-primary via-indigo-500 to-sky-500 animate-orb-speak'
              : isThinking
              ? 'bg-gradient-to-br from-indigo-600 to-primary animate-pulse'
              : 'bg-gradient-to-br from-primary to-indigo-600 animate-orb-breathe'
          }`}
        >
          {isListening ? (
            <Mic className="h-9 w-9 drop-shadow" aria-hidden="true" />
          ) : isSpeaking ? (
            <div className="flex h-8 items-center gap-1" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((bar) => (
                <span
                  key={bar}
                  style={{ animationDelay: `${bar * 120}ms` }}
                  className="h-7 w-1.5 origin-center rounded-full bg-white animate-wave-bar"
                />
              ))}
            </div>
          ) : (
            <Volume2 className="h-8 w-8 drop-shadow transition-transform group-hover:scale-110" aria-hidden="true" />
          )}
        </span>
      </button>

      <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <span>{label}</span>
      </div>
      {sublabel && <p className="mt-0.5 text-xs text-muted">{sublabel}</p>}
    </div>
  );
}
