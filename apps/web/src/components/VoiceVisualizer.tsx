import { motion } from 'framer-motion';

interface VoiceVisualizerProps {
  active: boolean;
  mode?: 'listening' | 'speaking';
  audioLevel?: number;
  audioBands?: number[];
  barCount?: number;
  className?: string;
}

export function VoiceVisualizer({
  active,
  mode = 'speaking',
  audioLevel = 0,
  audioBands,
  barCount = 12,
  className = '',
}: VoiceVisualizerProps) {
  const colorClass = mode === 'listening' ? 'bg-cyan' : 'bg-primary';
  const clampedLevel = Math.min(1, Math.max(0, audioLevel));

  return (
    <div
      className={`inline-flex h-11 items-center justify-center gap-1 rounded-full border px-3.5 transition-colors sm:gap-1.5 ${
        active
          ? mode === 'listening'
            ? 'border-cyan/50 bg-cyan/10'
            : 'border-primary/25 bg-primary/5'
          : 'border-transparent bg-transparent'
      } ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: barCount }).map((_, idx) => {
        // Symmetric center-weighted mapping across available audio bands
        const symIdx = Math.abs(idx - (barCount - 1) / 2) / ((barCount - 1) / 2);
        const rawBand =
          audioBands && audioBands.length > idx
            ? audioBands[idx]
            : clampedLevel * (1 - symIdx * 0.45);
        const effective = Math.min(1, Math.max(0.05, rawBand * 0.85 + clampedLevel * 0.25));
        const targetHeight = active ? Math.round(7 + effective * 27) : 5;

        return (
          <motion.span
            key={idx}
            className={`w-1 rounded-full transition-colors sm:w-1.5 ${colorClass} ${
              active ? 'opacity-95' : 'opacity-25'
            }`}
            animate={{ height: targetHeight }}
            transition={{ duration: 0.055, ease: 'linear' }}
          />
        );
      })}
    </div>
  );
}
