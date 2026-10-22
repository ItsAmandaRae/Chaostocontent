import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { canResend, normalizeEmail, RESEND_COOLDOWN_MS } from '@/lib/signup';

export default function SignupVerification({ email, onEdit, onSignIn }: { email: string; onEdit: () => void; onSignIn: () => void }) {
  const [until, setUntil] = useState(Date.now() + RESEND_COOLDOWN_MS);
  const [now, setNow] = useState(Date.now());
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const inflight = useRef(false);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  async function resend() {
    if (!canResend(inflight.current, until)) return;
    inflight.current = true; setSending(true); setError(''); setMessage('');
    setUntil(Date.now() + RESEND_COOLDOWN_MS);
    try {
      const { error: failure } = await supabase.auth.resend({ type: 'signup', email: normalizeEmail(email), options: { emailRedirectTo: window.location.origin } });
      if (failure) { setError(failure.status === 429 ? 'Too many requests. Wait before requesting another confirmation email.' : 'Could not request confirmation. Please wait and try again, or sign in if you have already verified.'); }
      else setMessage('If this address needs verification, a new confirmation email has been requested. Delivery may take a few minutes.');
    } catch { setError('Could not request another email. Please try again after the countdown.'); }
    finally { inflight.current = false; setSending(false); }
  }
  const seconds = Math.max(0, Math.ceil((until - now) / 1000));
  return <div className="space-y-4 text-center">
    <div role="status"><p className="font-semibold">Check your email to verify your account</p><p className="mt-2 break-all">{email}</p></div>
    <p className="text-sm">Click the confirmation link, then sign in. Check your spam folder too.</p>
    <p className="text-sm text-muted-foreground">If this address is eligible, a confirmation email has been requested. This does not confirm delivery or whether an account already exists.</p>
    {message && <p role="status" className="text-sm">{message}</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="flex flex-col gap-3"><Button onClick={onSignIn}>Back to sign in</Button><Button variant="outline" onClick={onEdit} disabled={sending}>Edit email</Button><Button variant="outline" onClick={resend} disabled={sending || seconds > 0}>{sending ? 'Requesting…' : seconds > 0 ? `Resend confirmation (${seconds}s)` : 'Resend confirmation'}</Button></div>
  </div>;
}