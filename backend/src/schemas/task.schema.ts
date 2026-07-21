import { z } from 'zod';
const today = () => new Date().toLocaleDateString('en-CA');
export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(150),
  description: z.string().trim().max(2000).optional().default(''),
  priority: z.enum(['low', 'medium', 'high'], { message: 'Choose a priority.' }),
  status: z.enum(['pending', 'in_progress', 'completed'], { message: 'Choose a status.' }),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a valid due date.').refine((date) => date >= today(), 'Due date cannot be earlier than today.'),
});
export const taskQuerySchema = z.object({
  search: z.string().trim().max(100).optional().default(''),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  sort: z.enum(['newest', 'oldest', 'due_date']).optional().default('newest'),
});
