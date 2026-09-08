import { platformById } from "./platforms";

export const X_LIMIT = 280;

export function limitFor(platform?: string | null) {
  return platformById(platform)?.limit ?? null;
}

/** Where to send the user to actually post, per platform. */
function composeUrl(platform: string, text: string) {
  const encoded = encodeURIComponent(text);
  switch (platform) {
    case "twitter":
      return `https://x.com/intent/post?text=${encoded}`;
    case "linkedin":
      return "https://www.linkedin.com/feed/?shareActive=true";
    case "threads":
      return `https://www.threads.net/intent/post?text=${encoded}`;
    case "facebook":
      return "https://www.facebook.com/";
    case "instagram":
      return "https://www.instagram.com/";
    case "tiktok":
      return "https://www.tiktok.com/upload";
    case "youtube_shorts":
      return "https://studio.youtube.com/";
    default:
      return null;
  }
}

export function openXIntent(text: string) {
  window.open(composeUrl("twitter", text)!, "_blank", "noopener,noreferrer");
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copies the draft and opens the platform's composer.
 * Returns whether the text made it to the clipboard.
 */
export async function shareTo(platform: string | null | undefined, text: string) {
  const copied = await copyText(text);
  const url = platform ? composeUrl(platform, text) : null;
  if (url) window.open(url, "_blank", "noopener,noreferrer");
  return { copied, opened: Boolean(url) };
}

export function shareVerb(platform?: string | null) {
  const spec = platformById(platform);
  if (!spec) return "Copy text";
  return spec.share === "intent" ? `Open ${spec.label}` : `Copy & open ${spec.label}`;
}
