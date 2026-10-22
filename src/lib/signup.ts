export const RESEND_COOLDOWN_MS = 60000;
export function normalizeEmail(email: string) { return email.trim(); }
const PENDING_KEY = 'ctc-signup-verification';
export function pendingSignup(): string | null {
  try { return sessionStorage.getItem(PENDING_KEY); } catch { return null; }
}
export function setPendingSignup(email: string | null) {
  try { if (email) sessionStorage.setItem(PENDING_KEY, email); else sessionStorage.removeItem(PENDING_KEY); } catch { /* guidance remains in memory */ }
}
export function canResend(inflight: boolean, until: number, now = Date.now()) {
  return !inflight && now >= until;
}
export function confirmationIntent(url: URL) {
  return new URLSearchParams(url.hash.slice(1)).get('type') === 'signup' || url.searchParams.get('type') === 'signup' || url.searchParams.get('mode') === 'confirm';
}