import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  FileText,
  Globe,
  Mic,
  ShieldCheck,
  Sparkles,
  Users,
  Volume2,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, UI_NOTICE_TEXT, type SupportedLanguage } from '@chitthi/shared';
import { ChitthiRobot } from '../components/ChitthiRobot';
import { LanguageSelector } from '../components/LanguageSelector';
import { VoiceVisualizer } from '../components/VoiceVisualizer';

interface LandingPageProps {
  language: SupportedLanguage;
  isSpeaking: boolean;
  audioLevel?: number;
  audioBands?: number[];
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onStartApp: () => void;
  onTrySample: () => void;
  onPlayGreeting: () => void;
}

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Upload Your Document',
    desc: 'Upload a prescription or hospital discharge summary (PDF, JPG, or PNG).',
    icon: FileText,
  },
  {
    step: '02',
    title: 'Understand Your Instructions',
    desc: 'Review extracted medicines, dosage, and timing with exact source quotes.',
    icon: FileSearch,
  },
  {
    step: '03',
    title: 'Ask Questions by Voice',
    desc: 'Speak naturally in Tamil, English, or Hindi and hear grounded answers.',
    icon: Mic,
  },
  {
    step: '04',
    title: 'Check Your Understanding',
    desc: 'Complete a gentle teach-back check to feel confident about your care plan.',
    icon: CheckCircle2,
  },
];

const FEATURES = [
  {
    title: 'Smart Document Reading',
    desc: 'Extracts medicine names, dosages, timings, and follow-ups with source verification.',
    icon: FileSearch,
  },
  {
    title: 'Multilingual Explanation',
    desc: 'Clear, everyday explanations in Tamil, English, and Hindi for patients and elders.',
    icon: Globe,
  },
  {
    title: 'Voice Conversations',
    desc: 'Voice-first interface with natural speech playback and readable captions.',
    icon: Volume2,
  },
  {
    title: 'Understanding Verification',
    desc: 'Friendly teach-back questions confirm comprehension without ever shaming the patient.',
    icon: CheckCircle2,
  },
  {
    title: 'Caregiver Support',
    desc: 'Optional, consent-gated summaries ready to share with family caregivers.',
    icon: Users,
  },
];

export function LandingPage({
  language,
  isSpeaking,
  audioLevel = 0,
  audioBands,
  onSelectLanguage,
  onStartApp,
  onTrySample,
  onPlayGreeting,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-stroke/80 bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-1.5 px-2.5 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-sm sm:h-9 sm:w-9">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </div>
            <span className="truncate text-base font-extrabold tracking-tight text-ink sm:text-xl">
              CHITTHI
            </span>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-muted lg:flex">
            <a href="#how-it-works" className="inline-flex min-h-[44px] items-center hover:text-ink">
              How It Works
            </a>
            <a href="#features" className="inline-flex min-h-[44px] items-center hover:text-ink">
              Features
            </a>
            <a href="#safety" className="inline-flex min-h-[44px] items-center hover:text-ink">
              Trust & Safety
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LanguageSelector language={language} onChange={onSelectLanguage} variant="header" />
            <button
              type="button"
              onClick={onStartApp}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-primary px-3 text-xs font-semibold text-white shadow-glow transition hover:bg-primary/90 sm:gap-2 sm:px-5 sm:text-sm"
            >
              <span className="hidden sm:inline">Start Understanding</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-stroke/60 bg-gradient-to-b from-indigo-50/70 via-canvas to-canvas py-10 sm:py-16 lg:py-20">
        <div className="pointer-events-none absolute -left-24 top-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-20 h-96 w-96 rounded-full bg-cyan/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-w-0"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3.5 py-1.5 text-xs font-bold text-primary shadow-sm">
              <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>AI-Powered Healthcare Assistant</span>
            </div>

            <h1 className="mt-5 text-3xl font-extrabold leading-[1.14] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Understand Your Health.{' '}
              <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                In Your Language.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:mt-5 sm:text-lg">
              Your prescriptions and hospital instructions, explained simply through the power of AI
              and voice.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onStartApp}
                className="inline-flex min-h-[54px] items-center justify-center gap-2.5 rounded-full bg-primary px-7 text-base font-bold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-primary/90"
              >
                <span>Start Understanding</span>
                <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              </button>

              <a
                href="#how-it-works"
                className="inline-flex min-h-[54px] items-center justify-center rounded-full border border-stroke bg-white px-7 text-base font-bold text-ink shadow-sm transition hover:border-primary/40"
              >
                See How It Works
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-semibold text-muted">
              <span>Tamil • English • Hindi</span>
              <button
                type="button"
                onClick={onTrySample}
                className="inline-flex min-h-[44px] items-center text-primary underline-offset-4 hover:underline"
              >
                Try sample discharge summary →
              </button>
            </div>
          </motion.div>

          {/* Right Column: Large Interactive Robot + Non-Overlapping Cards */}
          <div className="relative flex min-h-[280px] flex-col items-center justify-center sm:min-h-[360px]">
            <ChitthiRobot
              state={isSpeaking ? 'speaking' : 'greeting'}
              size="hero"
              audioLevel={audioLevel}
              audioBands={audioBands}
              onClick={onPlayGreeting}
            />

            <div className="mt-2">
              <VoiceVisualizer
                active={isSpeaking}
                mode="speaking"
                audioLevel={audioLevel}
                audioBands={audioBands}
              />
            </div>

            {/* Responsive stacked preview pills on mobile/tablet/small-laptop so nothing overlaps the robot */}
            <div className="mt-4 grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2 xl:hidden">
              <div className="rounded-2xl border border-stroke bg-white/95 px-3.5 py-2.5 text-center text-xs font-semibold text-ink shadow-soft">
                <span className="inline-flex items-center gap-1.5 text-indigo-600">
                  <Volume2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  Tap Chitthi to hear your greeting
                </span>
              </div>
              <div className="rounded-2xl border border-stroke bg-white/95 px-3.5 py-2.5 text-center text-xs font-semibold text-ink shadow-soft">
                <span className="inline-flex items-center gap-1.5 text-ink">
                  <Mic className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  Ask anything about your prescription
                </span>
              </div>
            </div>

            {/* Floating Card 1 */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-2 top-2 hidden rounded-2xl border border-stroke bg-white/95 px-4 py-3 text-xs font-semibold text-ink shadow-soft backdrop-blur-md xl:block"
            >
              <span className="inline-flex items-center gap-1.5 text-primary">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                Your medicine instructions are ready.
              </span>
            </motion.div>

            {/* Floating Card 2 */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.5, delay: 0.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-2 top-10 hidden rounded-2xl border border-stroke bg-white/95 px-4 py-3 text-xs font-semibold text-ink shadow-soft backdrop-blur-md xl:block"
            >
              <span className="inline-flex items-center gap-1.5 text-indigo-600">
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                Explaining in Tamil, English & Hindi
              </span>
            </motion.div>

            {/* Floating Card 3 */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, delay: 0.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-10 -left-2 hidden rounded-2xl border border-stroke bg-white/95 px-4 py-3 text-xs font-semibold text-ink shadow-soft backdrop-blur-md xl:block"
            >
              <span className="inline-flex items-center gap-1.5 text-ink">
                <Mic className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Ask me anything about your document.
              </span>
            </motion.div>

            {/* Floating Card 4 */}
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 4.2, delay: 1.1, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-6 -right-2 hidden rounded-2xl border border-success/30 bg-emerald-50/95 px-4 py-3 text-xs font-bold text-emerald-800 shadow-soft backdrop-blur-md xl:block"
            >
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                Understanding verified!
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 1: HOW CHITTHI WORKS */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">How Chitthi Works</h2>
          <p className="mt-2 text-base text-muted">
            Four calm, guided steps from medical paperwork to clear understanding.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group rounded-card border border-stroke bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold tracking-widest text-primary">
                    {item.step}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: MEET YOUR AI ASSISTANT */}
      <section className="border-y border-stroke/60 bg-white py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center">
            <ChitthiRobot
              state={isSpeaking ? 'speaking' : 'idle'}
              size="hero"
              audioLevel={audioLevel}
              audioBands={audioBands}
              onClick={onPlayGreeting}
            />
            <div className="mt-2">
              <VoiceVisualizer
                active={isSpeaking}
                mode="speaking"
                audioLevel={audioLevel}
                audioBands={audioBands}
              />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
              Meet the assistant that speaks your language.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Chitthi helps turn complicated medical instructions into simple explanations you can
              understand. Designed with calm visuals and clear voice guidance for patients and
              elderly family members.
            </p>
            <button
              type="button"
              onClick={onPlayGreeting}
              className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-6 text-sm font-bold text-primary hover:bg-primary/10"
            >
              <Volume2 className="h-4 w-4" aria-hidden="true" />
              <span>Hear Chitthi introduce itself</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
            Built for clarity and accessibility
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="rounded-card border border-stroke bg-white p-6 shadow-soft transition hover:border-primary/35"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: LANGUAGE SUPPORT */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-card border border-stroke bg-white p-6 shadow-soft sm:p-8">
          <h2 className="text-center text-2xl font-extrabold text-ink">
            Choose Your Preferred Language
          </h2>
          <p className="mt-1 text-center text-sm text-muted">
            Switch seamlessly between Tamil, English, and Hindi at any time.
          </p>
          <div className="mt-6">
            <LanguageSelector language={language} onChange={onSelectLanguage} />
          </div>
        </div>
      </section>

      {/* SECTION 5: TRUST & SAFETY */}
      <section id="safety" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="rounded-card border border-primary/20 bg-gradient-to-br from-indigo-50/80 to-white p-6 shadow-soft sm:p-10">
          <div className="flex items-center gap-2.5 text-primary">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            <span className="text-xs font-extrabold uppercase tracking-wider">Safety First</span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            Your instructions matter. Accuracy matters more.
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              'Review extracted instructions before any explanation is generated.',
              'Confirm information with exact source quotes from your document.',
              'Never guess unclear dosage, meal timing, or missing medicine names.',
              'Ask your doctor or hospital immediately when information is missing.',
            ].map((rule) => (
              <div
                key={rule}
                className="flex items-start gap-3 rounded-2xl border border-stroke bg-white p-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                <p className="text-sm font-medium text-ink">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: FINAL CTA */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
          Let’s make your health instructions easier to understand.
        </h2>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onStartApp}
            className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-bold text-white shadow-glow hover:bg-primary/90"
          >
            <span>Get Started</span>
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onTrySample}
            className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-stroke bg-white px-8 text-base font-bold text-ink shadow-sm hover:border-primary/40"
          >
            Try Sample Document
          </button>
        </div>

        <p className="mt-10 text-xs leading-relaxed text-muted">{UI_NOTICE_TEXT[language]}</p>
      </section>
    </div>
  );
}
