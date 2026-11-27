import { AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import type { FieldStatus } from '@chitthi/shared';
import type { UIStrings } from '../i18n/translations';

interface ConfirmationBadgeProps {
  status: FieldStatus;
  strings: UIStrings;
}

export function ConfirmationBadge({ status, strings }: ConfirmationBadgeProps) {
  if (status === 'confirmed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-bold tracking-wide text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        CONFIRMED
      </span>
    );
  }

  if (status === 'needs_review') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold tracking-wide text-primary">
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
        NEEDS REVIEW
      </span>
    );
  }

  if (status === 'unclear') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/35 bg-warning/15 px-3 py-1 text-xs font-bold tracking-wide text-amber-800">
        <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
        UNCLEAR
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-stroke bg-slate-100 px-3 py-1 text-xs font-semibold text-muted">
      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
      {strings.statusNotFound}
    </span>
  );
}
