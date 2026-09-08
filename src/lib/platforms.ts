export interface PlatformSpec {
  id: string;
  label: string;
  /** What a draft for this platform actually is. */
  variant: "post" | "caption" | "script" | "email";
  limit: number | null;
  /** Short human hint shown in the UI. */
  hint: string;
  /** How publishing works: an intent link, or copy + open the app. */
  share: "intent" | "copy";
}

export const PLATFORMS: PlatformSpec[] = [
  { id: "twitter", label: "X", variant: "post", limit: 280, hint: "Short punchy post", share: "intent" },
  { id: "instagram", label: "Instagram", variant: "caption", limit: 2200, hint: "Caption + hook + hashtags", share: "copy" },
  { id: "tiktok", label: "TikTok", variant: "script", limit: 2200, hint: "30-45s spoken script", share: "copy" },
  { id: "youtube_shorts", label: "YouTube Shorts", variant: "script", limit: 2200, hint: "45-60s spoken script", share: "copy" },
  { id: "linkedin", label: "LinkedIn", variant: "post", limit: 3000, hint: "Hook + story + takeaway", share: "intent" },
  { id: "threads", label: "Threads", variant: "post", limit: 500, hint: "Conversational post", share: "intent" },
  { id: "facebook", label: "Facebook", variant: "post", limit: 2000, hint: "Plain-spoken post", share: "intent" },
  { id: "newsletter", label: "Newsletter", variant: "email", limit: 5000, hint: "Subject line + short email", share: "copy" },
];

export const PLATFORM_LABELS: Record<string, string> = PLATFORMS.reduce(
  (acc, p) => ({ ...acc, [p.id]: p.label }),
  { newsletter: "Newsletter" } as Record<string, string>,
);

export const platformById = (id?: string | null) => PLATFORMS.find((p) => p.id === id);

export const platformLabel = (id?: string | null) =>
  (id && (platformById(id)?.label ?? PLATFORM_LABELS[id])) || id || "Anywhere";
