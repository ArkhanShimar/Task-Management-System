import { format, isValid, parseISO } from 'date-fns';
import { BellRing, CalendarDays, Clock3, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Task } from '../types';

const labels = { pending: 'Pending', in_progress: 'In progress', completed: 'Completed' };
const toDate = (value?: string) => value ? parseISO(value.replace(' ', 'T')) : new Date(Number.NaN);
const readableTime = (value?: string) => { const date = toDate(value); return isValid(date) ? format(date, 'MMM d, yyyy · h:mm a') : 'Date unavailable'; };
const readableDueDate = (value?: string) => { const date = toDate(value); return isValid(date) ? format(date, 'MMM d') : 'No date'; };

export function TaskCard({ task, onEdit, onDelete }: { task: Task; onEdit: () => void; onDelete: () => void }) {
  const [menu, setMenu] = useState(false);
  const today = new Date().toLocaleDateString('en-CA');
  const overdue = task.status !== 'completed' && Boolean(task.dueDate) && task.dueDate < today;
  const created = readableTime(task.createdAt);
  const updated = readableTime(task.updatedAt);
  return <article className={'task-card ' + (task.status === 'completed' ? 'done' : '')}>
    <div className="task-card-top"><span className={'priority ' + task.priority}>{task.priority}</span><div className="menu-wrap"><button type="button" className="icon-button" onClick={() => setMenu(!menu)} aria-label={'Actions for ' + task.title}><MoreHorizontal /></button>{menu && <div className="mini-menu"><button type="button" onClick={onEdit}><Pencil />Edit</button><button type="button" className="danger" onClick={onDelete}><Trash2 />Move to bin</button></div>}</div></div>
    <div className="task-copy"><h3 title={task.title}>{task.title}</h3>{task.description && <p>{task.description}</p>}</div>
    <div className="task-dates" title={'Created ' + created + '\nUpdated ' + updated}><Clock3 /><span><b>Created {created}</b><small>Updated {updated}</small>{task.reminderDaysBefore !== null && <small className="card-reminder"><BellRing />{task.reminderDaysBefore === 0 ? 'Due-date reminder' : task.reminderDaysBefore + (task.reminderDaysBefore === 1 ? ' day' : ' days') + ' early'}</small>}</span></div>
    <div className="task-meta"><span className={'status ' + task.status}>{labels[task.status]}</span><span className={overdue ? 'overdue' : ''}><CalendarDays />{overdue ? 'Overdue · ' : ''}{readableDueDate(task.dueDate)}</span></div>
  </article>;
}
