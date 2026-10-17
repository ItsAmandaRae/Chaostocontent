import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
assert.ok(url && key && publicKey, "Isolated access tests need server credentials");
const admin = createClient(url, key, { auth: { persistSession: false } });
const ids: string[] = [];
const clients: ReturnType<typeof createClient>[] = [];
let checks = 0;
function check(name: string, value: unknown) { assert.ok(value, name); checks++; console.log(`PASS ${name}`); }
async function fixture(label: string) {
  const email = `access-fixture-${label}-${crypto.randomUUID()}@example.invalid`;
  const password = crypto.randomUUID() + "aA1!";
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ifError(error); assert.ok(data.user);
  ids.push(data.user.id);
  const client = createClient(url, publicKey, { auth: { persistSession: false } });
  const { error: login } = await client.auth.signInWithPassword({ email, password });
  assert.ifError(login); clients.push(client);
  return { id: data.user.id, client, email };
}
async function access(id: string, at?: string) {
  const { data, error } = await admin.rpc("access_for", { p_user: id, ...(at ? { p_at: at } : {}) });
  assert.ifError(error); return data;
}
async function reserve(id: string, request = crypto.randomUUID(), kind = "creation", source = "fixture") {
  return admin.rpc("reserve_ai", { p_user: id, p_request: request, p_action: "extract", p_kind: kind, p_source: source, p_hash: "fixture" });
}
try {
  const owner = await fixture("admin"); const free = await fixture("free");
  const anon = createClient(url, publicKey, { auth: { persistSession: false } });
  const unauth = await anon.functions.invoke("admin-access", { body: { action: "lookup", query: free.email } });
  check("Unauthenticated admin endpoint denied", !!unauth.error);
  const denied = await free.client.functions.invoke("admin-access", { body: { action: "lookup", query: owner.email } });
  check("Non-admin exact account lookup denied", !!denied.error);
  const deniedGrant = await free.client.functions.invoke("admin-access", { body: { action: "grant", userId: free.id } });
  check("Non-admin grant endpoint denied", !!deniedGrant.error);
  for (const table of ["billing_entitlements", "complimentary_grants", "user_roles", "ai_usage"]) {
    const row = table === "billing_entitlements" ? { user_id: free.id, provider: "forged", status: "active" } : table === "user_roles" ? { user_id: free.id, role: "admin" } : table === "ai_usage" ? { user_id: free.id, request_id: crypto.randomUUID(), action: "extract", kind: "creation", source_key: "forged", payload_hash: "forged", period: "2026-10-01" } : { user_id: free.id, created_by: free.id };
    check(`Forged ${table} write denied`, !!(await free.client.from(table).insert(row)).error);
  }
  check("Client cannot reserve usage directly", !!(await free.client.rpc("reserve_ai", { p_user: free.id, p_request: crypto.randomUUID(), p_action: "extract", p_kind: "creation", p_source: "fixture", p_hash: "fixture" })).error);
  check("Free creation limit is exactly 5", (await access(free.id)).creations === 5);
  check("Free media limit is exactly 5", (await access(free.id)).media_reads === 5);
  check("Public plan config immutable with no client setter", !!(await free.client.rpc("plan_config", { p_paid: true })).data && !(await free.client.from("user_roles").select()).data?.length);
  const media = await Promise.all(Array.from({ length: 8 }, (_, i) => reserve(free.id, crypto.randomUUID(), "media", `source-${i}`)));
  check("Concurrent media-read allowance exactly 5", media.filter(r => !r.error).length === 5);
  const mediaRows = await admin.from("ai_usage").select("request_id").eq("user_id", free.id).eq("kind", "media");
  for (const r of mediaRows.data ?? []) await admin.rpc("finish_ai", { p_user: free.id, p_request: r.request_id, p_success: false });
  check("Failed media reads refund all 5", (await access(free.id)).media_remaining === 5);
  check("Media preparation fields cannot be forged", !!(await free.client.from("dumps").insert({ user_id: free.id, kind: "image", media_prepared_at: new Date().toISOString(), extracted_text: "forged" })).error);
  const req = crypto.randomUUID(); assert.ifError((await reserve(free.id, req)).error);
  check("Duplicate active request rejected", !!(await reserve(free.id, req)).error);
  assert.ifError((await admin.rpc("finish_ai", { p_user: free.id, p_request: req, p_success: false })).error);
  check("Failed operation refunded", (await access(free.id)).creations_remaining === 5);
  const success = crypto.randomUUID(); assert.ifError((await reserve(free.id, success)).error);
  assert.ifError((await admin.rpc("finish_ai", { p_user: free.id, p_request: success, p_success: true, p_result: { ideas: [{ title: "Fixture" }] } })).error);
  const replay = await reserve(free.id, success);
  check("Successful duplicate ID returns cached result", replay.data?.cached && replay.data?.result?.ideas?.[0]?.title === "Fixture");
  check("Duplicate ID spends only once", (await access(free.id)).creations_remaining === 4);
  for (let i = 0; i < 3; i++) {
    const r = crypto.randomUUID(); assert.ifError((await reserve(free.id, r)).error);
    assert.ifError((await admin.rpc("finish_ai", { p_user: free.id, p_request: r, p_success: true, p_result: { ok: true } })).error);
  }
  const last = await Promise.all(Array.from({ length: 6 }, () => reserve(free.id)));
  check("Concurrent last-credit requests: exactly one wins", last.filter(r => !r.error).length === 1);
  const rows = await admin.from("ai_usage").select("request_id").eq("user_id", free.id).eq("state", "reserved");
  for (const r of rows.data ?? []) await admin.rpc("finish_ai", { p_user: free.id, p_request: r.request_id, p_success: false });
  const stale = crypto.randomUUID(); assert.ifError((await reserve(free.id, stale)).error);
  await admin.from("ai_usage").update({ reserved_until: "2000-01-01T00:00:00Z" }).eq("user_id", free.id).eq("request_id", stale);
  check("Stale reservation no longer occupies allowance", (await access(free.id)).creations_remaining === 1);
  check("Stale reservation cannot finalize", !!(await admin.rpc("finish_ai", { p_user: free.id, p_request: stale, p_success: true, p_result: { ok: true } })).error);
  const period = await admin.rpc("month_period", { p_at: "2026-02-01T00:30:00+01:00" });
  check("Calendar month uses UTC at timezone boundary", period.data === "2026-01-01");
  const a = await access(free.id, "2032-02-29T23:59:59Z");
  check("Leap-month resets March 1 UTC", a.reset_at.startsWith("2032-03-01") && a.creations_remaining === 5);
  const bucketResults = await Promise.all(Array.from({ length: 6 }, (_, i) => free.client.from("buckets").insert({ user_id: free.id, name: `Fixture ${i}` })));
  check("Atomic Free bucket cap exactly 3", bucketResults.filter(r => !r.error).length === 3);
  const { data: post, error: postError } = await free.client.from("posts").insert({ user_id: free.id, content: "My isolated original content", title: "Fixture" }).select().single();
  assert.ifError(postError); assert.ok(post);
  check("Free planner date write blocked", !!(await free.client.from("posts").update({ scheduled_at: new Date().toISOString() }).eq("id", post.id)).error);
  check("Planner date on insert blocked", !!(await free.client.from("posts").insert({ user_id: free.id, scheduled_at: new Date().toISOString() })).error);
  await admin.from("user_roles").insert({ user_id: owner.id, role: "admin" });
  const lookup = await owner.client.functions.invoke("admin-access", { body: { action: "lookup", query: free.email } });
  check("Fixture admin can find exact existing account", lookup.data?.user?.id === free.id);
  const grant = await owner.client.functions.invoke("admin-access", { body: { action: "grant", userId: free.id, expiresAt: new Date(Date.now() + 30 * 86400000).toISOString() } });
  check("Owner endpoint grants Complimentary", grant.data?.access?.plan === "Complimentary");
  check("Complimentary limits are finite provisional 100", (await access(free.id)).creations === 100 && (await access(free.id)).media_reads === 100);
  check("Paid plans without legacy project or channel", !(await free.client.from("posts").update({ scheduled_at: new Date().toISOString() }).eq("id", post.id)).error);
  const grantRows = await admin.from("complimentary_grants").select("expires_at").eq("user_id", free.id).is("revoked_at", null);
  const futureExpiry = grantRows.data?.[0]?.expires_at;
  assert.ok(futureExpiry);
  check("Gift expiry boundary resolves to Free", (await access(free.id, futureExpiry)).plan === "Free");
  const createId = crypto.randomUUID();
  assert.ifError((await admin.rpc("reserve_ai", { p_user: free.id, p_request: createId, p_action: "create", p_kind: "creation", p_source: "manual-fixture", p_hash: "fixture-create" })).error);
  const finalized = await Promise.all([1, 2].map(() => admin.rpc("finish_ai", { p_user: free.id, p_request: createId, p_success: true, p_result: { platform: "blog", variant: "blog", content: "Atomic fixture content", title: "Atomic fixture" } })));
  check("Duplicate finalization creates exactly one content item", finalized[0].data?.posts?.[0]?.id === finalized[1].data?.posts?.[0]?.id && (await free.client.from("posts").select("id").eq("title", "Atomic fixture")).data?.length === 1);
  assert.ifError((await free.client.from("buckets").insert({ user_id: free.id, name: "Fourth preserved bucket" })).error);
  const revoke = await owner.client.functions.invoke("admin-access", { body: { action: "revoke", userId: free.id } });
  check("Revoked gift returns Free", revoke.data?.access?.plan === "Free");
  check("Content readable after downgrade", (await free.client.from("posts").select("content").eq("id", post.id).single()).data?.content === "My isolated original content");
  check("Existing content editable after downgrade", !(await free.client.from("posts").update({ content: "Still editable" }).eq("id", post.id)).error);
  check("Downgrade retains all four buckets", (await free.client.from("buckets").select("id")).data?.length === 4);
  check("Moving planner date blocked after downgrade", !!(await free.client.from("posts").update({ scheduled_at: new Date(Date.now() + 86400000).toISOString() }).eq("id", post.id)).error);
  check("Removing planner date allowed after downgrade", !(await free.client.from("posts").update({ scheduled_at: null }).eq("id", post.id)).error);
  await admin.from("complimentary_grants").insert({ user_id: free.id, created_by: owner.id, expires_at: "2000-01-01T00:00:00Z" });
  check("Expired gift stays Free", (await access(free.id)).plan === "Free");
  await admin.from("billing_entitlements").insert({ user_id: free.id, provider: "isolated-test-fixture", status: "active", valid_until: new Date(Date.now() + 86400000).toISOString() });
  const noAck = await owner.client.functions.invoke("admin-access", { body: { action: "grant", userId: free.id } });
  check("Active billing gift requires acknowledgement", !!noAck.error);
  const ack = await owner.client.functions.invoke("admin-access", { body: { action: "grant", userId: free.id, acknowledgeBilling: true } });
  check("Acknowledged gift retains Paid billing", ack.data?.access?.plan === "Paid");
  await owner.client.functions.invoke("admin-access", { body: { action: "revoke", userId: free.id } });
  check("Revoked gift never cancels separate active billing", (await access(free.id)).plan === "Paid");
  const audits = await admin.from("access_audit").select("actor_id").eq("recipient_id", free.id);
  check("Grant/revoke audit attributes fixture admin", (audits.data?.length ?? 0) >= 4 && audits.data?.every(r => r.actor_id === owner.id));
  const directory = await free.client.from("complimentary_grants").select();
  check("Non-admin cannot read grant directory", !!directory.error || directory.data?.length === 0);
  console.log(`${checks} access regression checks passed`);
} finally {
  for (const id of ids.reverse()) {
    for (const table of ["access_audit", "complimentary_grants", "billing_entitlements", "ai_usage", "posts", "ideas", "buckets", "dumps"]) {
      const field = table === "access_audit" ? "recipient_id" : "user_id";
      const { error } = await admin.from(table).delete().eq(field, id);
      if (error) console.error(`Fixture cleanup failed for ${table}`);
    }
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) console.error("Fixture account cleanup failed");
  }
  console.log("Isolated fixtures cleaned up; existing accounts untouched");
}