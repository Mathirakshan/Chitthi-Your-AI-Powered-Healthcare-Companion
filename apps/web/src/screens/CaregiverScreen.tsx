import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, Check, Copy, Lock, Trash2 } from 'lucide-react';
import type { CaregiverSummaryResponse, SupportedLanguage } from '@chitthi/shared';
import type { UIStrings } from '../i18n/translations';
import { api } from '../services/api';

interface CaregiverScreenProps {
  documentId: string;
  language: SupportedLanguage;
  strings: UIStrings;
  onBack: () => void;
  onDeleteSession: () => void;
}

export function CaregiverScreen({
  documentId,
  language,
  strings,
  onBack,
  onDeleteSession,
}: CaregiverScreenProps) {
  const [summary, setSummary] = useState<CaregiverSummaryResponse | null>(null);
  const [consentGranted, setConsentGranted] = useState(false);
  const [consentDenied, setConsentDenied] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedLangRef = useRef<SupportedLanguage | null>(null);

  useEffect(() => {
    if (!consentGranted || loadedLangRef.current === language) return;
    let active = true;
    setLoading(true);
    setError(null);
    api
      .createCaregiverSummary(documentId, true, language)
      .then((res) => {
        if (active) {
          loadedLangRef.current = language;
          setSummary(res);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : strings.retry);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [consentGranted, documentId, language, strings.retry]);

  const handleGrantConsent = async () => {
    setLoading(true);
    setError(null);
    setConsentDenied(false);
    try {
      const res = await api.createCaregiverSummary(documentId, true, language);
      loadedLangRef.current = language;
      setConsentGranted(true);
      setSummary(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : strings.retry);
    } finally {
      setLoading(false);
    }
  };

  const handleDenyConsent = () => {
    loadedLangRef.current = null;
    setConsentGranted(false);
    setSummary(null);
    setError(null);
    setConsentDenied(true);
  };

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary.previewText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Clipboard access unavailable. Please select and copy the text manually.');
    }
  };

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>{strings.back}</span>
      </button>

      <div className="rounded-card border border-stroke bg-card p-5 shadow-sm sm:p-6">
        <h1 className="text-xl font-bold text-ink sm:text-2xl">{strings.caregiverHeader}</h1>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-red-50 p-3 text-sm text-danger"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {!summary && (
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-stroke bg-canvas p-4">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <p className="text-base text-ink">{strings.caregiverConsentPrompt}</p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGrantConsent}
                disabled={loading}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-white"
              >
                <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{strings.grantConsentButton}</span>
              </button>

              <button
                type="button"
                onClick={handleDenyConsent}
                className="flex min-h-[50px] w-full items-center justify-center rounded-full border border-stroke bg-canvas px-6 text-base font-semibold text-ink"
              >
                {strings.denyConsentButton}
              </button>
            </div>

            {consentDenied && (
              <p className="rounded-xl bg-stroke/40 p-3 text-center text-sm font-medium text-muted">
                {strings.consentDeniedNotice}
              </p>
            )}
          </div>
        )}

        {summary && (
          <div className="mt-4 space-y-4">
            <pre className="whitespace-pre-wrap break-words rounded-2xl border border-stroke bg-canvas p-4 font-sans text-sm leading-relaxed text-ink">
              {summary.previewText}
            </pre>

            <button
              type="button"
              onClick={handleCopy}
              className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-white"
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              <span>{copied ? strings.copied : strings.copySummary}</span>
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onDeleteSession}
        className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full border border-danger/30 bg-danger/5 px-6 text-base font-semibold text-danger hover:bg-danger/10"
      >
        <Trash2 className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{strings.deleteSession}</span>
      </button>
    </div>
  );
}
