import crypto from 'node:crypto';
import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import {
  ALLOWED_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  type DocumentSummary,
  type EditableFieldKey,
  type SupportedLanguage,
} from '@chitthi/shared';
import { documentStore, type StoredDocument } from '../storage/documentStore.js';
import { extractDocumentText } from '../services/ocrService.js';
import { extractStructuredInstructions } from '../services/extractionService.js';
import { answerGroundedQuestion, generateExplanation } from '../services/qaService.js';
import { synthesizeSpeech, transcribeAudio, TranscriptionError } from '../services/voiceService.js';
import { createTeachBackQuestion, verifyTeachBackAnswer } from '../services/teachbackService.js';
import { buildCaregiverSummary } from '../services/consentService.js';
import { createRequestId, sendError, sendSuccess } from '../utils/response.js';
import { safeLogger } from '../utils/logger.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

const LanguageSchema = z.enum(['en-IN', 'ta-IN', 'hi-IN']).default('en-IN');

function getReqId(req: Request): string {
  return (req as Request & { requestId?: string }).requestId || createRequestId();
}

function toPublicSummary(doc: StoredDocument): DocumentSummary {
  const { rawOcrText: _ocr, fileBuffer: _buf, ...summary } = doc;
  return summary;
}

export const apiRouter = Router();

apiRouter.get('/health', (req: Request, res: Response) => {
  sendSuccess(res, { status: 'ok', service: 'chitthi-api' }, getReqId(req));
});

apiRouter.post(
  '/documents',
  upload.single('file'),
  (req: Request, res: Response) => {
    const requestId = getReqId(req);
    const demoMode =
      req.body?.demoMode === 'true' ||
      req.body?.demoMode === true ||
      process.env.USE_DEMO_MODE === 'true';

    const parsedLang = LanguageSchema.safeParse(req.body?.language || 'en-IN');
    if (!parsedLang.success) {
      return sendError(res, 'UNSUPPORTED_LANGUAGE', 'Language must be en-IN, ta-IN, or hi-IN.', requestId, 400);
    }

    if (!req.file && !demoMode) {
      return sendError(res, 'MISSING_FILE', 'Please upload a PDF, JPG or PNG file.', requestId, 400);
    }

    if (req.file && !ALLOWED_MIME_TYPES.includes(req.file.mimetype as (typeof ALLOWED_MIME_TYPES)[number])) {
      return sendError(
        res,
        'UNSUPPORTED_FILE',
        'Please upload a PDF, JPG or PNG.',
        requestId,
        400
      );
    }

    const docId = `doc_${crypto.randomBytes(6).toString('hex')}`;
    const now = new Date();
    const ttlMinutes = Number(process.env.DOCUMENT_TTL_MINUTES || 60);
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

    const storedDoc: StoredDocument = {
      id: docId,
      filename: req.file?.originalname || 'sample-discharge-summary.pdf',
      mimeType: req.file?.mimetype || 'application/pdf',
      pageCount: 1,
      language: parsedLang.data,
      demoMode: Boolean(demoMode || !req.file),
      processingStatus: 'uploaded',
      rawOcrText: '',
      fileBuffer: req.file?.buffer,
      instructions: [],
      documentWarnings: [],
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    documentStore.saveDocument(storedDoc);
    safeLogger.info('Document registered', { documentId: docId, demoMode: storedDoc.demoMode });

    return sendSuccess(
      res,
      {
        documentId: storedDoc.id,
        filename: storedDoc.filename,
        status: storedDoc.processingStatus,
        pageCount: storedDoc.pageCount,
        demoMode: storedDoc.demoMode,
      },
      requestId,
      201
    );
  }
);

apiRouter.post('/documents/:documentId/process', async (req: Request, res: Response) => {
  const requestId = getReqId(req);
  const docId = String(req.params.documentId);
  const doc = documentStore.getDocument(docId);

  if (!doc) {
    return sendError(res, 'DOCUMENT_NOT_FOUND', 'Document session not found or expired.', requestId, 404);
  }

  const bodySchema = z.object({ language: LanguageSchema.optional() });
  const parsed = bodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return sendError(res, 'INVALID_REQUEST', 'Invalid language parameter.', requestId, 400);
  }

  const language: SupportedLanguage = parsed.data.language ?? doc.language;
  doc.language = language;
  doc.processingStatus = 'processing';

  try {
    const ocrResult = await extractDocumentText({
      filename: doc.filename,
      mimeType: doc.mimeType,
      buffer: doc.fileBuffer,
      demoMode: doc.demoMode,
    });

    const extraction = await extractStructuredInstructions({
      rawOcrText: ocrResult.rawText,
      demoMode: ocrResult.demoMode,
    });

    doc.rawOcrText = ocrResult.rawText;
    doc.pageCount = ocrResult.pageCount;
    doc.instructions = extraction.instructions;
    doc.documentWarnings = extraction.warnings;
    doc.demoMode = extraction.demoMode;
    doc.processingStatus = 'needs_review';
    // Clear raw file buffer after extraction to minimize retention
    doc.fileBuffer = undefined;

    documentStore.saveDocument(doc);
    safeLogger.info('Document processed', { documentId: doc.id, count: doc.instructions.length });

    return sendSuccess(res, toPublicSummary(doc), requestId);
  } catch (err) {
    doc.processingStatus = 'failed';
    documentStore.saveDocument(doc);
    const code = err instanceof Error && err.message === 'OCR_UNAVAILABLE' ? 'OCR_UNAVAILABLE' : 'PROCESSING_FAILED';
    return sendError(
      res,
      code,
      'Could not read the document clearly. Please try a clearer photo or use the sample document.',
      requestId,
      503
    );
  }
});

const PatchInstructionsSchema = z.object({
  instructions: z.array(
    z.object({
      id: z.string(),
      medicineName: z.string().nullable().optional(),
      dosage: z.string().nullable().optional(),
      frequency: z.string().nullable().optional(),
      timing: z.string().nullable().optional(),
      duration: z.string().nullable().optional(),
      precautions: z.string().nullable().optional(),
      followUp: z.string().nullable().optional(),
      confirmedFields: z.array(
        z.enum(['medicineName', 'dosage', 'frequency', 'timing', 'duration', 'precautions', 'followUp'])
      ),
    })
  ),
});

apiRouter.patch('/documents/:documentId/instructions', (req: Request, res: Response) => {
  const requestId = getReqId(req);
  const doc = documentStore.getDocument(String(req.params.documentId));

  if (!doc) {
    return sendError(res, 'DOCUMENT_NOT_FOUND', 'Document session not found or expired.', requestId, 404);
  }

  const parsed = PatchInstructionsSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 'INVALID_PAYLOAD', 'Invalid instruction update payload.', requestId, 400);
  }

  const editableKeys: EditableFieldKey[] = [
    'medicineName',
    'dosage',
    'frequency',
    'timing',
    'duration',
    'precautions',
    'followUp',
  ];

  for (const update of parsed.data.instructions) {
    const target = doc.instructions.find((ins) => ins.id === update.id);
    if (!target) continue;

    target.confirmedFields = update.confirmedFields;

    for (const key of editableKeys) {
      const incomingVal = update[key];
      if (incomingVal !== undefined) {
        target[key].confirmedValue = incomingVal;
      }
      if (update.confirmedFields.includes(key)) {
        const effectiveVal = target[key].confirmedValue ?? target[key].value;
        if (effectiveVal && effectiveVal.trim() !== '') {
          target[key].status = 'confirmed';
        }
      } else if (target[key].status === 'confirmed') {
        target[key].status = target[key].value ? 'needs_review' : 'missing';
      }
    }

    target.reviewStatus = update.confirmedFields.length > 0 ? 'confirmed' : 'needs_review';
  }

  const anyConfirmed = doc.instructions.some((ins) => ins.reviewStatus === 'confirmed');
  if (anyConfirmed) {
    doc.processingStatus = 'confirmed';
  }

  documentStore.saveDocument(doc);
  return sendSuccess(res, toPublicSummary(doc), requestId);
});

apiRouter.post('/documents/:documentId/explanation', async (req: Request, res: Response) => {
  const requestId = getReqId(req);
  const doc = documentStore.getDocument(String(req.params.documentId));

  if (!doc) {
    return sendError(res, 'DOCUMENT_NOT_FOUND', 'Document session not found or expired.', requestId, 404);
  }

  const parsed = z.object({ language: LanguageSchema.optional() }).safeParse(req.body ?? {});
  const language: SupportedLanguage = parsed.success && parsed.data.language ? parsed.data.language : doc.language;

  const explanation = await generateExplanation({
    instructions: doc.instructions,
    language,
    demoMode: doc.demoMode,
  });

  return sendSuccess(res, explanation, requestId);
});

apiRouter.post('/voice/transcribe', upload.single('audio'), async (req: Request, res: Response) => {
  const requestId = getReqId(req);
  const parsedLang = LanguageSchema.safeParse(req.body?.language || 'en-IN');
  if (!parsedLang.success) {
    return sendError(res, 'UNSUPPORTED_LANGUAGE', 'Unsupported language.', requestId, 400);
  }

  const mode = req.body?.mode === 'codemix' ? 'codemix' : 'transcribe';
  try {
    const result = await transcribeAudio({
      audioBuffer: req.file?.buffer,
      mimeType: req.file?.mimetype,
      language: parsedLang.data,
      mode,
    });
    return sendSuccess(res, result, requestId);
  } catch (err) {
    if (err instanceof TranscriptionError) {
      return sendError(res, err.code, err.message, requestId, err.status);
    }
    return sendError(
      res,
      'TRANSCRIPTION_FAILED',
      'Unable to transcribe audio. Please try again or type your question.',
      requestId,
      500
    );
  }
});

apiRouter.post('/voice/speak', async (req: Request, res: Response) => {
  const requestId = getReqId(req);
  const parsed = z
    .object({
      text: z.string().min(1).max(1000),
      language: LanguageSchema,
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 'INVALID_PAYLOAD', 'Text and valid language are required.', requestId, 400);
  }

  const result = await synthesizeSpeech(parsed.data);
  return sendSuccess(res, result, requestId);
});

apiRouter.post('/questions', async (req: Request, res: Response) => {
  const requestId = getReqId(req);
  const parsed = z
    .object({
      documentId: z.string().min(1),
      question: z.string().min(1).max(500),
      language: LanguageSchema,
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 'INVALID_PAYLOAD', 'documentId, question, and language are required.', requestId, 400);
  }

  const doc = documentStore.getDocument(parsed.data.documentId);
  if (!doc) {
    return sendError(res, 'DOCUMENT_NOT_FOUND', 'Document session not found or expired.', requestId, 404);
  }

  const result = await answerGroundedQuestion({
    instructions: doc.instructions,
    question: parsed.data.question,
    language: parsed.data.language,
    demoMode: doc.demoMode,
  });

  return sendSuccess(res, result, requestId);
});

apiRouter.post('/teachback/questions', (req: Request, res: Response) => {
  const requestId = getReqId(req);
  const parsed = z
    .object({
      documentId: z.string().min(1),
      language: LanguageSchema,
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 'INVALID_PAYLOAD', 'documentId and language are required.', requestId, 400);
  }

  const doc = documentStore.getDocument(parsed.data.documentId);
  if (!doc) {
    return sendError(res, 'DOCUMENT_NOT_FOUND', 'Document session not found or expired.', requestId, 404);
  }

  const question = createTeachBackQuestion({
    documentId: doc.id,
    instructions: doc.instructions,
    language: parsed.data.language,
    demoMode: doc.demoMode,
  });

  if (!question) {
    return sendError(
      res,
      'NO_CONFIRMED_FIELDS',
      'Please confirm at least one medicine instruction before starting teach-back.',
      requestId,
      400
    );
  }

  return sendSuccess(res, question, requestId);
});

apiRouter.post('/teachback/verify', (req: Request, res: Response) => {
  const requestId = getReqId(req);
  const parsed = z
    .object({
      questionId: z.string().min(1),
      transcript: z.string(),
      language: LanguageSchema,
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 'INVALID_PAYLOAD', 'questionId, transcript, and language are required.', requestId, 400);
  }

  const verification = verifyTeachBackAnswer({
    questionId: parsed.data.questionId,
    transcript: parsed.data.transcript,
    language: parsed.data.language,
    demoMode: process.env.USE_DEMO_MODE !== 'false',
  });

  if (!verification) {
    return sendError(res, 'QUESTION_NOT_FOUND', 'Teach-back question not found or expired.', requestId, 404);
  }

  return sendSuccess(res, verification, requestId);
});

apiRouter.post('/caregiver-summary', (req: Request, res: Response) => {
  const requestId = getReqId(req);
  const parsed = z
    .object({
      documentId: z.string().min(1),
      patientConsent: z.boolean(),
      language: LanguageSchema,
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 'INVALID_PAYLOAD', 'Invalid caregiver summary request.', requestId, 400);
  }

  if (parsed.data.patientConsent !== true) {
    return sendError(
      res,
      'CONSENT_REQUIRED',
      'Explicit patient consent is required before generating a caregiver summary.',
      requestId,
      403
    );
  }

  const doc = documentStore.getDocument(parsed.data.documentId);
  if (!doc) {
    return sendError(res, 'DOCUMENT_NOT_FOUND', 'Document session not found or expired.', requestId, 404);
  }

  const summary = buildCaregiverSummary({
    documentId: doc.id,
    instructions: doc.instructions,
    patientConsent: parsed.data.patientConsent,
    language: parsed.data.language,
    demoMode: doc.demoMode,
  });

  if ('error' in summary) {
    return sendError(res, 'CONSENT_REQUIRED', 'Explicit patient consent is required.', requestId, 403);
  }

  return sendSuccess(res, summary, requestId);
});

apiRouter.delete('/documents/:documentId', (req: Request, res: Response) => {
  const requestId = getReqId(req);
  const deleted = documentStore.deleteDocument(String(req.params.documentId));
  return sendSuccess(res, { deleted }, requestId);
});
