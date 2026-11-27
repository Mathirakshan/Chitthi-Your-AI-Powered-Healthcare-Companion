import { AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import type { FieldStatus } from '@chitthi/shared';
import type { UIStrings } from '../i18n/translations';

interface StatusChipProps {
  status: FieldStatus;
  strings: UIStrings;
}

export function StatusChip({ status, strings }: StatusChipProps) {
  if (status === 'confirmed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        {strings.statusConfirmed}
      </span>
    );
  }

  if (status === 'needs_review') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
        {strings.statusFromDoc}
      </span>
    );
  }

  if (status === 'unclear') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning">
        <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
        {strings.statusPleaseCheck}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-stroke/60 px-2.5 py-1 text-xs font-medium text-muted">
      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
      {strings.statusNotFound}
    </span>
  );
}
