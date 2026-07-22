import { format, parseISO } from 'date-fns';
import { CalendarDays, Clock3, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Task } from '../types';
const labels = { pending: 'Pending', in_progress: 'In progress', completed: 'Completed' };
const readableTime = (value: string) => format(parseISO(value.replace(' ', 'T')), 'MMM d, yyyy · h:mm a');

export function TaskCard({ task, onEdit, onDelete }: { task: Task; onEdit: () => void; onDelete: () => void }) {
  const [menu, setMenu] = useState(false);
  const overdue = task.status !== 'completed' && task.dueDate < new Date().toLocaleDateString('en-CA');
  return <article className={'task-card ' + (task.status === 'completed' ? 'done' : '')}>
    <div className="task-card-top"><span className={'priority ' + task.priority}>{task.priority}</span><div className="menu-wrap"><button className="icon-button" onClick={() => setMenu(!menu)} aria-label="Task actions"><MoreHorizontal /></button>{menu && <div className="mini-menu"><button onClick={onEdit}><Pencil />Edit</button><button className="danger" onClick={onDelete}><Trash2 />Move to bin</button></div>}</div></div>
    <h3>{task.title}</h3>{task.description && <p>{task.description}</p>}
    <div className="task-dates" title={'Created ' + readableTime(task.createdAt) + '\nUpdated ' + readableTime(task.updatedAt)}>
      <Clock3 /><span>Created {readableTime(task.createdAt)}<small>Updated {readableTime(task.updatedAt)}</small></span>
    </div>
    <div className="task-meta"><span className={'status ' + task.status}>{labels[task.status]}</span><span className={overdue ? 'overdue' : ''}><CalendarDays />{overdue ? 'Overdue · ' : ''}{format(parseISO(task.dueDate), 'MMM d')}</span></div>
  </article>;
}
