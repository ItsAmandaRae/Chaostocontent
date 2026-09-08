import { supabase } from "@/integrations/supabase/client";

export const MAX_AUDIO_BYTES = 50 * 1024 * 1024;

const ALLOWED_AUDIO_EXT = /\.(mp3|m4a|wav|ogg|webm|aac|flac)$/i;

export function isAudioFile(file: File) {
  const typeOk = file.type ? file.type.startsWith("audio/") : true;
  return typeOk && ALLOWED_AUDIO_EXT.test(file.name);
}

export function formatBytes(bytes?: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds?: number | null) {
  if (!seconds || !isFinite(seconds)) return "";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function readDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const d = audio.duration;
      URL.revokeObjectURL(url);
      resolve(isFinite(d) ? d : null);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    audio.src = url;
  });
}

export async function uploadRecordingAudio(userId: string, projectId: string, file: File) {
  if (!isAudioFile(file)) throw new Error("Please choose an audio file (mp3, m4a, wav, ogg…).");
  if (file.size > MAX_AUDIO_BYTES) throw new Error("Audio files must be 50 MB or smaller.");
  if (file.size === 0) throw new Error("That file is empty.");
  if (!/^[0-9a-f-]{36}$/i.test(userId) || !/^[0-9a-f-]{36}$/i.test(projectId)) {
    throw new Error("Invalid upload target.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${userId}/${projectId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("recordings")
    .upload(path, file, { contentType: file.type || "audio/mpeg", upsert: false });
  if (uploadError) throw uploadError;

  const duration = await readDuration(file);

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      audio_path: path,
      audio_mime: file.type || null,
      audio_size: file.size,
      duration_seconds: duration,
    })
    .eq("id", projectId)
    .eq("user_id", userId);
  if (updateError) throw updateError;

  return { path, duration };
}

export async function getAudioUrl(path: string) {
  const { data, error } = await supabase.storage.from("recordings").createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function removeRecordingAudio(projectId: string, path: string, userId?: string) {
  await supabase.storage.from("recordings").remove([path]);
  let query = supabase
    .from("projects")
    .update({ audio_path: null, audio_mime: null, audio_size: null, duration_seconds: null })
    .eq("id", projectId);
  if (userId) query = query.eq("user_id", userId);
  await query;
}
