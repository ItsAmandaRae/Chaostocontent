import { createClient } from "npm:@supabase/supabase-js@2";
import { HttpError } from "./ai.ts";

export function privilegedClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new HttpError(503, "Access service is unavailable.");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** A reservation is mandatory before any provider call. Only trusted functions can settle it. */
export class Allowance {
  private reserved = false;
  private requestId = "";
  constructor(private userId: string) {}
  async reserve(req: Request, action: string, kind: "creation" | "media", source: string, payload: unknown) {
    const id = req.headers.get("x-request-id");
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      throw new HttpError(400, "A valid request ID is required. Refresh and try again.");
    }
    this.requestId = id;
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).map(b => b.toString(16).padStart(2, "0")).join("");
    const { data, error } = await privilegedClient().rpc("reserve_ai", {
      p_user: this.userId, p_request: id, p_action: action, p_kind: kind, p_source: source, p_hash: hash,
    });
    if (error) throw new HttpError(409, error.message);
    if (data?.cached) return data.result;
    this.reserved = true;
    return null;
  }
  async finish(result: unknown) {
    if (!this.reserved) throw new HttpError(500, "No active allowance reservation.");
    const { data, error } = await privilegedClient().rpc("finish_ai", { p_user: this.userId, p_request: this.requestId, p_success: true, p_result: result });
    if (error) throw new HttpError(409, error.message);
    this.reserved = false;
    return data;
  }
  async release() {
    if (!this.reserved) return;
    await privilegedClient().rpc("finish_ai", { p_user: this.userId, p_request: this.requestId, p_success: false });
    this.reserved = false;
  }
}