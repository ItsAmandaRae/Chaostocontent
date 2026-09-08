export const X_LIMIT = 280;

export function openXIntent(text: string) {
  const url = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function limitFor(platform?: string | null) {
  if (platform === "twitter") return X_LIMIT;
  if (platform === "linkedin") return 3000;
  if (platform === "threads") return 500;
  return null;
}
