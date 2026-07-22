import { format, isValid, parseISO } from 'date-fns';
import { AtSign, CalendarDays, KeyRound, Save, UserRound } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { ApiError, api } from '../lib/api';

type Fields = { name: string; email: string; currentPassword: string; newPassword: string };
const formatDate = (value?: string) => {
  if (!value) return 'Not available';
  const date = parseISO(value.replace(' ', 'T'));
  return isValid(date) ? format(date, 'MMMM d, yyyy') : 'Not available';
};

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [fields, setFields] = useState<Fields>({ name: user?.name || '', email: user?.email || '', currentPassword: '', newPassword: '' });
  const [createdAt, setCreatedAt] = useState(user?.createdAt);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.profile().then(({ user: fresh }) => {
      setFields((current) => ({ ...current, name: fresh.name, email: fresh.email }));
      setCreatedAt(fresh.createdAt); updateUser(fresh);
    }).catch((error) => toast.error(error instanceof Error ? error.message : 'Could not load your profile.')).finally(() => setLoading(false));
  }, []);

  const change = (key: keyof Fields, value: string) => { setFields((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: undefined })); };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (fields.name.trim().length < 2) nextErrors.name = 'Enter at least 2 characters.';
    if (!/^\S+@\S+\.\S+$/.test(fields.email)) nextErrors.email = 'Enter a valid email address.';
    if (fields.newPassword && fields.newPassword.length < 6) nextErrors.newPassword = 'Use at least 6 characters.';
    if (fields.newPassword && !fields.currentPassword) nextErrors.currentPassword = 'Enter your current password first.';
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setSaving(true); setErrors({});
    try {
      const result = await api.updateProfile({ ...fields, name: fields.name.trim(), email: fields.email.trim() });
      updateUser(result.user); setFields((current) => ({ ...current, currentPassword: '', newPassword: '' }));
      toast.success('Profile updated');
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        setErrors(Object.fromEntries(Object.entries(error.errors).map(([key, messages]) => [key, messages[0]])));
      }
      toast.error(error instanceof Error ? error.message : 'Could not update your profile.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="profile-loading"><span className="spinner" />Loading your profile…</div>;

  return <section className="profile-page">
    <div className="profile-heading"><p className="eyebrow">ACCOUNT</p><h1>Manage profile</h1><p>Keep your personal details and sign-in information up to date.</p></div>
    <div className="profile-layout">
      <aside className="profile-summary"><div className="profile-avatar">{fields.name.trim().charAt(0).toUpperCase() || '?'}</div><h2>{fields.name || 'Your profile'}</h2><p>{fields.email}</p><div className="member-date"><CalendarDays /><span>Member since<b>{formatDate(createdAt)}</b></span></div></aside>
      <form className="profile-form" onSubmit={submit}>
        <div className="profile-section-title"><span><UserRound /></span><div><h2>Personal details</h2><p>This is how you appear in Daymark.</p></div></div>
        <div className="profile-fields">
          <label>Full name<div className="profile-input"><UserRound /><input value={fields.name} onChange={(event) => change('name', event.target.value)} maxLength={100} autoComplete="name" /></div>{errors.name && <small className="field-error">{errors.name}</small>}</label>
          <label>Email address<div className="profile-input"><AtSign /><input type="email" value={fields.email} onChange={(event) => change('email', event.target.value)} maxLength={190} autoComplete="email" /></div>{errors.email && <small className="field-error">{errors.email}</small>}</label>
        </div>
        <div className="profile-divider" />
        <div className="profile-section-title"><span><KeyRound /></span><div><h2>Change password</h2><p>Leave both fields empty to keep your current password.</p></div></div>
        <div className="profile-fields">
          <label>Current password<div className="profile-input"><KeyRound /><input type="password" value={fields.currentPassword} onChange={(event) => change('currentPassword', event.target.value)} autoComplete="current-password" /></div>{errors.currentPassword && <small className="field-error">{errors.currentPassword}</small>}</label>
          <label>New password<div className="profile-input"><KeyRound /><input type="password" value={fields.newPassword} onChange={(event) => change('newPassword', event.target.value)} autoComplete="new-password" /></div>{errors.newPassword && <small className="field-error">{errors.newPassword}</small>}</label>
        </div>
        <div className="profile-actions"><button className="primary" disabled={saving}><Save />{saving ? 'Saving changes…' : 'Save changes'}</button></div>
      </form>
    </div>
  </section>;
}
