import assert from "node:assert/strict";

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
assert.ok(url && key, "Hosted Auth settings checks require app configuration");
const response = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } });
assert.equal(response.status, 200, "Hosted Auth settings are readable");
const settings = await response.json();
assert.equal(settings.disable_signup, false, "Ordinary signup must stay enabled");
assert.equal(settings.mailer_autoconfirm, false, "Email verification must remain required");
assert.equal(settings.external.email, true, "Email sign-in must remain enabled");
assert.equal(settings.external.anonymous_users, false, "Anonymous signup must remain disabled");
console.log("PASS four hosted Auth setting rules; HIBP is not exposed by this public read");