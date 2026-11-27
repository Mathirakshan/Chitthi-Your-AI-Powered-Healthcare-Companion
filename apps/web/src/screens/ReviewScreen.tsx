import { useState } from 'react';
import { AlertTriangle, Check, ArrowLeft, Sparkles } from 'lucide-react';
import type {
  DocumentSummary,
  EditableFieldKey,
  InstructionUpdateInput,
  MedicalInstruction,
} from '@chitthi/shared';
import type { UIStrings } from '../i18n/translations';
import { StatusChip } from '../components/StatusChip';

interface ReviewScreenProps {
  document: DocumentSummary;
  strings: UIStrings;
  onBack: () => void;
  onSaveAndContinue: (updates: InstructionUpdateInput[]) => Promise<void>;
}

const MEDICINE_FIELDS: EditableFieldKey[] = [
  'medicineName',
  'dosage',
  'frequency',
  'timing',
  'duration',
];

export function ReviewScreen({
  document,
  strings,
  onBack,
  onSaveAndContinue,
}: ReviewScreenProps) {
  const [drafts, setDrafts] = useState<Record<string, Record<EditableFieldKey, string>>>(() => {
    const init: Record<string, Record<EditableFieldKey, string>> = {};
    for (const ins of document.instructions) {
      init[ins.id] = {
        medicineName: ins.medicineName.confirmedValue ?? ins.medicineName.value ?? '',
        dosage: ins.dosage.confirmedValue ?? ins.dosage.value ?? '',
        frequency: ins.frequency.confirmedValue ?? ins.frequency.value ?? '',
        timing: ins.timing.confirmedValue ?? ins.timing.value ?? '',
        duration: ins.duration.confirmedValue ?? ins.duration.value ?? '',
        precautions: ins.precautions.confirmedValue ?? ins.precautions.value ?? '',
        followUp: ins.followUp.confirmedValue ?? ins.followUp.value ?? '',
      };
    }
    return init;
  });

  const [confirmedMap, setConfirmedMap] = useState<Record<string, Set<EditableFieldKey>>>(() => {
    const init: Record<string, Set<EditableFieldKey>> = {};
    for (const ins of document.instructions) {
      const set = new Set<EditableFieldKey>(ins.confirmedFields);
      const keysToCheck: EditableFieldKey[] =
        ins.type === 'medicine'
          ? MEDICINE_FIELDS
          : ins.type === 'precaution'
          ? ['precautions']
          : ['followUp'];
      for (const k of keysToCheck) {
        if (ins[k].value && ins[k].status !== 'unclear' && ins[k].status !== 'missing') {
          set.add(k);
        }
      }
      init[ins.id] = set;
    }
    return init;
  });

  const [submitting, setSubmitting] = useState(false);

  const toggleFieldConfirm = (insId: string, key: EditableFieldKey) => {
    setConfirmedMap((prev) => {
      const next = new Set(prev[insId] ?? []);
      if (next.has(key)) next.delete(key);
      else if ((drafts[insId]?.[key] ?? '').trim() !== '') next.add(key);
      return { ...prev, [insId]: next };
    });
  };

  const updateFieldValue = (insId: string, key: EditableFieldKey, val: string) => {
    setDrafts((prev) => ({
      ...prev,
      [insId]: { ...prev[insId], [key]: val },
    }));
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    try {
      const updates: InstructionUpdateInput[] = document.instructions.map((ins) => {
        const d = drafts[ins.id];
        const confirmed = Array.from(confirmedMap[ins.id] ?? []).filter(
          (k) => (d[k] ?? '').trim() !== ''
        );
        return {
          id: ins.id,
          medicineName: d.medicineName || null,
          dosage: d.dosage || null,
          frequency: d.frequency || null,
          timing: d.timing || null,
          duration: d.duration || null,
          precautions: d.precautions || null,
          followUp: d.followUp || null,
          confirmedFields: confirmed,
        };
      });
      await onSaveAndContinue(updates);
    } finally {
      setSubmitting(false);
    }
  };

  const renderFieldRow = (ins: MedicalInstruction, key: EditableFieldKey) => {
    const field = ins[key];
    const isConfirmed = confirmedMap[ins.id]?.has(key) ?? false;
    const val = drafts[ins.id]?.[key] ?? '';

    return (
      <div
        key={key}
        className={`space-y-1.5 rounded-2xl border p-3.5 transition-all ${
          isConfirmed
            ? 'border-success/30 bg-success/[0.03]'
            : field.status === 'unclear'
            ? 'border-warning/40 bg-warning/[0.04]'
            : 'border-stroke bg-canvas'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={`${ins.id}_${key}`} className="text-sm font-semibold text-ink">
            {strings.fieldLabels[key]}
          </label>
          <StatusChip status={isConfirmed ? 'confirmed' : field.status} strings={strings} />
        </div>

        <div className="flex items-center gap-2">
          <input
            id={`${ins.id}_${key}`}
            type="text"
            value={val}
            onChange={(e) => updateFieldValue(ins.id, key, e.target.value)}
            placeholder={strings.statusNotFound}
            className="min-h-[44px] w-full rounded-xl border border-stroke bg-card px-3 text-base text-ink placeholder:text-muted/60"
          />
          <button
            type="button"
            onClick={() => toggleFieldConfirm(ins.id, key)}
            disabled={!val.trim()}
            aria-pressed={isConfirmed}
            aria-label={`Confirm ${strings.fieldLabels[key]}`}
            className={`flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border transition-all ${
              isConfirmed
                ? 'border-success bg-success text-white shadow-sm'
                : 'border-stroke bg-card text-muted hover:border-primary disabled:opacity-40'
            }`}
          >
            <Check className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {field.sourceQuote && (
          <p className="text-xs text-muted">
            <span className="font-medium">{strings.sourceLabel}:</span> “{field.sourceQuote}”
            {field.page ? ` (${strings.pageLabel} ${field.page})` : ''}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-slide-up-fade">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>{strings.back}</span>
      </button>

      <div>
        <h1 className="text-2xl font-bold text-ink">{strings.reviewHeader}</h1>
        <p className="mt-1 text-base text-muted">{strings.reviewSubheader}</p>
      </div>

      {document.documentWarnings.length > 0 && (
        <div className="rounded-card border border-warning/30 bg-warning/10 p-4 text-sm text-ink">
          {document.documentWarnings.map((w, i) => (
            <p key={i} className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              <span>{w}</span>
            </p>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {document.instructions.map((ins, idx) => {
          const keysToShow: EditableFieldKey[] =
            ins.type === 'medicine'
              ? MEDICINE_FIELDS
              : ins.type === 'precaution'
              ? ['precautions']
              : ['followUp'];

          return (
            <div
              key={ins.id}
              style={{ animationDelay: `${idx * 70}ms` }}
              className="rounded-card border border-stroke bg-card p-5 shadow-sm animate-slide-up-fade"
            >
              {ins.issues.length > 0 && (
                <div className="mb-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm font-medium text-warning">
                  {ins.issues.map((issue, issueIdx) => (
                    <p key={issueIdx}>{issue}</p>
                  ))}
                </div>
              )}
              <div className="space-y-3">{keysToShow.map((k) => renderFieldRow(ins, k))}</div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-3 pt-2">
        <button
          type="button"
          onClick={handleConfirmSubmit}
          disabled={submitting}
          className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-indigo-600 px-6 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-xl disabled:opacity-60"
        >
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          <span>{strings.confirmAllAndContinue}</span>
        </button>
      </div>
    </div>
  );
}
