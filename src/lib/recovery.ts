/** Recovery intent is not authorization; only an SDK recovery event establishes a scoped marker. */
export interface RecoveryMarker { userId: string; sessionId: string; expiresAt: number }
export function sessionIdentity(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.session_id === 'string' ? payload.session_id : null;
  } catch { return null; }
}
export function validRecovery(marker: RecoveryMarker | null, userId: string, sessionId: string | null, now = Date.now()) {
  return Boolean(marker && sessionId && marker.userId === userId && marker.sessionId === sessionId && marker.expiresAt > now);
}
export function recoveryIntent(url: URL) {
  const hash = new URLSearchParams(url.hash.slice(1));
  if (hash.get('type') === 'signup' || url.searchParams.get('type') === 'signup' || url.searchParams.get('mode') === 'confirm') return false;
  // A bare ?code is not recovery intent: OAuth and signup PKCE callbacks also carry codes.
  return url.pathname === '/reset-password' || url.searchParams.get('mode') === 'reset' || hash.get('type') === 'recovery' || hash.has('error_description') || url.searchParams.has('error_description');
}
export function passwordErrors(password: string, confirm: string) {
  if (password.length < 6) return 'Use at least 6 characters. A longer, unique password is safer.';
  if (password !== confirm) return 'The passwords do not match.';
  return null;
}