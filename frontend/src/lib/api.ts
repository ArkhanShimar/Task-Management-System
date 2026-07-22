import type { Reminder, ReminderSummary, Summary, Task, TaskInput, User } from '../types';
const base = import.meta.env.VITE_API_URL || '/api';
class ApiError extends Error { constructor(message: string, public errors?: Record<string, string[]>) { super(message); } }
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('daymark_token');
  const response = await fetch(base + path, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...options.headers } });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({ message: 'Could not reach the server.' }));
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
      localStorage.removeItem('daymark_token'); localStorage.removeItem('daymark_user'); window.location.assign('/login');
    }
    throw new ApiError(data.message, data.errors);
  }
  return data;
}
export const api = {
  login: (email: string, password: string) => request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  profile: () => request<{ user: User }>('/profile'),
  updateProfile: (profile: { name: string; email: string; currentPassword: string; newPassword: string }) => request<{ user: User; message: string }>('/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  tasks: (query: string) => request<{ tasks: Task[] }>('/tasks' + query),
  summary: () => request<{ summary: Summary }>('/tasks/summary'),
  reminders: () => request<{ reminders: Reminder[]; summary: ReminderSummary }>('/reminders'),
  create: (task: TaskInput) => request<{ task: Task }>('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  update: (id: number, task: TaskInput) => request<{ task: Task }>('/tasks/' + id, { method: 'PUT', body: JSON.stringify(task) }),
  remove: (id: number) => request<{ message: string }>('/tasks/' + id, { method: 'DELETE' }),
  deletedTasks: () => request<{ tasks: Task[] }>('/tasks/recycle-bin'),
  restore: (id: number) => request<{ message: string }>('/tasks/' + id + '/restore', { method: 'PATCH' }),
  removeForever: (id: number) => request<void>('/tasks/' + id + '/permanent', { method: 'DELETE' }),
  emptyBin: () => request<void>('/tasks/recycle-bin', { method: 'DELETE' }),
};
export { ApiError };
