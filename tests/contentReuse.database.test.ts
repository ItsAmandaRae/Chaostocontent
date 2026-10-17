import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { BUCKET_COLORS } from "../src/lib/planner";
const url = process.env.VITE_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY, publicKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
assert.ok(url && key && publicKey, "Isolated tests require server credentials");
const admin = createClient(url, key, { auth: { persistSession: false } });
const ids: string[] = [];
async function fixture() {
  const email = `reuse-fixture-${crypto.randomUUID()}@example.invalid`, password = `${crypto.randomUUID()}Aa1!`;
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ifError(created.error); assert.ok(created.data.user); const id = created.data.user.id; ids.push(id);
  const client = createClient(url as string, publicKey as string, { auth: { persistSession: false } });
  assert.ifError((await client.auth.signInWithPassword({ email, password })).error);
  return { id, client };
}
try {
  const owner = await fixture(), other = await fixture();
  assert.ifError((await admin.from("complimentary_grants").insert({ user_id: owner.id, created_by: owner.id })).error);
  const bucketIds: string[] = [];
  for (const color of BUCKET_COLORS) {
    const b = await owner.client.from("buckets").insert({ user_id: owner.id, name: `Fictional ${color}` }).select().single();
    assert.ifError(b.error); assert.equal(b.data?.color, color); bucketIds.push(b.data.id);
    assert.ifError((await owner.client.from("buckets").update({ color }).eq("id", b.data.id)).error);
    assert.equal((await owner.client.from("buckets").select("color").eq("id", b.data.id).single()).data?.color, color);
  }
  assert.ok((await owner.client.from("buckets").update({ color: "custom" }).eq("id", bucketIds[0])).error);
  const dump = await owner.client.from("dumps").insert({ user_id: owner.id, kind: "text", raw_text: "My original source" }).select().single(); assert.ifError(dump.error);
  const idea = await owner.client.from("ideas").insert({ user_id: owner.id, dump_id: dump.data.id, title: "Fictional idea" }).select().single(); assert.ifError(idea.error);
  const source = await owner.client.from("posts").insert({ user_id: owner.id, dump_id: dump.data.id, idea_id: idea.data.id, bucket_id: bucketIds[0], title: "Fictional title", content: "old", platform: "twitter", variant: "reel_script", voice_mode: "reference", reference_note: "My intended stance", source_snapshot: "Original raw wording", prompt_notes: "My notes", status: "published", scheduled_at: "2026-10-17T18:00:00Z", published_at: "2026-10-16T18:00:00Z", external_url: "https://example.invalid/post" }).select().single(); assert.ifError(source.error);
  const post = source.data; assert.ok(post);
  const before = (await owner.client.rpc("my_access")).data;
  assert.ok((await owner.client.rpc("reuse_content", { p_post: post.id, p_platform: "instagram", p_expected_text: "unsaved" })).error);
  assert.ifError((await owner.client.from("posts").update({ content: "latest unsaved wording" }).eq("id", post.id)).error);
  const changed = await owner.client.rpc("reuse_content", { p_post: post.id, p_platform: "instagram", p_expected_text: "latest unsaved wording" }); assert.ifError(changed.error);
  for (const field of ["bucket_id", "dump_id", "idea_id", "scheduled_at", "published_at", "status", "variant", "source_snapshot", "voice_mode", "reference_note"]) assert.equal(changed.data[field], post[field]);
  const copyId = crypto.randomUUID();
  const request = { p_post: post.id, p_platform: "tiktok", p_expected_text: "latest unsaved wording", p_copy_id: copyId };
  const copies = await Promise.all([owner.client.rpc("reuse_content", request), owner.client.rpc("reuse_content", request)]);
  for (const copy of copies) { assert.ifError(copy.error); assert.equal(copy.data.id, copyId); assert.equal(copy.data.content, "latest unsaved wording"); assert.equal(copy.data.status, "draft"); assert.equal(copy.data.scheduled_at, null); assert.equal(copy.data.published_at, null); assert.equal(copy.data.external_url, null); for (const field of ["title", "variant", "bucket_id", "dump_id", "idea_id", "source_snapshot", "voice_mode", "reference_note", "prompt_notes"]) assert.equal(copy.data[field], post[field]); }
  const original = await owner.client.from("posts").select().eq("id", post.id).single(); assert.equal(original.data?.platform, "instagram"); assert.equal(original.data?.status, "published");
  assert.ok((await other.client.rpc("reuse_content", request)).error);
  assert.ok((await other.client.rpc("reuse_content", { ...request, p_copy_id: undefined })).error);
  assert.ok((await owner.client.rpc("reuse_content", { ...request, p_platform: "unapproved" })).error);
  assert.deepEqual((await owner.client.rpc("my_access")).data, before);
  assert.equal((await admin.from("ai_usage").select("id").eq("user_id", owner.id)).data?.length, 0);
  assert.equal((await owner.client.from("posts").select("id").eq("id", copyId)).data?.length, 1);
  // Existing bucket removal semantics retain source and copy.
  assert.ifError((await owner.client.from("posts").update({ bucket_id: null }).eq("bucket_id", bucketIds[0])).error);
  assert.ifError((await owner.client.from("buckets").delete().eq("id", bucketIds[0])).error);
  assert.equal((await owner.client.from("posts").select("id,bucket_id").in("id", [post.id, copyId])).data?.length, 2);
  console.log("PASS isolated persisted 12-color roundtrips/defaults, legacy keys, unsupported color, platform metadata-only, provenance copies, current wording/stale rejection, original/date/status preservation, idempotent concurrency, cross-owner denial, zero usage delta, bucket retention");
} finally {
  for (const id of ids.reverse()) {
    for (const table of ["posts", "ideas", "buckets", "dumps", "complimentary_grants", "ai_usage"]) assert.ifError((await admin.from(table).delete().eq("user_id", id)).error);
    assert.ifError((await admin.auth.admin.deleteUser(id)).error);
  }
  console.log("Only isolated fixtures created/removed; no email or provider calls");
}