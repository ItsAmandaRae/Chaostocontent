import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { userClient } from "../_shared/auth.ts";
import { privilegedClient } from "../_shared/access.ts";
import { HttpError } from "../_shared/ai.ts";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("lookup"), query: z.union([z.string().uuid(), z.string().email()]) }),
  z.object({ action: z.enum(["grant", "revoke"]), userId: z.string().uuid(), expiresAt: z.string().datetime().nullable().optional(), acknowledgeBilling: z.boolean().optional() }),
]);
Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const respond = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  try {
    const { userId } = await userClient(req);
    const admin = privilegedClient();
    const { data: authorized, error: roleError } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (roleError || !authorized) throw new HttpError(403, "Owner access required.");
    const body = schema.parse(await req.json());
    let recipient = "";
    if (body.action === "lookup") {
      const { data, error } = await admin.rpc("admin_find_account", { p_actor: userId, p_query: body.query });
      if (error) throw new HttpError(400, error.message);
      if (!data) throw new HttpError(404, "No existing account matches exactly.");
      recipient = data.id;
    } else {
      recipient = body.userId;
      const { error } = await admin.rpc("manage_complimentary", { p_actor: userId, p_recipient: recipient, p_action: body.action, p_expiry: body.expiresAt ?? null, p_ack: body.acknowledgeBilling ?? false });
      if (error) throw new HttpError(400, error.message);
    }
    const { data: account } = await admin.auth.admin.getUserById(recipient);
    const [{ data: access }, { data: grants }, { data: audit }] = await Promise.all([
      admin.rpc("access_for", { p_user: recipient }),
      admin.from("complimentary_grants").select("*").eq("user_id", recipient).order("created_at", { ascending: false }),
      admin.from("access_audit").select("*").eq("recipient_id", recipient).order("created_at", { ascending: false }).limit(100),
    ]);
    return respond({ user: { id: recipient, email: account?.user?.email }, access, grants, audit });
  } catch (error) {
    return respond({ error: error instanceof z.ZodError ? "Check the account and expiry fields." : error instanceof Error ? error.message : "Couldn't update access." }, error instanceof HttpError ? error.status : 400);
  }
});