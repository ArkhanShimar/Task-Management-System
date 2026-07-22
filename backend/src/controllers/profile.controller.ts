import type { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { z } from 'zod';
import { pool } from '../database/pool.js';
import { AppError } from '../utils/appError.js';

interface ProfileRow extends RowDataPacket {
  id: number; name: string; email: string; password?: string; createdAt: string; updatedAt: string;
}
const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must contain at least 2 characters.').max(100),
  email: z.string().trim().email('Enter a valid email address.').max(190),
  currentPassword: z.string().optional().default(''),
  newPassword: z.string().optional().default(''),
}).superRefine((value, context) => {
  if (value.newPassword && value.newPassword.length < 6) context.addIssue({ code: 'custom', path: ['newPassword'], message: 'New password must contain at least 6 characters.' });
  if (value.newPassword && !value.currentPassword) context.addIssue({ code: 'custom', path: ['currentPassword'], message: 'Enter your current password first.' });
});
const fields = 'SELECT id, name, email, created_at AS createdAt, updated_at AS updatedAt FROM users';
export const getProfile: RequestHandler = async (req, res, next) => {
  try { const [users] = await pool.execute<ProfileRow[]>(fields + ' WHERE id = ?', [req.user!.id]); if (!users[0]) throw new AppError(404, 'Profile not found.'); res.json({ user: users[0] }); }
  catch (error) { next(error); }
};
export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    const input = profileSchema.parse(req.body);
    const [users] = await pool.execute<ProfileRow[]>('SELECT id, password FROM users WHERE id = ?', [req.user!.id]);
    const user = users[0]; if (!user) throw new AppError(404, 'Profile not found.');
    let password = user.password!;
    if (input.newPassword) {
      if (!(await bcrypt.compare(input.currentPassword, password))) throw new AppError(422, 'Current password is incorrect.', { currentPassword: ['Current password is incorrect.'] });
      password = await bcrypt.hash(input.newPassword, 12);
    }
    try {
      const [result] = await pool.execute<ResultSetHeader>('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', [input.name, input.email.toLowerCase(), password, req.user!.id]);
      if (!result.affectedRows) throw new AppError(404, 'Profile not found.');
    } catch (error) {
      if ((error as { code?: string }).code === 'ER_DUP_ENTRY') throw new AppError(409, 'That email address is already in use.');
      throw error;
    }
    const [updated] = await pool.execute<ProfileRow[]>(fields + ' WHERE id = ?', [req.user!.id]);
    res.json({ user: updated[0], message: 'Profile updated.' });
  } catch (error) { next(error); }
};
