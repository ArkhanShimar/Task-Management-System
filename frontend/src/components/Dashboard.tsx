import { useCallback, useEffect, useState } from 'react';
import { CalendarRange, CheckCircle2, ChevronDown, Clock3, ListTodo, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Plus, Search, TimerReset, Trash2, UserRound, X, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { Priority, Status, Summary, Task, TaskInput } from '../types';
import { useAuth } from '../context/AuthContext';
import { RecycleBin } from './RecycleBin';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { ThemeToggle } from './ThemeToggle';
import { ProfilePage } from './ProfilePage';

const empty: Summary = { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };

export function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'tasks' | 'bin' | 'profile'>('tasks');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<Status | ''>('');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [sort, setSort] = useState('newest');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('daymark_sidebar') === 'collapsed');
  const toggleSidebar = () => setCollapsed((current) => { const next = !current; localStorage.setItem('daymark_sidebar', next ? 'collapsed' : 'expanded'); return next; });

  const loadSummary = useCallback(async () => {
    try { setSummary((await api.summary()).summary); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Could not load the overview.'); }
  }, []);

  const load = useCallback(async () => {
    if (fromDate && toDate && fromDate > toDate) { setDateError('Start date must be before the end date.'); setLoading(false); return; }
    setDateError(''); setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (priority) params.set('priority', priority);
      if (fromDate) params.set('fromDate', fromDate);
      if (toDate) params.set('toDate', toDate);
      params.set('sort', sort);
      const [data, counts] = await Promise.all([api.tasks('?' + params), api.summary()]);
      setTasks(data.tasks); setSummary(counts.summary);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not load tasks.'); }
    finally { setLoading(false); }
  }, [search, status, priority, sort, fromDate, toDate]);

  useEffect(() => { const timer = setTimeout(load, 300); return () => clearTimeout(timer); }, [load]);
  const save = async (input: TaskInput) => {
    if (editing) { await api.update(editing.id, input); toast.success('Task updated'); }
    else { await api.create(input); toast.success('Task added'); }
    setModal(false); setEditing(null); await load();
  };
  const remove = async (task: Task) => {
    if (!confirm('Move “' + task.title + '” to the recycle bin?')) return;
    await api.remove(task.id); toast.success('Task moved to the recycle bin', { description: 'You can restore it for the next five days.' }); await load();
  };
  const clearFilters = () => { setSearch(''); setStatus(''); setPriority(''); setFromDate(''); setToDate(''); setDateError(''); };
  const hasFilters = search || status || priority || fromDate || toDate;
  const cards = [['All tasks', summary.total, ListTodo, 'ink'], ['Pending', summary.pending, Clock3, 'amber'], ['In progress', summary.inProgress, TimerReset, 'blue'], ['Completed', summary.completed, CheckCircle2, 'green'], ['Overdue', summary.overdue, XCircle, 'red']] as const;
  const first = user?.name.split(' ')[0] || 'there';
  const date = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return <div className={collapsed ? 'app-shell sidebar-collapsed' : 'app-shell'}>
    <aside className={(mobileNav ? 'sidebar open' : 'sidebar') + (collapsed ? ' collapsed' : '')}>
      <div className="brand"><span className="brand-mark">D</span><span className="brand-name">daymark</span></div>
      <button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu">×</button>
      <nav><p>WORKSPACE</p>
        <button title="My tasks" className={view === 'tasks' ? 'active' : ''} onClick={() => { setView('tasks'); setMobileNav(false); }}><ListTodo /><span>My tasks</span></button>
        <button title="Recycle bin" className={view === 'bin' ? 'active' : ''} onClick={() => { setView('bin'); setMobileNav(false); }}><Trash2 /><span>Recycle bin</span></button>
        <button title="Manage profile" className={view === 'profile' ? 'active' : ''} onClick={() => { setView('profile'); setMobileNav(false); }}><UserRound /><span>Manage profile</span></button>
      </nav>
      <button className="sidebar-collapse" onClick={toggleSidebar} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}<span>{collapsed ? 'Expand' : 'Collapse sidebar'}</span></button>
      <div className="sidebar-foot"><div className="avatar">{first[0]}</div><div><b>{user?.name}</b><small>{user?.email}</small></div><button className="icon-button" onClick={logout} title="Sign out"><LogOut /></button></div>
    </aside>
    <main className="workspace">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu /></button><span>{date}</span><div className="top-actions"><ThemeToggle /><button className="secondary signout" onClick={logout}><LogOut /> Sign out</button></div></header>
      <div className="content">{view === 'bin' ? <RecycleBin onChange={loadSummary} /> : view === 'profile' ? <ProfilePage /> : <>
        <section className="welcome"><div><p className="eyebrow">YOUR DAY AT A GLANCE</p><h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {first}.</h1><p>Here’s what’s on your plate. One thing at a time.</p></div><button className="primary" onClick={() => { setEditing(null); setModal(true); }}><Plus />Add a task</button></section>
        <section className="summary-grid">{cards.map(([label, count, Icon, tone]) => <button className={'summary-card ' + tone} key={label} onClick={() => label === 'Pending' ? setStatus('pending') : label === 'In progress' ? setStatus('in_progress') : label === 'Completed' ? setStatus('completed') : label === 'All tasks' ? setStatus('') : undefined}><span><Icon /></span><div><strong>{count}</strong><small>{label}</small></div></button>)}</section>
        <section className="task-section">
          <div className="section-title"><div><p className="eyebrow">THE LIST</p><h2>Things to do</h2></div><span>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span></div>
          <div className="toolbar"><div className="search"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by task title…" aria-label="Search tasks" />{search && <button className="clear-input" onClick={() => setSearch('')} aria-label="Clear search"><X /></button>}</div>
            <div className="filters"><label>Status<ChevronDown /><select value={status} onChange={(event) => setStatus(event.target.value as Status | '')}><option value="">All statuses</option><option value="pending">Pending</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></label><label>Priority<ChevronDown /><select value={priority} onChange={(event) => setPriority(event.target.value as Priority | '')}><option value="">All priorities</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Sort<ChevronDown /><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest created</option><option value="oldest">Oldest created</option><option value="due_date">Due date</option></select></label></div>
          </div>
          <div className="date-filter"><span><CalendarRange />Due date range</span><label>From<input type="date" value={fromDate} max={toDate || undefined} onChange={(event) => setFromDate(event.target.value)} /></label><span className="date-separator">to</span><label>Until<input type="date" value={toDate} min={fromDate || undefined} onChange={(event) => setToDate(event.target.value)} /></label>{hasFilters && <button className="filter-clear" onClick={clearFilters}>Clear all</button>}</div>
          {dateError && <p className="filter-error">{dateError}</p>}
          {loading ? <div className="task-grid" aria-label="Loading tasks">{[1, 2, 3].map((item) => <div className="task-card skeleton" key={item} />)}</div> : tasks.length ? <div className="task-grid">{tasks.map((task) => <TaskCard key={task.id} task={task} onEdit={() => { setEditing(task); setModal(true); }} onDelete={() => remove(task)} />)}</div> : <div className="empty-state"><div>✓</div><h3>Nothing here right now.</h3><p>Try clearing the filters, or add the next thing on your mind.</p>{hasFilters && <button className="secondary" onClick={clearFilters}>Clear filters</button>}</div>}
        </section>
      </>}</div>
    </main>
    {modal && <TaskModal task={editing} onClose={() => { setModal(false); setEditing(null); }} onSave={save} />}
  </div>;
}
