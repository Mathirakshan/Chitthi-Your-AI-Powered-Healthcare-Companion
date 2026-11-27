import { SAMPLE_DISCHARGE_OCR_TEXT } from '@chitthi/shared';
import { safeLogger } from '../utils/logger.js';

export interface OcrResult {
  rawText: string;
  pageCount: number;
  demoMode: boolean;
}

/**
 * Extracts text from a document buffer or returns the synthetic sample text in demo mode.
 */
export async function extractDocumentText(params: {
  filename: string;
  mimeType: string;
  buffer?: Buffer;
  demoMode: boolean;
}): Promise<OcrResult> {
  const { filename, mimeType, buffer, demoMode } = params;

  if (demoMode || filename === 'sample-discharge-summary.pdf' || !buffer) {
    return {
      rawText: SAMPLE_DISCHARGE_OCR_TEXT,
      pageCount: 1,
      demoMode: true,
    };
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      const base64Data = buffer.toString('base64');
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: 'Extract all visible text verbatim from this medical document. Preserve page markers like --- PAGE 1 ---. Do not summarize or invent missing text.',
                  },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const json = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const extracted = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (extracted && extracted.trim().length > 0) {
          return {
            rawText: extracted,
            pageCount: 1,
            demoMode: false,
          };
        }
      }
    } catch {
      safeLogger.warn('External OCR provider failed, checking fallback');
    }
  }

  // If it's a plain text-like PDF or text upload, attempt basic UTF-8 string extraction
  if (mimeType === 'application/pdf') {
    const rawUtf8 = buffer.toString('utf8');
    const readableMatches = rawUtf8.match(/\(([^()]{4,})\)/g);
    if (readableMatches && readableMatches.length > 2) {
      const text = readableMatches.map((m) => m.slice(1, -1)).join(' ');
      return {
        rawText: `--- PAGE 1 ---\n${text}`,
        pageCount: 1,
        demoMode: true,
      };
    }
  }

  throw new Error('OCR_UNAVAILABLE');
}
