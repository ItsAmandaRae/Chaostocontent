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
    limit: null,
    brief:
      "Start with SUBJECT: <subject line under 60 characters>, then a blank line, then the email body " +
      "with a clear takeaway and a single CTA.",
  },
  {
    id: "blog",
    label: "Blog / Website",
    variant: "article",
    limit: null,
    brief:
      "A blog post: TITLE: <title> on the first line, then well-structured body copy with short " +
      "section headings. As long as the material genuinely supports — no padding.",
  },
  {
    id: "youtube",
    label: "YouTube",
    variant: "script",
    limit: null,
    brief:
      "A long-form video script: TITLE: <title>, then HOOK, structured sections with spoken lines, " +
      "B-roll notes as [B-ROLL: ...], and an outro. As long as the material supports.",
  },
];

export const platformById = (id: string) => PLATFORMS.find((p) => p.id === id);

export interface FormatSpec {
  id: string;
  label: string;
  /** true when a platform character cap must NOT be applied (blog, scripts, email). */
  longForm: boolean;
  brief: string;
}

export const FORMATS: FormatSpec[] = [
  {
    id: "text_post",
    label: "Text post",
    longForm: false,
    brief: "A single text post or caption, ready to paste.",
  },
  {
    id: "story_sequence",
    label: "Story sequence",
    longForm: false,
    brief:
      "A sequence of 3-6 story frames. Label each as SLIDE 1:, SLIDE 2:, etc. Each slide is a few " +
      "short lines of copy, max ~120 characters per slide.",
  },
  {
    id: "reel_script",
    label: "Reel / Short script",
    longForm: true,
    brief:
      "A 30-60 second spoken script: HOOK, beats of substance, closing line. Mark on-screen text as " +
      "[ON SCREEN: ...]. This is a script, not a caption — length is set by what the material supports.",
  },
  {
    id: "carousel",
    label: "Carousel copy",
    longForm: true,
    brief:
      "Slide-by-slide carousel COPY. Label each as SLIDE 1:, SLIDE 2:, etc. Slide 1 is the hook, the " +
      "middle slides carry one point each, the final slide is the takeaway or CTA. Copy only — do not " +
      "describe or imply generated images or design.",
  },
  {
    id: "blog",
    label: "Blog post",
    longForm: true,
    brief:
      "A full blog post: TITLE: <title>, then structured body copy with short section headings. " +
      "As long as the material genuinely supports — no padding, no invented sections.",
  },
  {
    id: "video_script",
    label: "Long-form video script",
    longForm: true,
    brief:
      "A long-form video script: TITLE: <title>, HOOK, structured sections with spoken lines, " +
      "[B-ROLL: ...] notes, and an outro. Copy only — do not imply a produced video.",
  },
  {
    id: "email",
    label: "Email",
    longForm: true,
    brief:
      "An email: SUBJECT: <subject line under 60 characters>, a blank line, then the body with a " +
      "clear takeaway and a single CTA.",
  },
];

export const formatById = (id: string) => FORMATS.find((f) => f.id === id);

/** Picks a sensible format for a platform when the user didn't choose one. */
export function defaultFormatFor(platformId: string): string {
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
