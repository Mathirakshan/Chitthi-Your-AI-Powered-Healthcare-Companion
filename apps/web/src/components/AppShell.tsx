import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Home,
  Menu,
  Mic,
  Sparkles,
  Type,
  Users,
  Volume2,
  X,
} from 'lucide-react';
import { UI_NOTICE_TEXT, type SupportedLanguage } from '@chitthi/shared';
import type { UIStrings } from '../i18n/translations';
import { LanguageSelector } from './LanguageSelector';

interface AppShellProps {
  language: SupportedLanguage;
  strings: UIStrings;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  largeText: boolean;
  onToggleLargeText: () => void;
  hasDocument: boolean;
  hasExplanation: boolean;
  demoMode?: boolean;
  children: ReactNode;
}

export function AppShell({
  language,
  strings,
  onChangeLanguage,
  largeText,
  onToggleLargeText,
  hasDocument,
  hasExplanation,
  demoMode,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);

  const navItems = [
    { to: '/', label: strings.nav.home, icon: Home, enabled: true, end: true },
    { to: '/app', label: strings.nav.documents, icon: FileText, enabled: true, end: true },
    { to: '/app/review', label: strings.nav.review, icon: ClipboardCheck, enabled: hasDocument },
    { to: '/app/explanation', label: strings.nav.explanation, icon: Volume2, enabled: hasExplanation },
    { to: '/app/assistant', label: strings.nav.assistant, icon: Mic, enabled: hasDocument },
    { to: '/app/teachback', label: strings.nav.teachback, icon: CheckCircle2, enabled: hasExplanation },
    { to: '/app/caregiver', label: strings.nav.caregiver, icon: Users, enabled: hasDocument },
  ];

  const renderNavLinks = (onItemClick?: () => void) => (
    <nav aria-label="Main navigation" className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        if (!item.enabled) {
          return (
            <div
              key={item.to}
              aria-disabled="true"
              className="flex min-h-[44px] w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted/45"
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate leading-snug">{item.label}</span>
            </div>
          );
        }
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-ink/80 hover:bg-slate-100 hover:text-ink'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate leading-snug">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  const renderSidebarControls = () => (
    <div className="space-y-2.5 border-t border-stroke/80 bg-slate-50/70 px-3 py-3.5">
      <LanguageSelector language={language} onChange={onChangeLanguage} variant="sidebar" />
      <button
        type="button"
        onClick={onToggleLargeText}
        aria-pressed={largeText}
        className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border px-3 text-xs font-semibold transition ${
          largeText
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-stroke bg-white text-muted hover:text-ink'
        }`}
      >
        <Type className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">
          {strings.largeTextToggle} {largeText ? 'ON' : 'OFF'}
        </span>
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen bg-canvas text-ink ${largeText ? 'chitthi-large-text' : ''}`}>
      <div className="flex min-h-screen">
        {/* Compact Fixed-Width Desktop Sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-stroke bg-white xl:w-64 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto">
          <div className="flex shrink-0 items-center gap-2.5 border-b border-stroke/70 px-4 py-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-ink">CHITTHI</span>
          </div>

          <div className="px-3 py-3">{renderNavLinks()}</div>

          {renderSidebarControls()}
        </aside>

        {/* Main Column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile / Tablet Sticky Header */}
          <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-stroke bg-white/95 px-2.5 py-2 backdrop-blur-md sm:px-4 sm:py-2.5 lg:hidden">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-stroke bg-canvas text-ink transition hover:bg-slate-100"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-600 text-white">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="truncate text-base font-extrabold tracking-tight text-ink sm:text-lg">
                  CHITTHI
                </span>
              </div>
            </div>

            <LanguageSelector language={language} onChange={onChangeLanguage} variant="header" />
          </header>

          {/* Collapsible Mobile Drawer */}
          <AnimatePresence>
            {mobileOpen && (
              <div
                className="fixed inset-0 z-40 flex lg:hidden"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-ink/45 backdrop-blur-sm"
                  onClick={() => setMobileOpen(false)}
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                  className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto bg-white shadow-2xl"
                >
                  <div className="flex shrink-0 items-center justify-between border-b border-stroke/70 px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white">
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <span className="text-lg font-extrabold text-ink">CHITTHI</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-stroke text-ink hover:bg-slate-100"
                      aria-label="Close navigation menu"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="px-3 py-3">{renderNavLinks(() => setMobileOpen(false))}</div>

                  {renderSidebarControls()}
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <main className="mx-auto w-full max-w-7xl flex-1 px-3.5 py-4 sm:px-6 sm:py-6 lg:px-7">
            {demoMode && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{strings.demoModeBadge}</span>
              </div>
            )}
            {children}
          </main>

          <footer className="border-t border-stroke bg-white/70 px-4 py-4 text-center text-xs leading-relaxed text-muted">
            {UI_NOTICE_TEXT[language]}
          </footer>
        </div>
      </div>
    </div>
  );
}
