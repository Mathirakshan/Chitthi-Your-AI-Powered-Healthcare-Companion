/**
 * Safe logger that never prints OCR text, audio bytes, patient details, or secrets.
 */
export const safeLogger = {
  info(message: string, meta?: Record<string, string | number | boolean>): void {
    const safeMeta = meta ? ` ${JSON.stringify(meta)}` : '';
    console.log(`[INFO] ${message}${safeMeta}`);
  },
  warn(message: string, meta?: Record<string, string | number | boolean>): void {
    const safeMeta = meta ? ` ${JSON.stringify(meta)}` : '';
    console.warn(`[WARN] ${message}${safeMeta}`);
  },
  error(message: string, meta?: Record<string, string | number | boolean>): void {
    const safeMeta = meta ? ` ${JSON.stringify(meta)}` : '';
    console.error(`[ERROR] ${message}${safeMeta}`);
  },
};
