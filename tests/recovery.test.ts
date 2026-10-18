import assert from 'node:assert/strict';
import { recoveryIntent, validRecovery, passwordErrors, sessionIdentity } from '../src/lib/recovery';

assert.equal(recoveryIntent(new URL('https://app.test/auth#type=recovery&access_token=fixture')), true);
assert.equal(recoveryIntent(new URL('https://app.test/reset-password')), true);
assert.equal(recoveryIntent(new URL('https://app.test/auth?code=fixture')), false);
assert.equal(recoveryIntent(new URL('https://app.test/auth?mode=forgot')), false);
assert.equal(validRecovery(null, 'owner', 'session'), false, 'Direct reset URL cannot authorize an ordinary session');
const marker = { userId: 'fixture', sessionId: 'recovery-session', expiresAt: 2000 };
assert.equal(validRecovery(marker, 'fixture', 'recovery-session', 1000), true);
assert.equal(validRecovery(marker, 'owner', 'recovery-session', 1000), false);
assert.equal(validRecovery(marker, 'fixture', 'ordinary-session', 1000), false);
assert.equal(validRecovery(marker, 'fixture', 'recovery-session', 2000), false);
assert.equal(passwordErrors('short', 'short') !== null, true);
assert.equal(passwordErrors('long-enough', 'different') !== null, true);
assert.equal(passwordErrors('long-enough', 'long-enough'), null);
assert.equal(sessionIdentity('malformed'), null);
console.log('PASS recovery intent, user/session isolation, expiry and password validation rules');