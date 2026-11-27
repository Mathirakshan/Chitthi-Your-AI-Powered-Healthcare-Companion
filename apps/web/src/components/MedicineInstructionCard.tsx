import { motion } from 'framer-motion';
import { Check, Pill, ShieldAlert, CalendarClock } from 'lucide-react';
import type { EditableFieldKey, MedicalInstruction } from '@chitthi/shared';
import type { UIStrings } from '../i18n/translations';
import { ConfirmationBadge } from './ConfirmationBadge';

interface MedicineInstructionCardProps {
  instruction: MedicalInstruction;
  draftValues: Record<EditableFieldKey, string>;
  confirmedFields: Set<EditableFieldKey>;
  strings: UIStrings;
  onChangeValue: (key: EditableFieldKey, value: string) => void;
  onToggleConfirm: (key: EditableFieldKey) => void;
}

const MEDICINE_FIELDS: EditableFieldKey[] = [
  'medicineName',
  'dosage',
  'frequency',
  'timing',
  'duration',
];

export function MedicineInstructionCard({
  instruction,
  draftValues,
  confirmedFields,
  strings,
  onChangeValue,
  onToggleConfirm,
}: MedicineInstructionCardProps) {
  const keysToShow: EditableFieldKey[] =
    instruction.type === 'medicine'
      ? MEDICINE_FIELDS
      : instruction.type === 'precaution'
      ? ['precautions']
      : ['followUp'];

  const Icon =
    instruction.type === 'medicine'
      ? Pill
      : instruction.type === 'precaution'
      ? ShieldAlert
      : CalendarClock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-card border border-stroke bg-white p-5 shadow-soft"
    >
      <div className="mb-4 flex items-center gap-2.5 border-b border-stroke pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="font-bold text-ink">
          {instruction.type === 'medicine'
            ? draftValues.medicineName || strings.fieldLabels.medicineName
            : instruction.type === 'precaution'
            ? strings.fieldLabels.precautions
            : strings.fieldLabels.followUp}
        </div>
      </div>

      {instruction.issues.length > 0 && (
        <div className="mb-4 rounded-xl border border-warning/35 bg-amber-50 p-3 text-sm font-medium text-amber-900">
          {instruction.issues.map((issue, idx) => (
            <p key={idx}>{issue}</p>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {keysToShow.map((key) => {
          const field = instruction[key];
          const isConfirmed = confirmedFields.has(key);
          const val = draftValues[key] ?? '';

          return (
            <div
              key={key}
              className={`space-y-1.5 rounded-2xl border p-3.5 transition-all ${
                isConfirmed
                  ? 'border-success/35 bg-emerald-50/40'
                  : field.status === 'unclear'
                  ? 'border-warning/40 bg-amber-50/40'
                  : 'border-stroke bg-canvas'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor={`${instruction.id}_${key}`} className="text-sm font-semibold text-ink">
                  {strings.fieldLabels[key]}
                </label>
                <ConfirmationBadge
                  status={isConfirmed ? 'confirmed' : field.status}
                  strings={strings}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id={`${instruction.id}_${key}`}
                  type="text"
                  value={val}
                  onChange={(e) => onChangeValue(key, e.target.value)}
                  placeholder={strings.statusNotFound}
                  className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-stroke bg-white px-3 text-base text-ink placeholder:text-muted/60"
                />
                <button
                  type="button"
                  onClick={() => onToggleConfirm(key)}
                  disabled={!val.trim()}
                  aria-pressed={isConfirmed}
                  aria-label={`Confirm ${strings.fieldLabels[key]}`}
                  className={`flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border transition-all ${
                    isConfirmed
                      ? 'border-success bg-success text-white shadow-sm'
                      : 'border-stroke bg-white text-muted hover:border-primary disabled:opacity-40'
                  }`}
                >
                  <Check className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {field.sourceQuote && (
                <p className="break-words text-xs text-muted">
                  <span className="font-semibold">{strings.sourceLabel}:</span> “{field.sourceQuote}”
                  {field.page ? ` (${strings.pageLabel} ${field.page})` : ''}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
