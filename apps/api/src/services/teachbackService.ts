import crypto from 'node:crypto';
import type {
  EditableFieldKey,
  MedicalInstruction,
  SupportedLanguage,
  TeachBackQuestionResponse,
  TeachBackVerifyResponse,
} from '@chitthi/shared';
import { documentStore } from '../storage/documentStore.js';
import { getConfirmedFacts } from './qaService.js';

export function createTeachBackQuestion(params: {
  documentId: string;
  instructions: MedicalInstruction[];
  language: SupportedLanguage;
  demoMode: boolean;
}): TeachBackQuestionResponse | null {
  const { documentId, instructions, language, demoMode } = params;
  const confirmed = getConfirmedFacts(instructions);

  // Pick a confirmed medicine instruction with timing or dosage or duration
  const candidate = confirmed.find(
    (f) => f.type === 'medicine' && (f.fields.timing || f.fields.dosage || f.fields.duration)
  );

  if (!candidate) {
    return null;
  }

  let field: EditableFieldKey = 'timing';
  let expectedValue = candidate.fields.timing || '';
  if (!expectedValue && candidate.fields.dosage) {
    field = 'dosage';
    expectedValue = candidate.fields.dosage;
  } else if (!expectedValue && candidate.fields.duration) {
    field = 'duration';
    expectedValue = candidate.fields.duration;
  }

  const medName = candidate.fields.medicineName || 'this medicine';
  const questionId = `tbq_${crypto.randomBytes(6).toString('hex')}`;

  const questionTemplates: Record<SupportedLanguage, Record<string, string>> = {
    'en-IN': {
      timing: `Just to double-check together: when does your document say to take ${medName}?`,
      dosage: `Just to double-check together: how much ${medName} does your document say to take each time?`,
      duration: `Just to double-check together: for how many days should you take ${medName}?`,
    },
    'ta-IN': {
      timing: `உறுதிப்படுத்திக் கொள்ள: ${medName} மருந்தை எப்போது எடுக்க வேண்டும் என ஆவணத்தில் உள்ளது?`,
      dosage: `உறுதிப்படுத்திக் கொள்ள: ${medName} ஒரு முறைக்கு எவ்வளவு எடுக்க வேண்டும் என ஆவணத்தில் உள்ளது?`,
      duration: `உறுதிப்படுத்திக் கொள்ள: ${medName} எத்தனை நாட்களுக்கு எடுக்க வேண்டும் என ஆவணத்தில் உள்ளது?`,
    },
    'hi-IN': {
      timing: `आइए साथ में जांच लें: आपके दस्तावेज़ के अनुसार ${medName} कब लेनी है?`,
      dosage: `आइए साथ में जांच लें: दस्तावेज़ के अनुसार एक बार में ${medName} की कितनी मात्रा लेनी है?`,
      duration: `आइए साथ में जांच लें: दस्तावेज़ के अनुसार ${medName} कितने दिनों तक लेनी है?`,
    },
  };

  const questionText = questionTemplates[language][field];

  // Expected value stays strictly server-side
  documentStore.saveTeachBackQuestion({
    questionId,
    documentId,
    instructionId: candidate.instructionId,
    field,
    questionText,
    expectedValue,
    language,
    createdAt: Date.now(),
  });

  return {
    questionId,
    instructionId: candidate.instructionId,
    field,
    questionText,
    demoMode,
  };
}

function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SYNONYM_GROUPS: string[][] = [
  [
    'after food',
    'after meal',
    'after eating',
    'உணவுக்குப் பிறகு',
    'சாப்பிட்ட பிறகு',
    'unavukku piragu',
    'saapitta piragu',
    'saapadu piragu',
    'खाने के बाद',
    'भोजन के बाद',
    'khane ke baad',
    'bhojan ke baad',
  ],
  [
    'before food',
    'empty stomach',
    'உணவுக்கு முன்',
    'சாப்பிடும் முன்',
    'unavukku mun',
    'saapdum mun',
    'खाने से पहले',
    'khane se pehle',
  ],
  [
    '1 tablet',
    'one tablet',
    '1 pill',
    '1 மாத்திரை',
    'ஒரு மாத்திரை',
    'oru maathirai',
    '1 goli',
    'ek goli',
    '1 गोली',
    'एक गोली',
  ],
  ['5 days', 'five days', '5 நாட்கள்', 'ஐந்து நாட்கள்', '5 naal', '5 दिन', 'पाँच दिन', '5 din'],
  ['3 days', 'three days', '3 நாட்கள்', 'மூன்று நாட்கள்', '3 naal', '3 दिन', 'तीन दिन', '3 din'],
  ['twice daily', 'two times', '2 times', 'இரு முறை', '2 murai', 'दिन में दो बार', 'do baar'],
];

export function verifyTeachBackAnswer(params: {
  questionId: string;
  transcript: string;
  language: SupportedLanguage;
  demoMode: boolean;
}): TeachBackVerifyResponse | null {
  const { questionId, transcript, language, demoMode } = params;
  const stored = documentStore.getTeachBackQuestion(questionId);
  if (!stored) return null;

  const normInput = normalizeAnswer(transcript);
  const normExpected = normalizeAnswer(stored.expectedValue);

  if (!normInput || normInput.length < 2) {
    return {
      result: 'unclear',
      feedback:
        language === 'ta-IN'
          ? 'உங்கள் பதில் தெளிவாகக் கேட்கவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
          : language === 'hi-IN'
          ? 'आपका उत्तर स्पष्ट नहीं था। कृपया फिर से प्रयास करें।'
          : 'I could not hear that clearly. Please try again at your own pace.',
      demoMode,
    };
  }

  let isMatch = normInput.includes(normExpected) || normExpected.includes(normInput);

  if (!isMatch) {
    for (const group of SYNONYM_GROUPS) {
      const expectedInGroup = group.some((syn) => normExpected.includes(normalizeAnswer(syn)));
      const inputInGroup = group.some((syn) => normInput.includes(normalizeAnswer(syn)));
      if (expectedInGroup && inputInGroup) {
        isMatch = true;
        break;
      }
    }
  }

  if (isMatch) {
    return {
      result: 'correct',
      feedback:
        language === 'ta-IN'
          ? `சரியானது! ஆவணத்தில் "${stored.expectedValue}" என்றே குறிப்பிடப்பட்டுள்ளது.`
          : language === 'hi-IN'
          ? `बिल्कुल सही! दस्तावेज़ में "${stored.expectedValue}" ही लिखा है।`
          : `That matches your document (${stored.expectedValue}). Great job checking carefully!`,
      demoMode,
    };
  }

  return {
    result: 'try_again',
    feedback:
      language === 'ta-IN'
        ? `கவலை வேண்டாம். ஆவணத்தில் "${stored.expectedValue}" எனக் குறிப்பிடப்பட்டுள்ளது. சந்தேகம் இருந்தால் உங்கள் மருத்துவரிடம் கேட்கவும்.`
        : language === 'hi-IN'
        ? `कोई बात नहीं। दस्तावेज़ में "${stored.expectedValue}" लिखा है। यदि कोई संदेह हो तो अपने डॉक्टर से पूछें।`
        : `No worries at all—let's check the document together. It says "${stored.expectedValue}". If anything feels unclear, please ask your doctor.`,
    demoMode,
  };
}
