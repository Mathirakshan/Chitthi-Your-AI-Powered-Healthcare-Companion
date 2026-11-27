import { CheckCircle2, Loader2, AlertTriangle, FileText } from 'lucide-react';
import type { UIStrings } from '../i18n/translations';

interface ProcessingScreenProps {
  strings: UIStrings;
  activeStep: number;
  error: string | null;
  onCancel: () => void;
  onRetry: () => void;
}

export function ProcessingScreen({
  strings,
  activeStep,
  error,
  onCancel,
  onRetry,
}: ProcessingScreenProps) {
  return (
    <div className="rounded-card border border-stroke bg-card p-6 shadow-md animate-slide-up-fade">
      {/* Animated Document Scanner Visual */}
      {!error && (
        <div className="mb-6 flex justify-center">
          <div className="relative flex h-28 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-primary/30 bg-primary/5 shadow-inner">
            <FileText className="h-12 w-12 text-primary/40" aria-hidden="true" />
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_12px_#3157D5] animate-scan-beam" />
          </div>
        </div>
      )}

      <div className="space-y-3.5">
        {strings.processingSteps.map((stepLabel, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep && !error;
          return (
            <div
              key={stepLabel}
              className={`flex items-center gap-3.5 rounded-2xl border p-4 transition-all duration-300 ${
                isCurrent
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : isDone
                  ? 'border-success/30 bg-success/5'
                  : 'border-stroke bg-canvas opacity-70'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
              ) : isCurrent ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden="true" />
              ) : (
                <span className="h-5 w-5 shrink-0 rounded-full border-2 border-stroke" />
              )}
              <span className="text-base font-medium text-ink">{stepLabel}</span>
            </div>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {error && (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[48px] flex-1 rounded-full bg-primary px-5 text-base font-semibold text-white shadow-sm"
          >
            {strings.retry}
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[48px] flex-1 rounded-full border border-stroke bg-canvas px-5 text-base font-semibold text-ink"
        >
          {strings.cancel}
        </button>
      </div>
    </div>
  );
}
