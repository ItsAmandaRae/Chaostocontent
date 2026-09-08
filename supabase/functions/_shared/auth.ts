import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";
import { HttpError } from "./ai.ts";

/** Returns a client scoped to the caller (RLS applies) plus the caller's id. */
export async function userClient(req: Request): Promise<{ supabase: SupabaseClient; userId: string }> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    throw new HttpError(401, "You need to be signed in.");
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } },
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) throw new HttpError(401, "Your session expired — sign in again.");

  return { supabase, userId: data.user.id };
}
