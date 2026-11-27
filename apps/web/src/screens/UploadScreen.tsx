import { useRef, useState } from 'react';
import { ArrowLeft, Camera, FileUp, ShieldCheck, Sparkles } from 'lucide-react';
import type { UIStrings } from '../i18n/translations';

interface UploadScreenProps {
  strings: UIStrings;
  onBack: () => void;
  onUploadFile: (file: File) => void;
  onTrySample: () => void;
}

export function UploadScreen({
  strings,
  onBack,
  onUploadFile,
  onTrySample,
}: UploadScreenProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError(strings.acceptedTypes);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(strings.acceptedTypes);
      return;
    }

    onUploadFile(file);
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

      <div className="rounded-card border border-stroke bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-ink">{strings.uploadTitle}</h1>
        <p className="mt-2 text-base text-muted">{strings.uploadSubtitle}</p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm font-medium text-danger"
          >
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-full bg-primary px-6 text-base font-semibold text-white shadow-sm hover:bg-primary/90"
          >
            <Camera className="h-5 w-5" aria-hidden="true" />
            <span>{strings.takePhoto}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/jpeg,image/png"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-full border border-stroke bg-canvas px-6 text-base font-semibold text-ink hover:bg-stroke/40"
          >
            <FileUp className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>{strings.chooseFile}</span>
          </button>

          <button
            type="button"
            onClick={onTrySample}
            className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-full border border-primary/30 bg-primary/5 px-6 text-base font-semibold text-primary hover:bg-primary/10"
          >
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            <span>{strings.trySampleDocument}</span>
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-muted">{strings.acceptedTypes}</p>
      </div>

      <div className="flex items-start gap-3 rounded-card border border-stroke bg-card p-4 text-sm text-muted">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
        <p>{strings.privacyNote}</p>
      </div>
    </div>
  );
}
