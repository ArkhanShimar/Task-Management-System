import { format, parseISO } from 'date-fns';
import { Bell, BellRing, CalendarClock, CheckCircle2, Clock3 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { Reminder, ReminderSummary } from '../types';

const emptySummary: ReminderSummary = { total: 0, active: 0, upcoming: 0 };
const reminderLabel = (days: number) => days === 0 ? 'On the due date' : days === 1 ? '1 day early' : days === 7 ? '1 week early' : days + ' days early';

export function RemindersPage({ onCountChange }: { onCountChange: (count: number) => void }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => 'Notification' in window ? Notification.permission : 'unsupported');
  const load = useCallback(async () => {
    setLoading(true);
    try { const data = await api.reminders(); setReminders(data.reminders); setSummary(data.summary); onCountChange(data.summary.active); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Could not load reminders.'); }
    finally { setLoading(false); }
  }, [onCountChange]);
  useEffect(() => { load(); }, [load]);

  const enableBrowserAlerts = async () => {
    if (!('Notification' in window)) { toast.error('Browser notifications are not supported here.'); return; }
    const result = await Notification.requestPermission(); setPermission(result);
    if (result === 'granted') { new Notification('Daymark reminders are on', { body: 'We will alert you while Daymark is open.' }); toast.success('Browser reminders enabled'); }
    else toast.error('Notification permission was not granted.');
  };
  const active = reminders.filter((reminder) => reminder.reminderState === 'active');
  const upcoming = reminders.filter((reminder) => reminder.reminderState === 'upcoming');

  return <section className="reminders-page">
    <div className="reminders-heading"><div><p className="eyebrow">REMINDERS</p><h1>Stay ahead of the date.</h1><p>Every task reminds you one day early by default. Choose an earlier alert whenever you need more time.</p></div>{permission !== 'granted' && permission !== 'unsupported' && <button className="secondary" onClick={enableBrowserAlerts}><Bell />Enable browser alerts</button>}</div>
    <div className="reminder-summary"><article><span className="active"><BellRing /></span><div><b>{summary.active}</b><small>Need attention</small></div></article><article><span><CalendarClock /></span><div><b>{summary.upcoming}</b><small>Coming up</small></div></article><article><span className="green"><CheckCircle2 /></span><div><b>{summary.total}</b><small>Reminders set</small></div></article></div>
    {permission === 'granted' && <div className="notification-note"><CheckCircle2 />Browser alerts are enabled while Daymark is open.</div>}
    {loading ? <div className="loading-panel"><span className="spinner" />Checking your reminders…</div> : reminders.length === 0 ? <div className="empty-state reminders-empty"><div><Bell /></div><h3>No reminders waiting.</h3><p>Add a task and its one-day reminder will appear here automatically.</p></div> : <>
      {active.length > 0 && <div className="reminder-group"><div className="reminder-group-title"><span>Needs attention</span><b>{active.length}</b></div><div className="reminder-list">{active.map((reminder) => <ReminderItem key={reminder.id} reminder={reminder} active />)}</div></div>}
      {upcoming.length > 0 && <div className="reminder-group"><div className="reminder-group-title"><span>Upcoming</span><b>{upcoming.length}</b></div><div className="reminder-list">{upcoming.map((reminder) => <ReminderItem key={reminder.id} reminder={reminder} />)}</div></div>}
    </>}
  </section>;
}
function ReminderItem({ reminder, active = false }: { reminder: Reminder; active?: boolean }) {
  const due = format(parseISO(reminder.dueDate), 'MMM d, yyyy');
  return <article className={'reminder-item ' + (active ? 'is-active' : '')}><span className="reminder-bell">{active ? <BellRing /> : <Clock3 />}</span><div className="reminder-copy"><h3>{reminder.title}</h3><p>{active ? 'Reminder is active now' : reminder.daysUntilReminder === 1 ? 'Reminder starts tomorrow' : 'Reminder starts in ' + reminder.daysUntilReminder + ' days'}</p></div><span className={'priority ' + reminder.priority}>{reminder.priority}</span><div className="reminder-date"><small>Due</small><b>{due}</b><em>{reminderLabel(reminder.reminderDaysBefore)}</em></div></article>;
}
