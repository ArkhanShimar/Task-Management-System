import type { RequestHandler } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../database/pool.js';
import { taskQuerySchema, taskSchema } from '../schemas/task.schema.js';
import { AppError } from '../utils/appError.js';

interface TaskRow extends RowDataPacket {
  id: number; title: string; description: string | null; priority: string; status: string;
  dueDate: string; reminderDaysBefore: number | null; createdAt: string; updatedAt: string; deletedAt?: string; daysRemaining?: number;
}

const fields = `SELECT id, title, description, priority, status, due_date AS dueDate,
  reminder_days_before AS reminderDaysBefore, created_at AS createdAt, updated_at AS updatedAt`;

async function clearExpiredTasks(userId: number) {
  await pool.execute(
    'DELETE FROM tasks WHERE user_id = ? AND deleted_at IS NOT NULL AND deleted_at <= DATE_SUB(NOW(), INTERVAL 5 DAY)',
    [userId],
  );
}

export const listTasks: RequestHandler = async (req, res, next) => {
  try {
    const query = taskQuerySchema.parse(req.query);
    const conditions = ['user_id = ?', 'deleted_at IS NULL'];
    const values: Array<string | number> = [req.user!.id];
    if (query.search) { conditions.push('title LIKE ?'); values.push(`%${query.search}%`); }
    if (query.status) { conditions.push('status = ?'); values.push(query.status); }
    if (query.priority) { conditions.push('priority = ?'); values.push(query.priority); }
    if (query.fromDate) { conditions.push('due_date >= ?'); values.push(query.fromDate); }
    if (query.toDate) { conditions.push('due_date <= ?'); values.push(query.toDate); }
    if (query.overdue) conditions.push("due_date < CURDATE() AND status != 'completed'");
    const order = query.sort === 'oldest' ? 'created_at ASC' : query.sort === 'due_date' ? 'due_date ASC, created_at DESC' : 'created_at DESC';
    const [tasks] = await pool.execute<TaskRow[]>(`${fields} FROM tasks WHERE ${conditions.join(' AND ')} ORDER BY ${order}`, values);
    res.json({ tasks });
  } catch (error) { next(error); }
};

export const getTask: RequestHandler = async (req, res, next) => {
  try {
    const [tasks] = await pool.execute<TaskRow[]>(`${fields} FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, [Number(req.params.id), req.user!.id]);
    if (!tasks[0]) throw new AppError(404, 'Task not found.');
    res.json({ task: tasks[0] });
  } catch (error) { next(error); }
};

export const createTask: RequestHandler = async (req, res, next) => {
  try {
    const input = taskSchema.parse(req.body);
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO tasks (user_id, title, description, priority, status, due_date, reminder_days_before) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user!.id, input.title, input.description || null, input.priority, input.status, input.dueDate, input.reminderDaysBefore],
    );
    const [tasks] = await pool.execute<TaskRow[]>(`${fields} FROM tasks WHERE id = ?`, [result.insertId]);
    res.status(201).json({ task: tasks[0], message: 'Task created.' });
  } catch (error) { next(error); }
};

export const updateTask: RequestHandler = async (req, res, next) => {
  try {
    const input = taskSchema.parse(req.body);
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, reminder_days_before = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [input.title, input.description || null, input.priority, input.status, input.dueDate, input.reminderDaysBefore, Number(req.params.id), req.user!.id],
    );
    if (!result.affectedRows) throw new AppError(404, 'Task not found.');
    const [tasks] = await pool.execute<TaskRow[]>(`${fields} FROM tasks WHERE id = ?`, [Number(req.params.id)]);
    res.json({ task: tasks[0], message: 'Task updated.' });
  } catch (error) { next(error); }
};

export const deleteTask: RequestHandler = async (req, res, next) => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE tasks SET deleted_at = NOW() WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [Number(req.params.id), req.user!.id],
    );
    if (!result.affectedRows) throw new AppError(404, 'Task not found.');
    res.json({ message: 'Task moved to the recycle bin.' });
  } catch (error) { next(error); }
};

export const taskSummary: RequestHandler = async (req, res, next) => {
  try {
    await clearExpiredTasks(req.user!.id);
    const [rows] = await pool.execute<RowDataPacket[]>(`SELECT COUNT(*) AS total,
      SUM(status = 'pending') AS pending, SUM(status = 'in_progress') AS inProgress,
      SUM(status = 'completed') AS completed,
      SUM(due_date < CURDATE() AND status != 'completed') AS overdue
      FROM tasks WHERE user_id = ? AND deleted_at IS NULL`, [req.user!.id]);
    const row = rows[0]!;
    res.json({ summary: Object.fromEntries(Object.entries(row).map(([key, value]) => [key, Number(value)])) });
  } catch (error) { next(error); }
};

export const listDeletedTasks: RequestHandler = async (req, res, next) => {
  try {
    await clearExpiredTasks(req.user!.id);
    const [tasks] = await pool.execute<TaskRow[]>(`${fields}, deleted_at AS deletedAt,
      GREATEST(0, 5 - TIMESTAMPDIFF(DAY, deleted_at, NOW())) AS daysRemaining
      FROM tasks WHERE user_id = ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC`, [req.user!.id]);
    res.json({ tasks });
  } catch (error) { next(error); }
};

export const restoreTask: RequestHandler = async (req, res, next) => {
  try {
    await clearExpiredTasks(req.user!.id);
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE tasks SET deleted_at = NULL WHERE id = ? AND user_id = ? AND deleted_at IS NOT NULL',
      [Number(req.params.id), req.user!.id],
    );
    if (!result.affectedRows) throw new AppError(404, 'Deleted task not found.');
    res.json({ message: 'Task restored.' });
  } catch (error) { next(error); }
};

export const permanentlyDeleteTask: RequestHandler = async (req, res, next) => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NOT NULL',
      [Number(req.params.id), req.user!.id],
    );
    if (!result.affectedRows) throw new AppError(404, 'Deleted task not found.');
    res.status(204).send();
  } catch (error) { next(error); }
};

export const emptyRecycleBin: RequestHandler = async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM tasks WHERE user_id = ? AND deleted_at IS NOT NULL', [req.user!.id]);
    res.status(204).send();
  } catch (error) { next(error); }
};
