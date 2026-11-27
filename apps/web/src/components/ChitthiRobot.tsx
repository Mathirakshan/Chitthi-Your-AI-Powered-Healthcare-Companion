import { motion } from 'framer-motion';

export type RobotState =
  | 'idle'
  | 'greeting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'success'
  | 'warning';

interface ChitthiRobotProps {
  state?: RobotState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  audioLevel?: number;
  audioBands?: number[];
  statusLabel?: string;
  className?: string;
  onClick?: () => void;
}

const SIZE_MAP = {
  sm: 'w-20 h-24',
  md: 'w-24 h-28 sm:w-28 sm:h-32',
  lg: 'w-28 h-32 sm:w-36 sm:h-40 md:w-40 md:h-44',
  hero: 'w-40 h-44 sm:w-52 sm:h-60 md:w-60 md:h-68',
};

// 7-bar articulated mouth mapped across the 12 speech-band frequencies
const MOUTH_BAND_INDICES = [0, 2, 4, 6, 8, 9, 11];

export function ChitthiRobot({
  state = 'idle',
  size = 'md',
  audioLevel = 0,
  audioBands,
  statusLabel,
  className = '',
  onClick,
}: ChitthiRobotProps) {
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'thinking';
  const isSuccess = state === 'success';
  const isWarning = state === 'warning';
  const isGreeting = state === 'greeting';

  const clampedLevel = Math.min(1, Math.max(0, audioLevel));

  // Derive natural left/right cadence balance from real audio bands while speaking
  const lowBand =
    audioBands && audioBands.length >= 4
      ? (audioBands[0] + audioBands[1] + audioBands[2] + audioBands[3]) / 4
      : clampedLevel;
  const highBand =
    audioBands && audioBands.length >= 10
      ? (audioBands[6] + audioBands[7] + audioBands[8] + audioBands[9]) / 4
      : clampedLevel;

  const eyeColor = isWarning
    ? '#F59E0B'
    : isSuccess
    ? '#34D399'
    : isListening
    ? '#22D3EE'
    : isThinking
    ? '#A5B4FC'
    : '#60A5FA';

  const haloClass = isWarning
    ? 'bg-amber-400/25'
    : isSuccess
    ? 'bg-emerald-400/35'
    : isListening
    ? 'bg-cyan/45'
    : isThinking
    ? 'bg-indigo-400/30'
    : 'bg-primary/25';

  // Compute 7 synchronized mouth bar heights (0..1) from real audio telemetry
  const mouthBars = MOUTH_BAND_INDICES.map((bandIdx, i) => {
    if (!isSpeaking) return 0;
    const rawBand =
      audioBands && audioBands.length > bandIdx ? audioBands[bandIdx] : clampedLevel;
    const centerBias = 1 - Math.abs(i - 3) * 0.11;
    return Math.min(1, Math.max(0.1, (rawBand * 0.8 + clampedLevel * 0.35) * centerBias));
  });

  const headTransform = isThinking
    ? { rotate: [4, 9, 4], y: [0, -2, 0] }
    : isListening
    ? { rotate: -5 - clampedLevel * 2, y: -2 - clampedLevel * 3 }
    : isSpeaking
    ? {
        rotate: (lowBand - highBand) * 6,
        y: -1 - clampedLevel * 3.5,
      }
    : isSuccess
    ? { rotate: [0, -5, 5, 0], y: [0, -5, 0] }
    : isGreeting
    ? { rotate: [-4, 4, -4], y: [0, -2, 0] }
    : { rotate: [-1.2, 1.2, -1.2], y: [0, -1.5, 0] };

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <motion.div
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        whileHover={onClick ? { scale: 1.04, y: -3 } : undefined}
        whileTap={onClick ? { scale: 0.96 } : undefined}
        aria-label={onClick ? `Chitthi AI Assistant (${state})` : undefined}
        className={`relative inline-flex items-center justify-center rounded-3xl select-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 ${
          onClick ? 'cursor-pointer' : ''
        } ${SIZE_MAP[size]}`}
        animate={
          isListening
            ? { y: -2 - clampedLevel * 4, scale: 1 + clampedLevel * 0.04 }
            : isSpeaking
            ? { y: -2 - clampedLevel * 3.5, scale: 1 + clampedLevel * 0.03 }
            : isSuccess
            ? { y: [0, -12, 0, -6, 0], scale: [1, 1.06, 1, 1.03, 1] }
            : isThinking
            ? { y: [0, -5, 0] }
            : { y: [0, -6, 0] }
        }
        transition={
          isListening || isSpeaking
            ? { type: 'spring', stiffness: 280, damping: 20 }
            : isSuccess
            ? { duration: 1.4, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }
            : { duration: isThinking ? 2.2 : 3.6, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        {/* Ambient Aura driven by state & live audio */}
        <motion.div
          className={`absolute inset-2 rounded-full blur-2xl ${haloClass}`}
          animate={{
            scale:
              isListening || isSpeaking
                ? 1 + clampedLevel * 0.32
                : isSuccess
                ? [1, 1.26, 1.06]
                : [1, 1.09, 1],
            opacity:
              isListening || isSpeaking
                ? 0.5 + clampedLevel * 0.45
                : isSuccess
                ? [0.65, 0.92, 0.65]
                : [0.45, 0.72, 0.45],
          }}
          transition={
            isListening || isSpeaking
              ? { duration: 0.08 }
              : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
          }
        />

        {/* Audio-reactive Concentric Rings when Listening or Speaking */}
        {(isListening || isSpeaking) && (
          <>
            <motion.div
              className={`absolute inset-1 rounded-full border-2 ${
                isListening ? 'border-cyan/65' : 'border-primary/50'
              }`}
              animate={{
                scale: 0.92 + clampedLevel * 0.38,
                opacity: 0.25 + clampedLevel * 0.7,
              }}
              transition={{ duration: 0.07 }}
            />
            <motion.div
              className={`absolute inset-1 rounded-full border ${
                isListening ? 'border-cyan/40' : 'border-indigo-400/40'
              }`}
              animate={{
                scale: 1.02 + clampedLevel * 0.52,
                opacity: 0.15 + clampedLevel * 0.5,
              }}
              transition={{ duration: 0.1 }}
            />
          </>
        )}

        {/* Futuristic Healthcare Robot SVG */}
        <svg
          viewBox="0 0 220 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 h-full w-full drop-shadow-[0_16px_28px_rgba(23,37,84,0.14)]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="robotBodyGrad" x1="35" y1="20" x2="185" y2="230" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="visorGrad" x1="55" y1="48" x2="165" y2="112" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#67E8F9" />
            </linearGradient>
          </defs>

          {/* Ground Shadow */}
          <motion.ellipse
            cx="110"
            cy="236"
            rx="46"
            ry="8"
            fill="#172554"
            animate={{
              rx: isSuccess ? [46, 35, 46] : 46 - clampedLevel * 6,
              fillOpacity: isSuccess ? [0.12, 0.06, 0.12] : 0.1,
            }}
            transition={{ duration: isSuccess ? 1.4 : 0.15 }}
          />

          {/* Success Sparkles */}
          {isSuccess && (
            <g>
              <motion.path
                d="M34 44L38 35L42 44L51 48L42 52L38 61L34 52L25 48Z"
                fill="#34D399"
                animate={{ scale: [0.6, 1.2, 0.85], opacity: [0.4, 1, 0.7] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ originX: '38px', originY: '48px' }}
              />
              <motion.path
                d="M180 34L183 27L186 34L193 37L186 40L183 47L180 40L173 37Z"
                fill="#60A5FA"
                animate={{ scale: [0.6, 1.25, 0.85], opacity: [0.4, 1, 0.7] }}
                transition={{ duration: 1.3, delay: 0.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ originX: '183px', originY: '37px' }}
              />
              <motion.circle
                cx="196"
                cy="104"
                r="4"
                fill="#34D399"
                animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </g>
          )}

          {/* Left Arm with Expressive State Gestures */}
          <motion.g
            animate={
              isGreeting
                ? { rotate: [-12, 34, -8, 30, -12], y: -2 }
                : isSuccess
                ? { rotate: [28, 42, 28], y: [-4, -8, -4] }
                : isThinking
                ? { rotate: [12, 16, 12], y: -1 }
                : isSpeaking
                ? { rotate: -4 - lowBand * 18, y: -lowBand * 5 }
                : isListening
                ? { rotate: 10 + clampedLevel * 7, y: -2 - clampedLevel * 3 }
                : { rotate: [0, 3.5, 0], y: 0 }
            }
            transition={
              isSpeaking || isListening
                ? { duration: 0.1 }
                : isGreeting
                ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                : isSuccess
                ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                : isThinking
                ? { duration: 2.0, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
            }
            style={{ originX: '48px', originY: '146px' }}
          >
            <rect
              x="26"
              y="138"
              width="22"
              height="52"
              rx="11"
              fill="url(#robotBodyGrad)"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
            <circle cx="37" cy="148" r="4" fill="url(#accentGrad)" />
          </motion.g>

          {/* Right Arm with Expressive State Gestures */}
          <motion.g
            animate={
              isSuccess
                ? { rotate: [-28, -42, -28], y: [-4, -8, -4] }
                : isThinking
                ? { rotate: [-34, -40, -34], y: [-6, -9, -6] }
                : isSpeaking
                ? { rotate: 4 + highBand * 18, y: -highBand * 5 }
                : isListening
                ? { rotate: -10 - clampedLevel * 7, y: -2 - clampedLevel * 3 }
                : { rotate: [0, -3.5, 0], y: 0 }
            }
            transition={
              isSpeaking || isListening
                ? { duration: 0.1 }
                : isSuccess
                ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                : isThinking
                ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
            }
            style={{ originX: '172px', originY: '146px' }}
          >
            <rect
              x="172"
              y="138"
              width="22"
              height="52"
              rx="11"
              fill="url(#robotBodyGrad)"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
            <circle cx="183" cy="148" r="4" fill="url(#accentGrad)" />
          </motion.g>

          {/* Torso */}
          <rect
            x="56"
            y="130"
            width="108"
            height="84"
            rx="38"
            fill="url(#robotBodyGrad)"
            stroke="#CBD5E1"
            strokeWidth="2"
          />
          <path
            d="M74 142C86 136 134 136 146 142"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Chest Core Indicator */}
          <circle cx="110" cy="170" r="17" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
          {isThinking && (
            <motion.circle
              cx="110"
              cy="170"
              r="13"
              stroke="#818CF8"
              strokeWidth="2"
              strokeDasharray="6 6"
              fill="none"
              animate={{ rotate: 360 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              style={{ originX: '110px', originY: '170px' }}
            />
          )}
          {(isSpeaking || isListening) && (
            <motion.circle
              cx="110"
              cy="170"
              r="13"
              stroke={eyeColor}
              strokeWidth="1.5"
              fill="none"
              animate={{
                scale: 0.9 + clampedLevel * 0.4,
                opacity: 0.35 + clampedLevel * 0.65,
              }}
              transition={{ duration: 0.08 }}
              style={{ originX: '110px', originY: '170px' }}
            />
          )}
          {isSuccess ? (
            <motion.path
              d="M102 170L108 176L119 164"
              stroke="#10B981"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45 }}
            />
          ) : (
            <motion.circle
              cx="110"
              cy="170"
              r="8"
              fill={eyeColor}
              animate={
                isSpeaking || isListening
                  ? { scale: 0.88 + clampedLevel * 0.5, opacity: 0.78 + clampedLevel * 0.22 }
                  : isThinking
                  ? { scale: [0.8, 1.25, 0.8], opacity: [0.45, 1, 0.45] }
                  : { scale: [1, 1.1, 1], opacity: [0.78, 1, 0.78] }
              }
              transition={
                isSpeaking || isListening
                  ? { duration: 0.07 }
                  : { duration: isThinking ? 0.9 : 2.4, repeat: Infinity }
              }
              style={{ originX: '110px', originY: '170px' }}
            />
          )}

          {/* Neck Connector */}
          <rect x="92" y="116" width="36" height="18" rx="6" fill="#CBD5E1" />

          {/* Articulated Head Group */}
          <motion.g
            animate={headTransform}
            transition={
              isSpeaking || isListening
                ? { duration: 0.1 }
                : {
                    duration: isThinking ? 2.2 : isGreeting ? 1.8 : 4.2,
                    repeat: isThinking || isGreeting || state === 'idle' ? Infinity : 0,
                    ease: 'easeInOut',
                  }
            }
            style={{ originX: '110px', originY: '116px' }}
          >
            {/* Antenna / Sensor */}
            <line x1="110" y1="22" x2="110" y2="36" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" />
            <motion.circle
              cx="110"
              cy="18"
              r="6"
              fill={eyeColor}
              animate={
                isListening || isSpeaking
                  ? { scale: 0.9 + clampedLevel * 0.42, opacity: 0.65 + clampedLevel * 0.35 }
                  : { opacity: [0.55, 1, 0.55], scale: [0.92, 1.15, 0.92] }
              }
              transition={isListening || isSpeaking ? { duration: 0.07 } : { duration: 1.5, repeat: Infinity }}
              style={{ originX: '110px', originY: '18px' }}
            />

            {/* Side Ear Pods & Acoustic Listening Waves */}
            <rect x="34" y="64" width="14" height="34" rx="7" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
            <rect x="172" y="64" width="14" height="34" rx="7" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
            <motion.circle
              cx="41"
              cy="81"
              r={isListening ? 4.5 : 3.5}
              fill={eyeColor}
              animate={isListening ? { scale: 1 + clampedLevel * 0.5, opacity: 0.75 + clampedLevel * 0.25 } : { opacity: 0.9 }}
              transition={{ duration: 0.07 }}
            />
            <motion.circle
              cx="179"
              cy="81"
              r={isListening ? 4.5 : 3.5}
              fill={eyeColor}
              animate={isListening ? { scale: 1 + clampedLevel * 0.5, opacity: 0.75 + clampedLevel * 0.25 } : { opacity: 0.9 }}
              transition={{ duration: 0.07 }}
            />

            {/* Listening Acoustic Arcs around Ear Pods */}
            {isListening && (
              <g>
                <motion.path
                  d="M26 68C20 75 20 87 26 94"
                  stroke="#22D3EE"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  animate={{ opacity: 0.3 + clampedLevel * 0.7, scale: 0.96 + clampedLevel * 0.14 }}
                  transition={{ duration: 0.07 }}
                  style={{ originX: '34px', originY: '81px' }}
                />
                <motion.path
                  d="M19 61C11 72 11 90 19 101"
                  stroke="#67E8F9"
                  strokeWidth="2"
                  strokeLinecap="round"
                  animate={{ opacity: 0.15 + clampedLevel * 0.65, scale: 0.94 + clampedLevel * 0.18 }}
                  transition={{ duration: 0.09 }}
                  style={{ originX: '34px', originY: '81px' }}
                />
                <motion.path
                  d="M194 68C200 75 200 87 194 94"
                  stroke="#22D3EE"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  animate={{ opacity: 0.3 + clampedLevel * 0.7, scale: 0.96 + clampedLevel * 0.14 }}
                  transition={{ duration: 0.07 }}
                  style={{ originX: '186px', originY: '81px' }}
                />
                <motion.path
                  d="M201 61C209 72 209 90 201 101"
                  stroke="#67E8F9"
                  strokeWidth="2"
                  strokeLinecap="round"
                  animate={{ opacity: 0.15 + clampedLevel * 0.65, scale: 0.94 + clampedLevel * 0.18 }}
                  transition={{ duration: 0.09 }}
                  style={{ originX: '186px', originY: '81px' }}
                />
              </g>
            )}

            {/* Rounded Head */}
            <rect
              x="44"
              y="34"
              width="132"
              height="88"
              rx="42"
              fill="url(#robotBodyGrad)"
              stroke="#CBD5E1"
              strokeWidth="2"
            />
            <path
              d="M68 44C84 39 136 39 152 44"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Dark Glass Visor */}
            <rect x="56" y="48" width="108" height="60" rx="28" fill="url(#visorGrad)" />

            {/* Subtle Thinking Visor Scan Beam */}
            {isThinking && (
              <motion.rect
                x="62"
                y="54"
                width="16"
                height="48"
                rx="8"
                fill="#818CF8"
                fillOpacity="0.22"
                animate={{ x: [62, 142, 62] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Soft Cheek Glow when Speaking or Success */}
            {(isSpeaking || isSuccess || isGreeting) && (
              <>
                <motion.ellipse
                  cx="71"
                  cy="86"
                  rx="6"
                  ry="3"
                  fill={isSuccess ? '#34D399' : '#60A5FA'}
                  animate={{
                    opacity: isSpeaking ? 0.15 + clampedLevel * 0.35 : 0.25,
                  }}
                  transition={{ duration: 0.08 }}
                />
                <motion.ellipse
                  cx="149"
                  cy="86"
                  rx="6"
                  ry="3"
                  fill={isSuccess ? '#34D399' : '#60A5FA'}
                  animate={{
                    opacity: isSpeaking ? 0.15 + clampedLevel * 0.35 : 0.25,
                  }}
                  transition={{ duration: 0.08 }}
                />
              </>
            )}

            {/* Expressive Eyes */}
            {isGreeting || isSuccess ? (
              <>
                <motion.path
                  d="M77 75C80.5 66 89.5 66 93 75"
                  stroke={eyeColor}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  animate={isSuccess ? { scale: [1, 1.12, 1] } : undefined}
                  transition={{ duration: 0.8, repeat: isSuccess ? Infinity : 0, repeatDelay: 1.4 }}
                  style={{ originX: '85px', originY: '72px' }}
                />
                <motion.path
                  d="M127 75C130.5 66 139.5 66 143 75"
                  stroke={eyeColor}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  animate={isSuccess ? { scale: [1, 1.12, 1] } : undefined}
                  transition={{ duration: 0.8, repeat: isSuccess ? Infinity : 0, repeatDelay: 1.4 }}
                  style={{ originX: '135px', originY: '72px' }}
                />
              </>
            ) : isThinking ? (
              <>
                {[0, 1, 2].map((i) => (
                  <motion.circle
                    key={i}
                    cx={88 + i * 22}
                    cy="74"
                    r="5.5"
                    fill={eyeColor}
                    animate={{ y: [-4, 4, -4], opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 0.8, delay: i * 0.16, repeat: Infinity }}
                  />
                ))}
              </>
            ) : isWarning ? (
              <>
                <rect x="77" y="70" width="16" height="7" rx="3.5" fill={eyeColor} transform="rotate(8 85 73.5)" />
                <rect x="127" y="70" width="16" height="7" rx="3.5" fill={eyeColor} transform="rotate(-8 135 73.5)" />
              </>
            ) : (
              <>
                {/* Expressive glowing eyes + pupil glint */}
                <motion.ellipse
                  cx="85"
                  cy="72"
                  rx={isListening ? 8.5 + clampedLevel * 1.5 : 8}
                  ry={isListening ? 10.5 + clampedLevel * 1.5 : 10}
                  fill={eyeColor}
                  animate={
                    isSpeaking
                      ? { scaleY: 0.88 + clampedLevel * 0.22, scaleX: 1 + clampedLevel * 0.08 }
                      : isListening
                      ? { scaleY: 1 + clampedLevel * 0.14 }
                      : { scaleY: [1, 1, 0.1, 1], x: [0, 1.8, -1.8, 0] }
                  }
                  transition={
                    isSpeaking || isListening
                      ? { duration: 0.07 }
                      : { duration: 4.4, times: [0, 0.9, 0.95, 1], repeat: Infinity }
                  }
                  style={{ originX: '85px', originY: '72px' }}
                />
                <motion.ellipse
                  cx="135"
                  cy="72"
                  rx={isListening ? 8.5 + clampedLevel * 1.5 : 8}
                  ry={isListening ? 10.5 + clampedLevel * 1.5 : 10}
                  fill={eyeColor}
                  animate={
                    isSpeaking
                      ? { scaleY: 0.88 + clampedLevel * 0.22, scaleX: 1 + clampedLevel * 0.08 }
                      : isListening
                      ? { scaleY: 1 + clampedLevel * 0.14 }
                      : { scaleY: [1, 1, 0.1, 1], x: [0, 1.8, -1.8, 0] }
                  }
                  transition={
                    isSpeaking || isListening
                      ? { duration: 0.07 }
                      : { duration: 4.4, times: [0, 0.9, 0.95, 1], repeat: Infinity }
                  }
                  style={{ originX: '135px', originY: '72px' }}
                />
                {/* Crisp Eye Sparkle */}
                <circle cx="88" cy="68" r="2.2" fill="#FFFFFF" fillOpacity="0.8" />
                <circle cx="138" cy="68" r="2.2" fill="#FFFFFF" fillOpacity="0.8" />
              </>
            )}

            {/* Mouth / Audio-Synchronized Speaking Indicator */}
            {isSpeaking ? (
              <g>
                {/* Soft voice glow behind speaking bars */}
                <motion.ellipse
                  cx="110"
                  cy="94"
                  rx={18 + clampedLevel * 6}
                  ry={4 + clampedLevel * 4}
                  fill="#60A5FA"
                  fillOpacity={0.14 + clampedLevel * 0.22}
                />
                {mouthBars.map((level, bar) => (
                  <motion.rect
                    key={bar}
                    x={90 + bar * 6}
                    y="87"
                    width="3.6"
                    height="14"
                    rx="1.8"
                    fill={bar % 2 === 0 ? '#67E8F9' : eyeColor}
                    animate={{ scaleY: 0.22 + level * 0.95 }}
                    transition={{ duration: 0.05 }}
                    style={{ originX: `${91.8 + bar * 6}px`, originY: '94px' }}
                  />
                ))}
              </g>
            ) : isListening ? (
              <motion.ellipse
                cx="110"
                cy="94"
                rx={6 + clampedLevel * 5}
                ry={2.5 + clampedLevel * 4}
                fill={eyeColor}
                fillOpacity="0.9"
                animate={{ scale: 1 + clampedLevel * 0.22 }}
                transition={{ duration: 0.07 }}
              />
            ) : isThinking ? (
              <motion.line
                x1="101"
                y1="94"
                x2="119"
                y2="94"
                stroke={eyeColor}
                strokeWidth="3.2"
                strokeLinecap="round"
                animate={{ x1: [101, 105, 101], x2: [119, 123, 119] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            ) : isWarning ? (
              <line x1="98" y1="94" x2="122" y2="94" stroke={eyeColor} strokeWidth="3.5" strokeLinecap="round" />
            ) : isSuccess ? (
              <path
                d="M92 89C101 100 119 100 128 89"
                stroke={eyeColor}
                strokeWidth="4.2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M98 92C104 97 116 97 122 92"
                stroke={eyeColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeOpacity="0.88"
              />
            )}
          </motion.g>
        </svg>
      </motion.div>

      {statusLabel && (
        <span
          className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            isListening
              ? 'border-cyan/60 bg-cyan/15 text-ink'
              : isSpeaking
              ? 'border-primary/30 bg-primary/10 text-primary'
              : isThinking
              ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
              : isSuccess
              ? 'border-success/30 bg-emerald-50 text-emerald-700'
              : isWarning
              ? 'border-warning/35 bg-amber-50 text-amber-800'
              : 'border-stroke bg-slate-50 text-muted'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isListening
                ? 'bg-cyan animate-ping'
                : isSpeaking
                ? 'bg-primary animate-pulse'
                : isThinking
                ? 'bg-indigo-500 animate-pulse'
                : isSuccess
                ? 'bg-success'
                : isWarning
                ? 'bg-warning'
                : 'bg-slate-400'
            }`}
            aria-hidden="true"
          />
          <span>{statusLabel}</span>
        </span>
      )}
    </div>
  );
}
