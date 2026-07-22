import type { RequestHandler } from 'express';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../database/pool.js';

interface ReminderRow extends RowDataPacket {
  id: number; title: string; priority: string; status: string; dueDate: string;
  reminderDaysBefore: number; reminderDate: string; reminderState: 'active' | 'upcoming';
  daysUntilReminder: number;
}

export const listReminders: RequestHandler = async (req, res, next) => {
  try {
    const [reminders] = await pool.execute<ReminderRow[]>(`
      SELECT id, title, priority, status, due_date AS dueDate,
        reminder_days_before AS reminderDaysBefore,
        DATE_FORMAT(DATE_SUB(due_date, INTERVAL reminder_days_before DAY), '%Y-%m-%d') AS reminderDate,
        CASE WHEN DATE_SUB(due_date, INTERVAL reminder_days_before DAY) <= CURDATE()
          THEN 'active' ELSE 'upcoming' END AS reminderState,
        DATEDIFF(DATE_SUB(due_date, INTERVAL reminder_days_before DAY), CURDATE()) AS daysUntilReminder
      FROM tasks
      WHERE user_id = ? AND deleted_at IS NULL AND status != 'completed'
        AND reminder_days_before IS NOT NULL
      ORDER BY reminderState ASC, reminderDate ASC, due_date ASC
    `, [req.user!.id]);
    const active = reminders.filter((reminder) => reminder.reminderState === 'active').length;
    res.json({ reminders, summary: { total: reminders.length, active, upcoming: reminders.length - active } });
  } catch (error) { next(error); }
};
