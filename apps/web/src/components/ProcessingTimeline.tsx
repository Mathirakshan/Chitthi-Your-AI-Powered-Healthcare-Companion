import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import type { UIStrings } from '../i18n/translations';
import { ChitthiRobot } from './ChitthiRobot';

interface ProcessingTimelineProps {
  activeStep: number;
  error: string | null;
  strings: UIStrings;
  onCancel: () => void;
  onRetry: () => void;
}

export function ProcessingTimeline({
  activeStep,
  error,
  strings,
  onCancel,
  onRetry,
}: ProcessingTimelineProps) {
  const steps = strings.processingSteps;
  const robotState = error ? 'warning' : activeStep >= steps.length ? 'success' : 'thinking';

  return (
    <div className="rounded-card border border-stroke bg-white p-5 shadow-soft sm:p-8">
      <div className="flex flex-col items-center text-center">
        <ChitthiRobot
          state={robotState}
          size="lg"
          statusLabel={strings.robotStatusLabels[robotState]}
        />
        <h2 className="mt-3 text-xl font-bold text-ink">
          {error ? strings.retry : `${steps[Math.min(activeStep, steps.length - 1)]}...`}
        </h2>
        <p className="mt-1 text-sm text-muted">{strings.uploadSubtitle}</p>
      </div>

      <div className="mt-6 space-y-3">
        {steps.map((label, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep && !error;
          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-center gap-3.5 rounded-2xl border p-4 transition-all ${
                isCurrent
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : isDone
                  ? 'border-success/30 bg-emerald-50/50'
                  : 'border-stroke bg-canvas opacity-65'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
              ) : isCurrent ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden="true" />
              ) : (
                <span className="h-5 w-5 shrink-0 rounded-full border-2 border-stroke" />
              )}
              <span className="text-base font-semibold text-ink">{label}</span>
            </motion.div>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-danger/30 bg-red-50 p-4 text-sm text-danger"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {error && (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[48px] flex-1 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm"
          >
            {strings.retry}
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[48px] flex-1 rounded-full border border-stroke bg-canvas px-5 text-sm font-semibold text-ink"
        >
          {strings.cancel}
        </button>
      </div>
    </div>
  );
}
