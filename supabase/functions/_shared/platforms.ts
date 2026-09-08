export interface PlatformSpec {
  id: string;
  label: string;
  variant: string;
  limit: number | null;
  brief: string;
}

export const PLATFORMS: PlatformSpec[] = [
  {
    id: "twitter",
    label: "X",
    variant: "post",
    limit: 280,
    brief:
      "One punchy post under 280 characters. Strong first line, no hashtags unless they earn their place.",
  },
  {
    id: "instagram",
    label: "Instagram",
    variant: "caption",
    limit: 2200,
    brief:
      "A caption: a scroll-stopping hook line, short readable paragraphs with line breaks, a clear CTA, " +
      "then 5-10 relevant hashtags on their own final line.",
  },
  {
    id: "tiktok",
    label: "TikTok",
    variant: "script",
    limit: 2200,
    brief:
      "A 30-45 second spoken script: HOOK (first 3 seconds), 3-4 beats of substance, and a closing line. " +
      "Mark on-screen text as [ON SCREEN: ...]. End with a short caption line labelled CAPTION:.",
  },
  {
    id: "youtube_shorts",
    label: "YouTube Shorts",
    variant: "script",
    limit: 2200,
    brief:
      "A 45-60 second spoken script: HOOK, 3-4 beats, payoff. Mark on-screen text as [ON SCREEN: ...]. " +
      "End with a TITLE: line under 70 characters.",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    variant: "post",
    limit: 3000,
    brief:
      "A hook line, one blank line, then a specific story or insight in short paragraphs, ending in a " +
      "takeaway and a light question. Professional but human — no corporate filler, no hashtag spam.",
  },
  {
    id: "threads",
    label: "Threads",
    variant: "post",
    limit: 500,
    brief: "One conversational post under 500 characters. Casual, opinionated, no hashtags.",
  },
  {
    id: "facebook",
    label: "Facebook",
    variant: "post",
    limit: 2000,
    brief: "A warm, plain-spoken post of a few short paragraphs, ending with a question.",
  },
  {
    id: "newsletter",
    label: "Newsletter",
    variant: "email",
    limit: 5000,
    brief:
      "Start with SUBJECT: <subject line under 60 characters>, then a blank line, then a short email of " +
      "200-350 words with a clear takeaway and a single CTA.",
  },
];

export const platformById = (id: string) => PLATFORMS.find((p) => p.id === id);
