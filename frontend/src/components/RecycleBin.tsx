import { format, parseISO } from 'date-fns';
import { RefreshCcw, Trash2, TrashIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { Task } from '../types';

export function RecycleBin({ onChange }: { onChange: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try { setTasks((await api.deletedTasks()).tasks); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Could not open the recycle bin.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const restore = async (task: Task) => { await api.restore(task.id); toast.success('Task restored'); await load(); onChange(); };
  const remove = async (task: Task) => {
    if (!confirm('Permanently delete “' + task.title + '”? This cannot be undone.')) return;
    await api.removeForever(task.id); toast.success('Task permanently deleted'); await load();
  };
  const empty = async () => {
    if (!confirm('Permanently delete every task in the recycle bin?')) return;
    await api.emptyBin(); toast.success('Recycle bin emptied'); await load();
  };
  return <section className="bin-page">
    <div className="bin-heading"><div><p className="eyebrow">RECYCLE BIN</p><h1>Recently deleted</h1><p>Tasks stay here for five days before they are removed automatically.</p></div>{tasks.length > 0 && <button className="secondary danger-text" onClick={empty}><Trash2 />Empty bin</button>}</div>
    {loading ? <div className="loading-panel"><span className="spinner" />Looking for deleted tasks…</div> : tasks.length === 0 ? <div className="empty-state bin-empty"><div><TrashIcon /></div><h3>Your recycle bin is empty.</h3><p>Deleted tasks will appear here for five days.</p></div> :
      <div className="bin-list">{tasks.map((task) => <article className="bin-item" key={task.id}><div className="bin-icon"><TrashIcon /></div><div className="bin-copy"><h3>{task.title}</h3><p>Deleted {task.deletedAt && format(parseISO(task.deletedAt.replace(' ', 'T')), 'MMM d, yyyy · h:mm a')}</p><small>Automatically removed in {task.daysRemaining} {task.daysRemaining === 1 ? 'day' : 'days'}</small></div><span className={'priority ' + task.priority}>{task.priority}</span><div className="bin-actions"><button className="secondary" onClick={() => restore(task)}><RefreshCcw />Restore</button><button className="icon-button danger-text" onClick={() => remove(task)} title="Delete forever"><Trash2 /></button></div></article>)}</div>}
  </section>;
}
