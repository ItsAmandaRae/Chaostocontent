import { supabase } from '@/integrations/supabase/client';
import { confirmationIntent, setPendingSignup } from './signup';

const url = new URL(window.location.href);
const intended = confirmationIntent(url);
type State = 'none' | 'checking' | 'confirmed' | 'invalid';
let state: State = intended ? 'checking' : 'none';
const listeners = new Set<() => void>();
function publish(next: State) { state = next; listeners.forEach(fn => fn()); }
let generation = 0;
// SDK consumes/validates the callback first; URL intent never establishes authentication.
const initialGeneration = generation;
void supabase.auth.initialize().then(async ({ error }) => {
  if (!intended || generation !== initialGeneration) return;
  const clean = new URL(window.location.href);
  for (const key of ['code', 'token', 'token_hash', 'error', 'error_code', 'error_description']) clean.searchParams.delete(key);
  clean.hash = '';
  window.history.replaceState(window.history.state, '', clean.pathname + clean.search);
  if (error || new URLSearchParams(url.hash.slice(1)).has('error_description') || url.searchParams.has('error_description')) { publish('invalid'); return; }
  const { data, error: failure } = await supabase.auth.getUser();
  if (generation !== initialGeneration) return;
  if (!failure && data.user?.email_confirmed_at) { setPendingSignup(null); publish('confirmed'); }
  else publish('invalid');
});
export const confirmationSession = {
  subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
  getSnapshot() { return state; },
  clear() { ++generation; publish('none'); },
};