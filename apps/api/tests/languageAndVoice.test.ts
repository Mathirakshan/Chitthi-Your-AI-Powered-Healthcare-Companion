import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { AddressInfo } from 'node:net';
import { createSampleInstructions } from '@chitthi/shared';
import { createApp } from '../src/app.js';
import { answerGroundedQuestion, generateExplanation } from '../src/services/qaService.js';
import { createTeachBackQuestion, verifyTeachBackAnswer } from '../src/services/teachbackService.js';
import { transcribeAudio, TranscriptionError } from '../src/services/voiceService.js';
import { documentStore } from '../src/storage/documentStore.js';

function prepareConfirmedSample() {
  const instructions = createSampleInstructions();
  instructions[0].medicineName.status = 'confirmed';
  instructions[0].dosage.status = 'confirmed';
  instructions[0].frequency.status = 'confirmed';
  instructions[0].timing.status = 'confirmed';
  instructions[0].duration.status = 'confirmed';
  instructions[0].confirmedFields = ['medicineName', 'dosage', 'frequency', 'timing', 'duration'];
  instructions[0].reviewStatus = 'confirmed';

  instructions[1].medicineName.status = 'confirmed';
  instructions[1].dosage.status = 'confirmed';
  instructions[1].confirmedFields = ['medicineName', 'dosage'];
  instructions[1].reviewStatus = 'confirmed';

  instructions[3].precautions.status = 'confirmed';
  instructions[3].confirmedFields = ['precautions'];
  instructions[3].reviewStatus = 'confirmed';

  instructions[4].followUp.status = 'confirmed';
  instructions[4].confirmedFields = ['followUp'];
  instructions[4].reviewStatus = 'confirmed';

  return instructions;
}

describe('Multilingual Q&A, Code-Mixing & Transcription Errors', () => {
  const originalSarvamKey = process.env.SARVAM_API_KEY;

  beforeEach(() => {
    documentStore.clearAll();
    delete process.env.SARVAM_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalSarvamKey === undefined) {
      delete process.env.SARVAM_API_KEY;
    } else {
      process.env.SARVAM_API_KEY = originalSarvamKey;
    }
  });

  it('generates localized explanations in en-IN, ta-IN, and hi-IN', async () => {
    const instructions = prepareConfirmedSample();

    const en = await generateExplanation({ instructions, language: 'en-IN', demoMode: true });
    const ta = await generateExplanation({ instructions, language: 'ta-IN', demoMode: true });
    const hi = await generateExplanation({ instructions, language: 'hi-IN', demoMode: true });

    expect(en.summary).toContain('confirmed document details');
    expect(ta.summary).toContain('உறுதிப்படுத்திய ஆவண விவரங்களின்');
    expect(hi.summary).toContain('पुष्टि किए गए दस्तावेज़');
    expect(ta.sections.some((s) => s.text.includes('முன்னெச்சரிக்கை'))).toBe(true);
    expect(hi.sections.some((s) => s.text.includes('अगली जाँच'))).toBe(true);
  });

  it('answers English, Tamil, Hindi, and Tamil-English code-mixed questions in the selected language', async () => {
    const instructions = prepareConfirmedSample();

    const taCodeMix = await answerGroundedQuestion({
      instructions,
      question: 'Paracetamol eppo sapdanum?',
      language: 'ta-IN',
      demoMode: true,
    });
    expect(taCodeMix.answerStatus).toBe('answered');
    expect(taCodeMix.answerText).toContain('உங்கள் உறுதிப்படுத்தப்பட்ட ஆவணத்தின்படி');
    expect(taCodeMix.answerText).toContain('after food');

    const taUnclearTiming = await answerGroundedQuestion({
      instructions,
      question: 'Azithromycin எப்போது saapdanum?',
      language: 'ta-IN',
      demoMode: true,
    });
    expect(taUnclearTiming.answerStatus).toBe('not_in_document');
    expect(taUnclearTiming.needsClinician).toBe(true);

    const hiRes = await answerGroundedQuestion({
      instructions,
      question: 'मुझे पैरासिटामोल कब लेनी है?',
      language: 'hi-IN',
      demoMode: true,
    });
    expect(hiRes.answerStatus).toBe('answered');
    expect(hiRes.answerText).toContain('आपके पुष्टि किए गए दस्तावेज़ के अनुसार');

    const followUpTa = await answerGroundedQuestion({
      instructions,
      question: 'adutha doctor visit எப்போது?',
      language: 'ta-IN',
      demoMode: true,
    });
    expect(followUpTa.answerStatus).toBe('answered');
    expect(followUpTa.answerText).toContain('தொடர் பரிசோதனை');
  });

  it('verifies Tamil-English and Hindi-English code-mixed teach-back answers', () => {
    const instructions = prepareConfirmedSample();

    const qTa = createTeachBackQuestion({
      documentId: 'doc_1',
      instructions,
      language: 'ta-IN',
      demoMode: true,
    });
    expect(qTa).not.toBeNull();
    const resTanglish = verifyTeachBackAnswer({
      questionId: qTa!.questionId,
      transcript: 'saapitta piragu',
      language: 'ta-IN',
      demoMode: true,
    });
    expect(resTanglish?.result).toBe('correct');

    const qHi = createTeachBackQuestion({
      documentId: 'doc_1',
      instructions,
      language: 'hi-IN',
      demoMode: true,
    });
    expect(qHi).not.toBeNull();
    const resHinglish = verifyTeachBackAnswer({
      questionId: qHi!.questionId,
      transcript: 'khane ke baad',
      language: 'hi-IN',
      demoMode: true,
    });
    expect(resHinglish?.result).toBe('correct');
  });

  it('throws explicit TranscriptionError instead of returning fake transcripts when audio is empty or STT is unconfigured', async () => {
    await expect(
      transcribeAudio({ audioBuffer: undefined, language: 'ta-IN', mode: 'codemix' })
    ).rejects.toThrowError(TranscriptionError);

    await expect(
      transcribeAudio({
        audioBuffer: Buffer.from('fake-webm-bytes'),
        mimeType: 'audio/webm',
        language: 'ta-IN',
        mode: 'codemix',
      })
    ).rejects.toMatchObject({ code: 'STT_NOT_CONFIGURED' });
  });

  it('passes dynamic language_code and codemix mode to Sarvam STT and surfaces API errors', async () => {
    process.env.SARVAM_API_KEY = 'test-key';
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ transcript: 'Paracetamol எப்போது எடுக்கணும்', language_code: 'ta-IN' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const okResult = await transcribeAudio({
      audioBuffer: Buffer.from('audio-bytes'),
      mimeType: 'audio/webm',
      language: 'ta-IN',
      mode: 'codemix',
    });

    expect(okResult.transcript).toBe('Paracetamol எப்போது எடுக்கணும்');
    expect(okResult.detectedLanguage).toBe('ta-IN');
    expect(okResult.demoMode).toBe(false);

    const [, init] = fetchMock.mock.calls[0];
    const body = init?.body as FormData;
    expect(body.get('language_code')).toBe('ta-IN');
    expect(body.get('mode')).toBe('codemix');

    fetchMock.mockResolvedValueOnce(new Response('Bad Gateway', { status: 502 }));
    await expect(
      transcribeAudio({
        audioBuffer: Buffer.from('audio-bytes'),
        mimeType: 'audio/webm',
        language: 'hi-IN',
        mode: 'codemix',
      })
    ).rejects.toMatchObject({ code: 'TRANSCRIPTION_FAILED' });
  });

  it('supports end-to-end HTTP flow with dynamic language switching and transcription error status', async () => {
    const app = createApp();
    const server = await new Promise<import('node:http').Server>((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });

    try {
      const { port } = server.address() as AddressInfo;
      const base = `http://127.0.0.1:${port}/api/v1`;

      // 1. Upload demo document
      const uploadForm = new FormData();
      uploadForm.append('language', 'en-IN');
      uploadForm.append('demoMode', 'true');
      const upRes = await fetch(`${base}/documents`, { method: 'POST', body: uploadForm });
      expect(upRes.status).toBe(201);
      const upJson = (await upRes.json()) as { data: { documentId: string } };
      const docId = upJson.data.documentId;

      // 2. Process document
      const procRes = await fetch(`${base}/documents/${docId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'en-IN' }),
      });
      expect(procRes.status).toBe(200);

      // 3. Confirm Paracetamol fields
      const patchRes = await fetch(`${base}/documents/${docId}/instructions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructions: [
            {
              id: 'ins_sample_1',
              confirmedFields: ['medicineName', 'dosage', 'frequency', 'timing', 'duration'],
            },
          ],
        }),
      });
      expect(patchRes.status).toBe(200);

      // 4. Switch language dynamically to Tamil & Hindi for explanation
      for (const lang of ['en-IN', 'ta-IN', 'hi-IN'] as const) {
        const expRes = await fetch(`${base}/documents/${docId}/explanation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: lang }),
        });
        expect(expRes.status).toBe(200);
        const expJson = (await expRes.json()) as { data: { summary: string } };
        expect(expJson.data.summary.length).toBeGreaterThan(10);
      }

      // 5. Ask Tamil-English code-mixed question
      const qaRes = await fetch(`${base}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: docId,
          question: 'Paracetamol eppo sapdanum?',
          language: 'ta-IN',
        }),
      });
      expect(qaRes.status).toBe(200);
      const qaJson = (await qaRes.json()) as { data: { answerStatus: string; answerText: string } };
      expect(qaJson.data.answerStatus).toBe('answered');
      expect(qaJson.data.answerText).toContain('உங்கள் உறுதிப்படுத்தப்பட்ட ஆவணத்தின்படி');

      // 6. Verify /voice/transcribe returns explicit error JSON instead of fake text when unconfigured/empty
      const emptyForm = new FormData();
      emptyForm.append('language', 'ta-IN');
      const errRes = await fetch(`${base}/voice/transcribe`, { method: 'POST', body: emptyForm });
      expect(errRes.status).toBe(400);
      const errJson = (await errRes.json()) as { success: boolean; error: { code: string; message: string } };
      expect(errJson.success).toBe(false);
      expect(errJson.error.code).toBe('EMPTY_AUDIO');
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
