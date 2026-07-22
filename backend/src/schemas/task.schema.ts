import { z } from 'zod';
const today = () => new Date().toLocaleDateString('en-CA');
export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(150, 'Keep the title under 150 characters.'),
  description: z.string().trim().max(2000, 'Keep the description under 2,000 characters.').optional().default(''),
  priority: z.enum(['low', 'medium', 'high'], { message: 'Choose a priority.' }),
  status: z.enum(['pending', 'in_progress', 'completed'], { message: 'Choose a status.' }),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a valid due date.').refine((date) => date >= today(), 'Due date cannot be earlier than today.'),
});
const optionalDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a valid date.').optional();
export const taskQuerySchema = z.object({
  search: z.string().trim().max(100).optional().default(''),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  sort: z.enum(['newest', 'oldest', 'due_date']).optional().default('newest'),
  fromDate: optionalDate, toDate: optionalDate,
  overdue: z.enum(['true']).optional(),
}).refine((query) => !query.fromDate || !query.toDate || query.fromDate <= query.toDate, {
  message: 'The start date cannot be after the end date.', path: ['fromDate'],
});
