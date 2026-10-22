import assert from 'node:assert/strict';
import { canResend, confirmationIntent, normalizeEmail, RESEND_COOLDOWN_MS } from '../src/lib/signup';
import { recoveryIntent } from '../src/lib/recovery';
assert.equal(RESEND_COOLDOWN_MS, 60000);
assert.equal(normalizeEmail('  fictional@example.invalid \n'), 'fictional@example.invalid', 'All email auth requests trim surrounding whitespace');
assert.equal(canResend(true, 0, 60001), false, 'Inflight resend is blocked');
assert.equal(canResend(false, 60000, 59999), false, 'Cooldown resend is blocked');
assert.equal(canResend(false, 60000, 60000), true);
for (const path of ['/auth#type=signup', '/auth?mode=confirm', '/auth#type=signup&error_description=Expired']) {
  const url = new URL(path, 'https://app.test');
  assert.equal(confirmationIntent(url), true);
  assert.equal(recoveryIntent(url), false, 'Confirmation never enters recovery');
}
assert.equal(confirmationIntent(new URL('https://app.test/auth#type=recovery')), false);
assert.equal(recoveryIntent(new URL('https://app.test/auth#type=recovery')), true);
console.log('PASS signup cooldown/inflight and confirmation/recovery separation');