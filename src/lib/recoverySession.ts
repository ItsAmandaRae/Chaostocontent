import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { recoveryIntent, sessionIdentity, validRecovery, type RecoveryMarker } from './recovery';
import { confirmationIntent } from './signup';

const KEY = 'ctc-password-recovery';
const initialUrl = new URL(window.location.href);
const requested = recoveryIntent(initialUrl);
if (confirmationIntent(initialUrl)) clearMarker();
const providerError = new URLSearchParams(initialUrl.hash.slice(1)).has('error_description') || initialUrl.searchParams.has('error_description');
type State = { status: 'none' | 'checking' | 'ready' | 'invalid' | 'complete'; userId?: string };
let state: State = { status: requested || readMarker() ? 'checking' : 'none' };
const listeners = new Set<() => void>();
function publish(next: State) { state = next; listeners.forEach(fn => fn()); }
function readMarker(): RecoveryMarker | null {
  try { return JSON.parse(sessionStorage.getItem(KEY) ?? 'null'); } catch { return null; }
}
function clearMarker() { try { sessionStorage.removeItem(KEY); } catch { /* unavailable storage */ } }
function stripCallback() {
  const url = new URL(window.location.href);
  for (const key of ['code', 'token', 'token_hash', 'access_token', 'refresh_token', 'error', 'error_code', 'error_description']) url.searchParams.delete(key);
  url.hash = '';
  window.history.replaceState(window.history.state, '', url.pathname + url.search);
}
let validation = 0;
let generation = 0;
let recoveryEventReceived = false;
async function validate(session: Session | null, fromRecovery = false) {
  const run = ++validation;
  if (!session || providerError) { clearMarker(); publish({ status: 'invalid' }); return; }
  const sessionId = sessionIdentity(session.access_token);
  if (fromRecovery && sessionId) {
    const marker: RecoveryMarker = { userId: session.user.id, sessionId, expiresAt: Math.min((session.expires_at ?? 0) * 1000, Date.now() + 3600000) };
    try { sessionStorage.setItem(KEY, JSON.stringify(marker)); } catch { /* validation below fails closed */ }
  }
  const { data, error } = await supabase.auth.getUser();
  if (run !== validation) return;
  if (error || !data.user || !validRecovery(readMarker(), data.user.id, sessionId)) {
    clearMarker(); publish({ status: 'invalid' });
  } else { publish({ status: 'ready', userId: data.user.id }); }
}

// Register once at module startup, before components can redirect on INITIAL_SESSION.
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    recoveryEventReceived = true;
    const currentGeneration = generation;
    publish({ status: 'checking' });
    setTimeout(() => { if (generation !== currentGeneration) return; stripCallback(); void validate(session, true); }, 0);
  } else if (event === 'SIGNED_OUT') {
    clearMarker(); ++validation;
    if (state.status !== 'complete') publish({ status: 'none' });
  } else if (event === 'SIGNED_IN') {
    // Ordinary sign-in never inherits reset permission or an expired-link screen.
    clearMarker(); ++validation;
    publish({ status: 'none' });
  } else if (event === 'TOKEN_REFRESHED' && state.status === 'ready') {
    setTimeout(() => { void validate(session); }, 0);
  }
});
// The SDK alone consumes implicit tokens or PKCE codes. Never exchange a second time.
const initialGeneration = generation;
void supabase.auth.initialize().then(async ({ error }) => {
  if (generation !== initialGeneration || (!requested && !readMarker())) return;
  stripCallback();
  if (error || providerError) { clearMarker(); publish({ status: 'invalid' }); return; }
  const { data } = await supabase.auth.getSession();
  // PASSWORD_RECOVERY is emitted on the SDK's next timer tick.
  setTimeout(() => { if (generation === initialGeneration && !recoveryEventReceived && state.status !== 'ready') void validate(data.session); }, 10);
});

export const recoverySession = {
  subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
  getSnapshot() { return state; },
  async authorized() {
    const { data } = await supabase.auth.getSession();
    if (state.status !== 'ready' || !data.session) return false;
    const { data: user, error } = await supabase.auth.getUser();
    return !error && Boolean(user.user && validRecovery(readMarker(), user.user.id, sessionIdentity(data.session.access_token)));
  },
  complete() { clearMarker(); ++generation; ++validation; publish({ status: 'complete' }); },
  abandon() { clearMarker(); ++generation; ++validation; publish({ status: 'none' }); },
};