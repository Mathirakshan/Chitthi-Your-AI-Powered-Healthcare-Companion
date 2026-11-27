import type {
  CaregiverSummaryResponse,
  MedicalInstruction,
  SupportedLanguage,
} from '@chitthi/shared';
import { documentStore } from '../storage/documentStore.js';
import { getConfirmedFacts } from './qaService.js';

export function buildCaregiverSummary(params: {
  documentId: string;
  instructions: MedicalInstruction[];
  patientConsent: boolean;
  language: SupportedLanguage;
  demoMode: boolean;
}): CaregiverSummaryResponse | { error: 'CONSENT_REQUIRED' } {
  const { documentId, instructions, patientConsent, language, demoMode } = params;

  if (patientConsent !== true) {
    return { error: 'CONSENT_REQUIRED' };
  }

  documentStore.saveConsent({
    documentId,
    caregiverSummaryGranted: true,
    grantedAt: new Date().toISOString(),
  });

  const confirmed = getConfirmedFacts(instructions);
  const unresolvedCount = instructions.filter((ins) => ins.reviewStatus !== 'confirmed').length;

  const lines: string[] = [];
  if (language === 'ta-IN') {
    lines.push('நோயாளி அனுமதியுடன் உருவாக்கப்பட்ட பராமரிப்பாளர் சுருக்கம்');
    lines.push('--------------------------------------------------');
  } else if (language === 'hi-IN') {
    lines.push('रोगी की सहमति से तैयार देखभालकर्ता सारांश');
    lines.push('----------------------------------------');
  } else {
    lines.push('CAREGIVER SUMMARY (Generated with explicit patient consent)');
    lines.push('----------------------------------------------------------');
  }

  for (const fact of confirmed) {
    const f = fact.fields;
    if (fact.type === 'medicine') {
      const details = [f.dosage, f.frequency, f.timing, f.duration].filter(Boolean).join(' | ');
      lines.push(`• ${f.medicineName || 'Medicine'}: ${details || 'Confirmed partial details'}`);
    } else if (f.precautions) {
      lines.push(`• Precautions: ${f.precautions}`);
    } else if (f.followUp) {
      lines.push(`• Follow-up: ${f.followUp}`);
    }
  }

  if (unresolvedCount > 0) {
    lines.push('');
    lines.push(
      language === 'ta-IN'
        ? `கவனம்: ${unresolvedCount} பகுதி(கள்) இன்னும் முழுமையாக உறுதிப்படுத்தப்படவில்லை. மருத்துவரிடம் சரிபார்க்கவும்.`
        : language === 'hi-IN'
        ? `ध्यान दें: ${unresolvedCount} भाग अभी पूरी तरह से पुष्टि नहीं हुए हैं। कृपया डॉक्टर से जाँच करें।`
        : `Note: ${unresolvedCount} item(s) had unconfirmed or unclear fields and were excluded. Please verify with the hospital.`
    );
  }

  return {
    previewText: lines.join('\n'),
    confirmedCount: confirmed.length,
    unresolvedCount,
    generatedAt: new Date().toISOString(),
    demoMode,
  };
}
