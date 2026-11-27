import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';

interface RobotSpeechBubbleProps {
  message: string;
  submessage?: string;
  onListen?: () => void;
  listenLabel?: string;
  variant?: 'default' | 'warning' | 'success';
}

export function RobotSpeechBubble({
  message,
  submessage,
  onListen,
  listenLabel = 'Listen',
  variant = 'default',
}: RobotSpeechBubbleProps) {
  const borderClass =
    variant === 'warning'
      ? 'border-warning/30 bg-amber-50/70'
      : variant === 'success'
      ? 'border-success/30 bg-emerald-50/70'
      : 'border-stroke bg-white/95';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-2xl border p-4 shadow-soft backdrop-blur-md ${borderClass}`}
    >
      <p className="break-words text-base font-semibold leading-relaxed text-ink">{message}</p>
      {submessage && <p className="mt-1 break-words text-sm text-muted">{submessage}</p>}
      {onListen && (
        <button
          type="button"
          onClick={onListen}
          className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-stroke bg-canvas px-4 text-xs font-semibold text-primary hover:border-primary/40 hover:bg-primary/5"
        >
          <Volume2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{listenLabel}</span>
        </button>
      )}
    </motion.div>
  );
}
