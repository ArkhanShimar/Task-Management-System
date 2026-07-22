import { Router } from 'express';
import { listReminders } from '../controllers/reminder.controller.js';
import { requireAuth } from '../middleware/auth.js';
export const reminderRouter = Router();
reminderRouter.use(requireAuth);
reminderRouter.get('/', listReminders);
