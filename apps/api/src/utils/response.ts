import crypto from 'node:crypto';
import type { Response } from 'express';
import type { ApiResponse } from '@chitthi/shared';

export function createRequestId(): string {
  return `req_${crypto.randomBytes(6).toString('hex')}`;
}

export function sendSuccess<T>(res: Response, data: T, requestId: string, statusCode = 200): void {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    error: null,
    requestId,
  };
  res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  requestId: string,
  statusCode = 400
): void {
  const payload: ApiResponse<null> = {
    success: false,
    data: null,
    error: { code, message },
    requestId,
  };
  res.status(statusCode).json(payload);
}
