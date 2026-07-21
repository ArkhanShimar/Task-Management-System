import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError.js';
export const notFound: RequestHandler = (req, _res, next) => next(new AppError(404, ('Cannot ' + req.method + ' ' + req.path)));
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) { res.status(422).json({ message: 'Please check the highlighted fields.', errors: error.flatten().fieldErrors }); return; }
  const status = error instanceof AppError ? error.statusCode : 500;
  if (status === 500) console.error(error);
  res.status(status).json({ message: error.message || 'Something went wrong.' });
};
