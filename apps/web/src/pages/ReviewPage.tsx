import { useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import type {
  DocumentSummary,
  EditableFieldKey,
  InstructionUpdateInput,
} from '@chitthi/shared';
import type { UIStrings } from '../i18n/translations';
import { MedicineInstructionCard } from '../components/MedicineInstructionCard';
import { ChitthiRobot } from '../components/ChitthiRobot';
import { RobotSpeechBubble } from '../components/RobotSpeechBubble';
import { VoiceVisualizer } from '../components/VoiceVisualizer';

interface ReviewPageProps {
  document: DocumentSummary;
  strings: UIStrings;
  isSpeaking?: boolean;
  audioLevel?: number;
  audioBands?: number[];
  onSpeak?: (text: string) => void;
  onStopSpeaking?: () => void;
  onSaveAndContinue: (updates: InstructionUpdateInput[]) => Promise<void>;
}

const MEDICINE_FIELDS: EditableFieldKey[] = [
  'medicineName',
  'dosage',
  'frequency',
  'timing',
  'duration',
];

export function ReviewPage({
  document,
  strings,
  isSpeaking = false,
  audioLevel = 0,
  audioBands,
  onSpeak,
  onStopSpeaking,
  onSaveAndContinue,
}: ReviewPageProps) {
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
  const [submitError, setSubmitError] = useState<string | null>(null);

  const hasUnclear = document.instructions.some(
    (ins) => ins.timing.status === 'unclear' || ins.issues.length > 0
  );

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
    if (val.trim() === '') {
      setConfirmedMap((prev) => {
        if (!prev[insId]?.has(key)) return prev;
        const next = new Set(prev[insId]);
        next.delete(key);
        return { ...prev, [insId]: next };
      });
    }
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
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
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : strings.retry);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{strings.reviewHeader}</h1>
        <p className="mt-1 text-base text-muted">{strings.reviewSubheader}</p>
      </div>

      {document.documentWarnings.length > 0 && (
        <div className="rounded-card border border-warning/35 bg-amber-50 p-4 text-sm text-amber-900">
          {document.documentWarnings.map((w, i) => (
            <p key={i} className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              <span>{w}</span>
            </p>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-4 lg:col-span-2">
          {document.instructions.map((ins) => (
            <MedicineInstructionCard
              key={ins.id}
              instruction={ins}
              draftValues={drafts[ins.id]}
              confirmedFields={confirmedMap[ins.id] ?? new Set()}
              strings={strings}
              onChangeValue={(key, val) => updateFieldValue(ins.id, key, val)}
              onToggleConfirm={(key) => toggleFieldConfirm(ins.id, key)}
            />
          ))}
        </div>

        {/* Right-side Robot Assistant Panel */}
        <div className="min-w-0 space-y-4">
          <div className="rounded-card border border-stroke bg-white p-5 text-center shadow-soft sm:p-6 lg:sticky lg:top-24">
            <ChitthiRobot
              state={isSpeaking ? 'speaking' : hasUnclear ? 'warning' : 'idle'}
              size="md"
              audioLevel={audioLevel}
              audioBands={audioBands}
              statusLabel={
                strings.robotStatusLabels[
                  isSpeaking ? 'speaking' : hasUnclear ? 'warning' : 'idle'
                ]
              }
              onClick={
                onSpeak
                  ? () => {
                      if (isSpeaking) {
                        onStopSpeaking?.();
                      } else {
                        onSpeak(
                          `${strings.reviewRobotMessage} ${
                            hasUnclear
                              ? strings.reviewRobotSubmessageUnclear
                              : strings.reviewRobotSubmessageConfirmed
                          }`
                        );
                      }
                    }
                  : undefined
              }
            />
            <div className="mt-1">
              <VoiceVisualizer
                active={isSpeaking}
                mode="speaking"
                audioLevel={audioLevel}
                audioBands={audioBands}
              />
            </div>
            <div className="mt-3">
              <RobotSpeechBubble
                variant={hasUnclear ? 'warning' : 'default'}
                message={strings.reviewRobotMessage}
                submessage={
                  hasUnclear
                    ? strings.reviewRobotSubmessageUnclear
                    : strings.reviewRobotSubmessageConfirmed
                }
                listenLabel={isSpeaking ? strings.pause : strings.listen}
                onListen={
                  onSpeak
                    ? () => {
                        if (isSpeaking) {
                          onStopSpeaking?.();
                        } else {
                          onSpeak(
                            `${strings.reviewRobotMessage} ${
                              hasUnclear
                                ? strings.reviewRobotSubmessageUnclear
                                : strings.reviewRobotSubmessageConfirmed
                            }`
                          );
                        }
                      }
                    : undefined
                }
              />
            </div>

            {submitError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-danger/30 bg-red-50 p-3 text-left text-xs font-medium text-danger"
              >
                {submitError}
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={submitting}
              className="mt-5 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-bold text-white shadow-glow hover:bg-primary/90 disabled:opacity-60"
            >
              <Check className="h-5 w-5" aria-hidden="true" />
              <span>{strings.confirmAllAndContinue}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
