export interface PlatformSpec {
  id: string;
  label: string;
  /** What a draft for this platform actually is. */
  variant: "post" | "caption" | "script" | "email" | "article";
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
  { id: "newsletter", label: "Newsletter", variant: "email", limit: null, hint: "Subject line + email", share: "copy" },
  { id: "blog", label: "Blog / Website", variant: "article", limit: null, hint: "Full blog post", share: "copy" },
  { id: "youtube", label: "YouTube", variant: "script", limit: null, hint: "Long-form video script", share: "copy" },
];

export interface FormatSpec {
  id: string;
  label: string;
  longForm: boolean;
  hint: string;
}

export const FORMATS: FormatSpec[] = [
  { id: "text_post", label: "Text post", longForm: false, hint: "One post or caption" },
  { id: "story_sequence", label: "Story sequence", longForm: false, hint: "3-6 story frames" },
  { id: "reel_script", label: "Reel / Short script", longForm: true, hint: "Spoken script + on-screen text" },
  { id: "carousel", label: "Carousel copy", longForm: true, hint: "Slide-by-slide text" },
  { id: "blog", label: "Blog post", longForm: true, hint: "Title + full article" },
  { id: "video_script", label: "Long-form video script", longForm: true, hint: "Full spoken script" },
  { id: "email", label: "Email", longForm: true, hint: "Subject + body" },
];

export const formatById = (id?: string | null) => FORMATS.find((f) => f.id === id);
export const formatLabel = (id?: string | null) => formatById(id)?.label ?? "Post";

export function defaultFormatFor(platformId?: string | null): string {
  const spec = platformById(platformId);
  switch (spec?.variant) {
    case "script":
      return platformId === "youtube" ? "video_script" : "reel_script";
    case "email":
      return "email";
    case "article":
      return "blog";
    default:
      return "text_post";
  }
}

export const PLATFORM_LABELS: Record<string, string> = PLATFORMS.reduce(
  (acc, p) => ({ ...acc, [p.id]: p.label }),
  {} as Record<string, string>,
);

export const platformById = (id?: string | null) => PLATFORMS.find((p) => p.id === id);

export const platformLabel = (id?: string | null) =>
  (id && (platformById(id)?.label ?? PLATFORM_LABELS[id])) || id || "Anywhere";
