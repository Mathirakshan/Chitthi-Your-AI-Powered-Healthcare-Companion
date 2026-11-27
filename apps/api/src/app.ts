import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { apiRouter } from './routes/apiRoutes.js';
import { createRequestId, sendError } from './utils/response.js';

export function createApp() {
  const app = express();

  const allowedOrigin = process.env.WEB_ORIGIN || 'http://localhost:5173';
  app.use(
    cors({
      origin: allowedOrigin,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    })
  );

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.use(express.json({ limit: '1mb' }));

  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as Request & { requestId?: string }).requestId = createRequestId();
    next();
  });

  app.use('/api/v1', apiRouter);

  // Safe error handler (handles Multer size errors & unexpected errors without leaking stack traces)
  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    const requestId = (req as Request & { requestId?: string }).requestId || createRequestId();
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'FILE_TOO_LARGE', 'File exceeds the 10 MB limit.', requestId, 400);
    }
    return sendError(res, 'INTERNAL_ERROR', 'Something went wrong. Please try again.', requestId, 500);
  });

  return app;
}
