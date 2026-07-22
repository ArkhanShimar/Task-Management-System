export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'in_progress' | 'completed';
export type Task = {
  id: number; title: string; description: string | null; priority: Priority; status: Status;
  dueDate: string; reminderDaysBefore: number | null; createdAt: string; updatedAt: string;
  deletedAt?: string; daysRemaining?: number;
};
export type TaskInput = { title: string; description: string; priority: Priority; status: Status; dueDate: string; reminderDaysBefore: number | null };
export type Reminder = { id: number; title: string; priority: Priority; status: Status; dueDate: string; reminderDaysBefore: number; reminderDate: string; reminderState: 'active' | 'upcoming'; daysUntilReminder: number };
export type ReminderSummary = { total: number; active: number; upcoming: number };
export type User = { id: number; name: string; email: string; createdAt?: string; updatedAt?: string };
export type Summary = { total: number; pending: number; inProgress: number; completed: number; overdue: number };
