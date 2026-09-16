import { supabase } from "@/integrations/supabase/client";
import { readDuration } from "@/lib/audio";

export type DumpKind = "audio" | "text" | "image" | "link";

export interface Dump {
  id: string;
  kind: string;
  title: string;
  summary: string | null;
  raw_text: string | null;
  tags: string[];
  status: string;
  processing_state: string;
  processing_error: string | null;
  file_path: string | null;
  file_mime: string | null;
  file_size: number | null;
  link_url: string | null;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

/** Kicks off transcription / screenshot reading / summarising for a dump. */
export async function processDump(dumpId: string) {
  const { data, error } = await supabase.functions.invoke("process-dump", {
    body: { dumpId },
  });
  if (error) {
    const message =
      (data as { error?: string } | null)?.error ??
      (error as { message?: string }).message ??
      "We couldn't read that one.";
    throw new Error(message);
  }
  return data as { title?: string; summary?: string };
}

async function insertDump(userId: string, row: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("dumps")
    .insert({ user_id: userId, ...row } as never)
    .select("id")
    .single();
  if (error || !data) throw new Error("Couldn't save that — try again.");
  return data.id as string;
}

export async function createTextDump(userId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Type something first.");
  return insertDump(userId, {
    kind: "text",
    title: trimmed.split(/\s+/).slice(0, 8).join(" ").slice(0, 120) || "Untitled idea",
    raw_text: trimmed.slice(0, 40000),
    processing_state: "pending",
  });
}

export async function createLinkDump(userId: string, url: string, note?: string) {
  const trimmed = url.trim();
  if (!/^https?:\/\/\S+$/i.test(trimmed)) throw new Error("That doesn't look like a link.");
  return insertDump(userId, {
    kind: "link",
    title: trimmed.replace(/^https?:\/\//, "").slice(0, 120),
    link_url: trimmed,
    raw_text: note?.trim() ? `Saved link: ${trimmed}\n\n${note.trim()}` : null,
    processing_state: "pending",
  });
}

export async function createAudioDump(userId: string, file: File) {
  if (file.size === 0) throw new Error("That voice note is empty.");
  if (file.size > 25 * 1024 * 1024) throw new Error("Keep voice notes under 25 MB for now.");
  const path = `${userId}/dumps/${Date.now()}-${safeName(file.name || "voice-note.webm")}`;
  const { error } = await supabase.storage
    .from("recordings")
    .upload(path, file, { contentType: file.type || "audio/webm", upsert: false });
  if (error) throw new Error("Upload failed — try again.");
  const duration = await readDuration(file).catch(() => null);
  return insertDump(userId, {
    kind: "audio",
    title: "Voice note",
    file_path: path,
    file_mime: file.type || "audio/webm",
    file_size: file.size,
    duration_seconds: duration,
    processing_state: "pending",
  });
}

export async function createImageDump(userId: string, file: File, note?: string) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Images must be 20 MB or smaller.");
  const path = `${userId}/${Date.now()}-${safeName(file.name || "screenshot.png")}`;
  const { error } = await supabase.storage
    .from("dumps")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error("Upload failed — try again.");
  return insertDump(userId, {
    kind: "image",
    title: "Screenshot",
    file_path: path,
    file_mime: file.type,
    file_size: file.size,
    raw_text: note?.trim() || null,
    processing_state: "pending",
  });
}

export async function dumpFileUrl(kind: string, path: string) {
  const bucket = kind === "audio" ? "recordings" : "dumps";
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export async function generatePosts(dumpIds: string[], platforms: string[], notes?: string) {
  const { data, error } = await supabase.functions.invoke("generate-posts", {
    body: { mode: "create", dumpIds, platforms, notes: notes?.trim() || undefined },
  });
  if (error) {
    throw new Error(
      (data as { error?: string } | null)?.error ??
        (error as { message?: string }).message ??
        "Couldn't write the drafts.",
    );
  }
  return data as { posts: { id: string; platform: string; content: string }[] };
}

export async function regeneratePost(postId: string, notes: string) {
  const { data, error } = await supabase.functions.invoke("generate-posts", {
    body: { mode: "regenerate", postId, notes },
  });
  if (error) {
    throw new Error(
      (data as { error?: string } | null)?.error ??
        (error as { message?: string }).message ??
        "Couldn't rewrite that draft.",
    );
  }
  return data as { content: string };
}

export const KIND_LABELS: Record<string, string> = {
  audio: "Voice",
  text: "Note",
  image: "Screenshot",
  link: "Link",
};
