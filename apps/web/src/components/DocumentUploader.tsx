import { useRef, useState } from 'react';
import { Camera, FileUp, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react';
import type { UIStrings } from '../i18n/translations';

interface DocumentUploaderProps {
  strings: UIStrings;
  onUploadFile: (file: File) => void;
  onTrySample: () => void;
}

export function DocumentUploader({
  strings,
  onUploadFile,
  onTrySample,
}: DocumentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndEmit = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const lowerName = file.name.toLowerCase();
    const hasValidExtension =
      lowerName.endsWith('.pdf') ||
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg') ||
      lowerName.endsWith('.png');
    if (!validTypes.includes(file.type) && !hasValidExtension) {
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
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          validateAndEmit(e.dataTransfer.files?.[0]);
        }}
        className={`rounded-card border-2 border-dashed p-6 text-center transition-all sm:p-8 ${
          dragActive
            ? 'border-primary bg-primary/5 shadow-glow'
            : 'border-stroke bg-white hover:border-primary/40'
        }`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UploadCloud className="h-7 w-7" aria-hidden="true" />
        </div>

        <h2 className="mt-4 text-xl font-bold text-ink">{strings.uploadTitle}</h2>
        <p className="mt-1.5 text-sm text-muted">{strings.uploadSubtitle}</p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm font-medium text-danger"
          >
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              validateAndEmit(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-glow transition hover:bg-primary/90 sm:w-auto"
          >
            <FileUp className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{strings.chooseFile}</span>
          </button>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              validateAndEmit(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full border border-stroke bg-canvas px-5 text-sm font-semibold text-ink hover:border-primary/40 sm:w-auto"
          >
            <Camera className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>{strings.takePhoto}</span>
          </button>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={onTrySample}
            className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-5 text-sm font-semibold text-primary hover:bg-primary/10 sm:w-auto"
          >
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{strings.trySampleDocument}</span>
          </button>
        </div>

        <p className="mt-4 text-xs text-muted">{strings.acceptedTypes}</p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-stroke bg-white p-4 text-sm text-muted shadow-sm">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
        <p>{strings.privacyNote}</p>
      </div>
    </div>
  );
}
