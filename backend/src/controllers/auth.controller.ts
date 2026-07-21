import type { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { RowDataPacket } from 'mysql2';
import { z } from 'zod';
import { env } from '../config/env.js';
import { pool } from '../database/pool.js';
import { AppError } from '../utils/appError.js';
interface UserRow extends RowDataPacket { id: number; name: string; email: string; password: string }
const schema = z.object({ email: z.string().trim().email('Enter a valid email.'), password: z.string().min(1, 'Password is required.') });
export const login: RequestHandler = async (req, res, next) => {
  try {
    const input = schema.parse(req.body);
    const [users] = await pool.execute<UserRow[]>('SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1', [input.email.toLowerCase()]);
    const user = users[0];
    if (!user || !(await bcrypt.compare(input.password, user.password))) throw new AppError(401, 'Email or password is incorrect.');
    const token = jwt.sign({ email: user.email }, env.JWT_SECRET, { subject: String(user.id), expiresIn: env.JWT_EXPIRES_IN } as SignOptions);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) { next(error); }
};
