import { describe, expect, it } from 'vitest';
import { taskQuerySchema, taskSchema } from '../schemas/task.schema.js';

describe('task validation', () => {
  const valid = { title: 'Write project notes', description: '', priority: 'medium', status: 'pending', dueDate: new Date().toLocaleDateString('en-CA') };
  it('accepts a complete task', () => expect(taskSchema.safeParse(valid).success).toBe(true));
  it('rejects a blank title', () => expect(taskSchema.safeParse({ ...valid, title: '  ' }).success).toBe(false));
  it('rejects a past due date', () => expect(taskSchema.safeParse({ ...valid, dueDate: '2020-01-01' }).success).toBe(false));
  it('accepts combined filters', () => expect(taskQuerySchema.parse({ status: 'pending', priority: 'high', sort: 'due_date' })).toMatchObject({ status: 'pending', priority: 'high' }));
  it('accepts a valid date range', () => expect(taskQuerySchema.safeParse({ fromDate: '2026-07-01', toDate: '2026-07-31' }).success).toBe(true));
  it('rejects a reversed date range', () => expect(taskQuerySchema.safeParse({ fromDate: '2026-08-01', toDate: '2026-07-01' }).success).toBe(false));
});
