import type { MedicalInstruction } from '../types.js';

export const SAMPLE_DISCHARGE_OCR_TEXT = `--- PAGE 1 ---
CITY GENERAL HOSPITAL - DISCHARGE SUMMARY (SYNTHETIC DEMO)
Patient Name: Demo Patient (Synthetic)
Date: 15 Nov 2026
Diagnosis on Record: Acute Respiratory Infection (Recovering)

DISCHARGE MEDICATIONS:
1. Tab. Paracetamol 500 mg — Take 1 tablet twice daily after food for 5 days.
2. Tab. Azithromycin 500 mg — Take 1 tablet once daily for 3 days. (Timing relative to meals not written clearly on chart)
3. Syrup Ambroxol 15 mg/5 ml — Take 5 ml three times a day after food for 5 days.

PRECAUTIONS & CARE INSTRUCTIONS:
- Drink plenty of warm fluids and take adequate rest.
- Avoid cold drinks and dusty environments.

FOLLOW-UP:
- Review in General Medicine OPD after 5 days (20 Nov 2026) with this summary.
- Return immediately to Emergency if breathing difficulty or high fever returns.
`;

export function createSampleInstructions(): MedicalInstruction[] {
  return [
    {
      id: 'ins_sample_1',
      type: 'medicine',
      medicineName: {
        value: 'Tab. Paracetamol 500 mg',
        sourceQuote: 'Tab. Paracetamol 500 mg',
        page: 1,
        status: 'needs_review',
      },
      dosage: {
        value: '1 tablet',
        sourceQuote: 'Take 1 tablet twice daily after food for 5 days.',
        page: 1,
        status: 'needs_review',
      },
      frequency: {
        value: 'twice daily',
        sourceQuote: 'Take 1 tablet twice daily after food for 5 days.',
        page: 1,
        status: 'needs_review',
      },
      timing: {
        value: 'after food',
        sourceQuote: 'Take 1 tablet twice daily after food for 5 days.',
        page: 1,
        status: 'needs_review',
      },
      duration: {
        value: '5 days',
        sourceQuote: 'Take 1 tablet twice daily after food for 5 days.',
        page: 1,
        status: 'needs_review',
      },
      precautions: {
        value: null,
        sourceQuote: null,
        page: 1,
        status: 'missing',
      },
      followUp: {
        value: null,
        sourceQuote: null,
        page: 1,
        status: 'missing',
      },
      issues: [],
      reviewStatus: 'needs_review',
      confirmedFields: [],
    },
    {
      id: 'ins_sample_2',
      type: 'medicine',
      medicineName: {
        value: 'Tab. Azithromycin 500 mg',
        sourceQuote: 'Tab. Azithromycin 500 mg',
        page: 1,
        status: 'needs_review',
      },
      dosage: {
        value: '1 tablet',
        sourceQuote: 'Take 1 tablet once daily for 3 days.',
        page: 1,
        status: 'needs_review',
      },
      frequency: {
        value: 'once daily',
        sourceQuote: 'Take 1 tablet once daily for 3 days.',
        page: 1,
        status: 'needs_review',
      },
      timing: {
        value: null,
        sourceQuote: '(Timing relative to meals not written clearly on chart)',
        page: 1,
        status: 'unclear',
      },
      duration: {
        value: '3 days',
        sourceQuote: 'Take 1 tablet once daily for 3 days.',
        page: 1,
        status: 'needs_review',
      },
      precautions: {
        value: null,
        sourceQuote: null,
        page: 1,
        status: 'missing',
      },
      followUp: {
        value: null,
        sourceQuote: null,
        page: 1,
        status: 'missing',
      },
      issues: ['Timing relative to meals is unclear on the document. Please confirm with your doctor.'],
      reviewStatus: 'needs_review',
      confirmedFields: [],
    },
    {
      id: 'ins_sample_3',
      type: 'medicine',
      medicineName: {
        value: 'Syrup Ambroxol 15 mg/5 ml',
        sourceQuote: 'Syrup Ambroxol 15 mg/5 ml',
        page: 1,
        status: 'needs_review',
      },
      dosage: {
        value: '5 ml',
        sourceQuote: 'Take 5 ml three times a day after food for 5 days.',
        page: 1,
        status: 'needs_review',
      },
      frequency: {
        value: 'three times a day',
        sourceQuote: 'Take 5 ml three times a day after food for 5 days.',
        page: 1,
        status: 'needs_review',
      },
      timing: {
        value: 'after food',
        sourceQuote: 'Take 5 ml three times a day after food for 5 days.',
        page: 1,
        status: 'needs_review',
      },
      duration: {
        value: '5 days',
        sourceQuote: 'Take 5 ml three times a day after food for 5 days.',
        page: 1,
        status: 'needs_review',
      },
      precautions: {
        value: null,
        sourceQuote: null,
        page: 1,
        status: 'missing',
      },
      followUp: {
        value: null,
        sourceQuote: null,
        page: 1,
        status: 'missing',
      },
      issues: [],
      reviewStatus: 'needs_review',
      confirmedFields: [],
    },
    {
      id: 'ins_sample_4',
      type: 'precaution',
      medicineName: {
        value: null,
        sourceQuote: null,
        page: 1,
        status: 'missing',
      },
      dosage: { value: null, sourceQuote: null, page: 1, status: 'missing' },
      frequency: { value: null, sourceQuote: null, page: 1, status: 'missing' },
      timing: { value: null, sourceQuote: null, page: 1, status: 'missing' },
      duration: { value: null, sourceQuote: null, page: 1, status: 'missing' },
      precautions: {
        value: 'Drink plenty of warm fluids, take adequate rest, avoid cold drinks and dusty environments.',
        sourceQuote: 'Drink plenty of warm fluids and take adequate rest. - Avoid cold drinks and dusty environments.',
        page: 1,
        status: 'needs_review',
      },
      followUp: { value: null, sourceQuote: null, page: 1, status: 'missing' },
      issues: [],
      reviewStatus: 'needs_review',
      confirmedFields: [],
    },
    {
      id: 'ins_sample_5',
      type: 'follow_up',
      medicineName: { value: null, sourceQuote: null, page: 1, status: 'missing' },
      dosage: { value: null, sourceQuote: null, page: 1, status: 'missing' },
      frequency: { value: null, sourceQuote: null, page: 1, status: 'missing' },
      timing: { value: null, sourceQuote: null, page: 1, status: 'missing' },
      duration: { value: null, sourceQuote: null, page: 1, status: 'missing' },
      precautions: { value: null, sourceQuote: null, page: 1, status: 'missing' },
      followUp: {
        value: 'Review in General Medicine OPD after 5 days (20 Nov 2026) with this summary. Return immediately to Emergency if breathing difficulty or high fever returns.',
        sourceQuote: 'Review in General Medicine OPD after 5 days (20 Nov 2026) with this summary.',
        page: 1,
        status: 'needs_review',
      },
      issues: [],
      reviewStatus: 'needs_review',
      confirmedFields: [],
    },
  ];
}
