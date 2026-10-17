import { useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { recoverySession } from '@/lib/recoverySession';
import { passwordErrors } from '@/lib/recovery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RecoveryForm() {
  const state = useSyncExternalStore(recoverySession.subscribe, recoverySession.getSnapshot);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = passwordErrors(password, confirm);
    if (invalid) { setError(invalid); return; }
    setSaving(true); setError('');
    try {
      if (!await recoverySession.authorized()) { setError('This reset session has expired. Request a fresh link.'); return; }
      // Recovery sessions are exempt from current-password requirements.
      const { error: failure } = await supabase.auth.updateUser({ password });
      if (failure) { setError(failure.message); return; }
      recoverySession.complete(); setPassword(''); setConfirm('');
      const { error: signoutError } = await supabase.auth.signOut({ scope: 'local' });
      if (signoutError) setError('Password saved. Your session could not be closed; please sign out before signing in again.');
    } catch { setError('Could not save your password. Please try again.'); }
    finally { setSaving(false); }
  }
  if (state.status === 'checking') return <p role="status" className="text-center">Checking your reset link…</p>;
  if (state.status === 'complete') return <div className="space-y-4 text-center"><p role="status">Your new password is saved. Sign in with it to continue.</p>{error && <p role="alert">{error}</p>}<Button asChild><Link to="/auth?mode=login" onClick={() => recoverySession.abandon()}>Back to sign in</Link></Button></div>;
  if (state.status !== 'ready') return <div className="space-y-4 text-center"><p role="alert">This reset link is missing, expired or already used. Request a fresh link to set your password.</p><Button asChild><Link to="/auth?mode=forgot" onClick={() => recoverySession.abandon()}>Request a fresh link</Link></Button></div>;
  return <form onSubmit={submit} className="space-y-5" noValidate>
    <div className="space-y-2"><Label htmlFor="new-password">New password</Label><div className="flex gap-2"><Input id="new-password" autoComplete="new-password" type={visible ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'reset-error' : 'reset-help'} required /><Button type="button" variant="outline" size="icon" aria-label={visible ? 'Hide passwords' : 'Show passwords'} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff /> : <Eye />}</Button></div></div>
    <div className="space-y-2"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" autoComplete="new-password" type={visible ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'reset-error' : undefined} required /></div>
    <p id="reset-help" className="text-sm text-muted-foreground">Use a unique password. Your old password is not needed.</p>
    {error && <p id="reset-error" role="alert" className="text-destructive text-sm">{error}</p>}
    <Button type="submit" disabled={saving} className="w-full">{saving ? 'Saving password…' : 'Save new password'}</Button>
    {error && <Button variant="outline" asChild><Link to="/auth?mode=forgot" onClick={() => recoverySession.abandon()}>Request a fresh link</Link></Button>}
  </form>;
}