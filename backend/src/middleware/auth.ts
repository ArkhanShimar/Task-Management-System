import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return next(new AppError(401, 'Please sign in to continue.'));
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; email: string };
    req.user = { id: Number(payload.sub), email: payload.email }; next();
  } catch { next(new AppError(401, 'Your session has expired. Please sign in again.')); }
}
