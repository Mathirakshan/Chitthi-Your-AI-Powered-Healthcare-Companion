import type {
  DocumentSummary,
  EditableFieldKey,
  MedicalInstruction,
  SupportedLanguage,
} from '@chitthi/shared';

export interface StoredDocument extends DocumentSummary {
  rawOcrText: string;
  fileBuffer?: Buffer;
}

export interface StoredTeachBackQuestion {
  questionId: string;
  documentId: string;
  instructionId: string;
  field: EditableFieldKey;
  questionText: string;
  expectedValue: string;
  language: SupportedLanguage;
  createdAt: number;
}

export interface StoredConsent {
  documentId: string;
  caregiverSummaryGranted: boolean;
  grantedAt?: string;
}

class InMemoryDocumentStore {
  private documents = new Map<string, StoredDocument>();
  private teachBackQuestions = new Map<string, StoredTeachBackQuestion>();
  private consents = new Map<string, StoredConsent>();

  saveDocument(doc: StoredDocument): void {
    this.documents.set(doc.id, doc);
  }

  getDocument(id: string): StoredDocument | undefined {
    const doc = this.documents.get(id);
    if (!doc) return undefined;
    if (new Date(doc.expiresAt).getTime() < Date.now()) {
      this.deleteDocument(id);
      return undefined;
    }
    return doc;
  }

  deleteDocument(id: string): boolean {
    this.consents.delete(id);
    for (const [qId, q] of this.teachBackQuestions.entries()) {
      if (q.documentId === id) {
        this.teachBackQuestions.delete(qId);
      }
    }
    return this.documents.delete(id);
  }

  saveTeachBackQuestion(question: StoredTeachBackQuestion): void {
    this.teachBackQuestions.set(question.questionId, question);
  }

  getTeachBackQuestion(questionId: string): StoredTeachBackQuestion | undefined {
    return this.teachBackQuestions.get(questionId);
  }

  saveConsent(consent: StoredConsent): void {
    this.consents.set(consent.documentId, consent);
  }

  getConsent(documentId: string): StoredConsent | undefined {
    return this.consents.get(documentId);
  }

  clearAll(): void {
    this.documents.clear();
    this.teachBackQuestions.clear();
    this.consents.clear();
  }
}

export const documentStore = new InMemoryDocumentStore();
