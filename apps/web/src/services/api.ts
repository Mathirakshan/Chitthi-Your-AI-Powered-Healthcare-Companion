import type {
  ApiResponse,
  CaregiverSummaryResponse,
  DocumentSummary,
  ExplanationResponse,
  InstructionUpdateInput,
  QuestionResponse,
  SpeakResponse,
  SupportedLanguage,
  TeachBackQuestionResponse,
  TeachBackVerifyResponse,
  TranscribeResponse,
} from '@chitthi/shared';

const BASE = '/api/v1';

async function unwrap<T>(res: Response): Promise<T> {
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success || json.data === null) {
    throw new Error(json.error?.message || 'Request failed. Please try again.');
  }
  return json.data;
}

export const api = {
  async uploadDocument(params: {
    file?: File;
    language: SupportedLanguage;
    demoMode: boolean;
  }): Promise<{ documentId: string; filename: string; demoMode: boolean }> {
    const form = new FormData();
    form.append('language', params.language);
    form.append('demoMode', String(params.demoMode));
    if (params.file) {
      form.append('file', params.file);
    }
    const res = await fetch(`${BASE}/documents`, { method: 'POST', body: form });
    return unwrap(res);
  },

  async processDocument(documentId: string, language: SupportedLanguage): Promise<DocumentSummary> {
    const res = await fetch(`${BASE}/documents/${documentId}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language }),
    });
    return unwrap(res);
  },

  async updateInstructions(
    documentId: string,
    instructions: InstructionUpdateInput[]
  ): Promise<DocumentSummary> {
    const res = await fetch(`${BASE}/documents/${documentId}/instructions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instructions }),
    });
    return unwrap(res);
  },

  async getExplanation(
    documentId: string,
    language: SupportedLanguage
  ): Promise<ExplanationResponse> {
    const res = await fetch(`${BASE}/documents/${documentId}/explanation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language }),
    });
    return unwrap(res);
  },

  async transcribeAudio(
    audioBlob: Blob | null,
    language: SupportedLanguage
  ): Promise<TranscribeResponse> {
    const form = new FormData();
    form.append('language', language);
    form.append('mode', 'codemix');
    if (audioBlob) {
      const ext = audioBlob.type.includes('mp4')
        ? 'mp4'
        : audioBlob.type.includes('ogg')
        ? 'ogg'
        : 'webm';
      form.append('audio', audioBlob, `recording.${ext}`);
    }
    const res = await fetch(`${BASE}/voice/transcribe`, { method: 'POST', body: form });
    return unwrap(res);
  },

  async askQuestion(
    documentId: string,
    question: string,
    language: SupportedLanguage
  ): Promise<QuestionResponse> {
    const res = await fetch(`${BASE}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, question, language }),
    });
    return unwrap(res);
  },

  async speakText(text: string, language: SupportedLanguage): Promise<SpeakResponse> {
    const res = await fetch(`${BASE}/voice/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });
    return unwrap(res);
  },

  async createTeachBackQuestion(
    documentId: string,
    language: SupportedLanguage
  ): Promise<TeachBackQuestionResponse> {
    const res = await fetch(`${BASE}/teachback/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, language }),
    });
    return unwrap(res);
  },

  async verifyTeachBack(
    questionId: string,
    transcript: string,
    language: SupportedLanguage
  ): Promise<TeachBackVerifyResponse> {
    const res = await fetch(`${BASE}/teachback/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, transcript, language }),
    });
    return unwrap(res);
  },

  async createCaregiverSummary(
    documentId: string,
    patientConsent: boolean,
    language: SupportedLanguage
  ): Promise<CaregiverSummaryResponse> {
    const res = await fetch(`${BASE}/caregiver-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, patientConsent, language }),
    });
    return unwrap(res);
  },

  async deleteDocument(documentId: string): Promise<{ deleted: boolean }> {
    const res = await fetch(`${BASE}/documents/${documentId}`, { method: 'DELETE' });
    return unwrap(res);
  },
};
