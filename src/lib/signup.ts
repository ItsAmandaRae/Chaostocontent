export const RESEND_COOLDOWN_MS = 60000;
export function canResend(inflight: boolean, until: number, now = Date.now()) {
  return !inflight && now >= until;
}
export function confirmationIntent(url: URL) {
  return new URLSearchParams(url.hash.slice(1)).get('type') === 'signup' || url.searchParams.get('type') === 'signup' || url.searchParams.get('mode') === 'confirm';
}