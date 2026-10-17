import { supabase } from "@/integrations/supabase/client";
import { BucketColor } from "@/lib/planner";

export interface Bucket {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  color?: string;
}

export async function loadBuckets(): Promise<Bucket[]> {
  const { data, error } = await supabase.from("buckets").select("*").order("created_at", { ascending: true });
  if (error) throw new Error("Couldn't load your buckets.");
  return (data ?? []) as Bucket[];
}

export async function createBucket(userId: string, name: string, color?: BucketColor): Promise<Bucket> {
  const trimmed = name.trim().slice(0, 60);
  if (!trimmed) throw new Error("Give the bucket a name.");
  const { data, error } = await supabase
    .from("buckets")
    .insert({ user_id: userId, name: trimmed, ...(color ? { color } : {}) })
    .select("*")
    .single();
  if (error || !data) throw new Error("Couldn't create that bucket.");
  return data as Bucket;
}

export async function renameBucket(id: string, name: string, color?: BucketColor) {
  const trimmed = name.trim().slice(0, 60);
  if (!trimmed) throw new Error("Give the bucket a name.");
  const { error } = await supabase.from("buckets").update({ name: trimmed, ...(color ? { color } : {}) }).eq("id", id);
  if (error) throw new Error("Couldn't rename that bucket.");
}

/** Deleting a bucket moves its items back to Unsorted — nothing is ever deleted with it. */
export async function deleteBucket(id: string) {
  const { error: ideasError } = await supabase.from("ideas").update({ bucket_id: null }).eq("bucket_id", id);
  if (ideasError) throw new Error("Couldn't free that bucket's ideas.");
  const { error: postsError } = await supabase.from("posts").update({ bucket_id: null }).eq("bucket_id", id);
  if (postsError) throw new Error("Couldn't free that bucket's content.");
  const { error } = await supabase.from("buckets").delete().eq("id", id);
  if (error) throw new Error("Couldn't delete that bucket.");
}
