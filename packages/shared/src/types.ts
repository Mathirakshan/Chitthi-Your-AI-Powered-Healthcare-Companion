export type SupportedLanguage = 'en-IN' | 'ta-IN' | 'hi-IN';

export type FieldStatus = 'needs_review' | 'confirmed' | 'missing' | 'unclear';

export type InstructionType = 'medicine' | 'follow_up' | 'precaution' | 'other';

export interface ExtractedField {
  value: string | null;
  confirmedValue?: string | null;
  sourceQuote: string | null;
  page: number | null;
  status: FieldStatus;
}

export type EditableFieldKey =
  | 'medicineName'
  | 'dosage'
  | 'frequency'
  | 'timing'
  | 'duration'
  | 'precautions'
  | 'followUp';

export interface MedicalInstruction {
  id: string;
  type: InstructionType;
  medicineName: ExtractedField;
  dosage: ExtractedField;
  frequency: ExtractedField;
  timing: ExtractedField;
  duration: ExtractedField;
  precautions: ExtractedField;
  followUp: ExtractedField;
  issues: string[];
  reviewStatus: 'needs_review' | 'confirmed' | 'rejected';
  confirmedFields: EditableFieldKey[];
}

export type ProcessingStatus =
  | 'uploaded'
  | 'processing'
  | 'needs_review'
  | 'confirmed'
  | 'failed';

export interface DocumentSummary {
  id: string;
  filename: string;
  mimeType: string;
  pageCount: number;
  language: SupportedLanguage;
  demoMode: boolean;
  processingStatus: ProcessingStatus;
  instructions: MedicalInstruction[];
  documentWarnings: string[];
  createdAt: string;
  expiresAt: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  requestId: string;
}

export interface InstructionUpdateInput {
  id: string;
  medicineName?: string | null;
  dosage?: string | null;
  frequency?: string | null;
  timing?: string | null;
  duration?: string | null;
  precautions?: string | null;
  followUp?: string | null;
  confirmedFields: EditableFieldKey[];
}

export interface ExplanationSection {
  title: string;
  text: string;
  instructionIds: string[];
  sourceQuotes: string[];
}

export interface ExplanationResponse {
  summary: string;
  sections: ExplanationSection[];
  warnings: string[];
  demoMode: boolean;
}

export type AnswerStatus =
  | 'answered'
  | 'not_in_document'
  | 'needs_confirmation'
  | 'needs_clinician';

export interface QuestionResponse {
  answerText: string;
  answerStatus: AnswerStatus;
  usedInstructionIds: string[];
  sourceSnippets: string[];
  needsClinician: boolean;
  demoMode: boolean;
}

export interface TranscribeResponse {
  transcript: string;
  detectedLanguage?: string;
  needsConfirmation: boolean;
  demoMode: boolean;
}

export interface SpeakResponse {
  audioBase64?: string;
  mimeType?: string;
  useBrowserFallback: boolean;
  demoMode: boolean;
}

export interface TeachBackQuestionResponse {
  questionId: string;
  instructionId: string;
  field: EditableFieldKey;
  questionText: string;
  demoMode: boolean;
}

export type TeachBackResult =
  | 'correct'
  | 'try_again'
  | 'unclear'
  | 'source_uncertain';

export interface TeachBackVerifyResponse {
  result: TeachBackResult;
  feedback: string;
  demoMode: boolean;
}

export interface CaregiverSummaryResponse {
  previewText: string;
  confirmedCount: number;
  unresolvedCount: number;
  generatedAt: string;
  demoMode: boolean;
}
