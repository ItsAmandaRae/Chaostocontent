import { createDraftQueue } from "./draftQueue";
import { supabase } from "@/integrations/supabase/client";

export const persistedDrafts = createDraftQueue(async (id, text) => {
  const { data, error } = await supabase.from("posts").update({ content: text, char_count: text.length }).eq("id", id).select("id");
  if (error || !data?.length) throw new Error("Couldn't save this content.");
}, window.localStorage);