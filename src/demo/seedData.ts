import { subDays, subHours, addDays, setHours, setMinutes } from "date-fns";

export type DemoStatus = "draft" | "processing" | "ready" | "published";

export interface DemoProject {
  id: string;
  title: string;
  status: DemoStatus;
  created_at: string;
  updated_at: string;
  audio_path: string | null;
  audio_size: number | null;
  duration_seconds: number | null;
}

export interface DemoChannel {
  id: string;
  platform: string;
  handle: string;
  is_default: boolean;
  connected_at: string;
}

export interface DemoPost {
  id: string;
  project_id: string;
  channel_id: string | null;
  content: string;
  status: "draft" | "scheduled" | "published";
  scheduled_at: string | null;
  published_at: string | null;
  external_url: string | null;
  created_at: string;
}

export interface DemoProfile {
  display_name: string;
  email: string;
  default_tone: string;
  auto_publish: boolean;
}

const iso = (d: Date) => d.toISOString();
const at = (base: Date, h: number, m = 0) => iso(setMinutes(setHours(base, h), m));

const now = new Date();

export const demoProfile: DemoProfile = {
  display_name: "Mara Okonkwo",
  email: "mara@loudio.demo",
  default_tone: "witty",
  auto_publish: false,
};

export const demoChannels: DemoChannel[] = [
  { id: "ch-x", platform: "twitter", handle: "maraonaudio", is_default: true, connected_at: iso(subDays(now, 64)) },
  { id: "ch-li", platform: "linkedin", handle: "mara-okonkwo", is_default: false, connected_at: iso(subDays(now, 61)) },
  { id: "ch-th", platform: "threads", handle: "maraonaudio", is_default: false, connected_at: iso(subDays(now, 40)) },
  { id: "ch-nl", platform: "newsletter", handle: "loudweekly", is_default: false, connected_at: iso(subDays(now, 21)) },
];

const projectSeed: [string, DemoStatus, number, number | null, number | null][] = [
  ["Morning walk: why founders should ship ugly", "published", 1, 214, 3_412_000],
  ["Voice note — pricing page teardown", "published", 2, 486, 7_910_000],
  ["Client call debrief: onboarding friction", "ready", 3, 902, 14_220_000],
  ["Hot take on AI slop in newsletters", "ready", 5, 178, 2_880_000],
  ["Airport rant about status pages", "published", 7, 331, 5_140_000],
  ["Thread draft: 6 things I stopped doing", "ready", 9, 254, 4_090_000],
  ["Studio session — brand voice notes", "processing", 11, 1_248, 19_600_000],
  ["Random shower idea: audio-first CRM", "draft", 13, 96, 1_520_000],
  ["Podcast guest prep, take two", "draft", 16, 640, 10_050_000],
  ["Retro: what the launch week taught us", "published", 20, 723, 11_380_000],
  ["Coffee shop monologue on hiring", "ready", 24, 402, 6_320_000],
  ["Weekend notes — community questions", "draft", 28, 155, 2_410_000],
  ["Deep dive: churn interviews round 3", "processing", 33, 1_010, 15_880_000],
  ["Late night idea dump for Q3", "draft", 41, 288, 4_530_000],
];

export const demoProjects: DemoProject[] = projectSeed.map(([title, status, daysAgo, dur, size], i) => ({
  id: `rec-${i + 1}`,
  title,
  status,
  created_at: iso(subDays(now, daysAgo)),
  updated_at: iso(subHours(subDays(now, daysAgo), -6)),
  audio_path: dur ? `demo/${i + 1}.m4a` : null,
  audio_size: size,
  duration_seconds: dur,
}));

const postSeed: [string, string | null, string, DemoPost["status"], number][] = [
  ["Ship the ugly version. The polished one you never launch converts at exactly 0%.", "ch-x", "rec-1", "published", -1],
  ["Founders keep confusing 'not ready' with 'not brave'. Post the ugly draft.", "ch-li", "rec-1", "published", -1],
  ["Your pricing page is a paragraph too long. I read 40 of them this week — here's the pattern.", "ch-x", "rec-2", "published", -2],
  ["Onboarding friction is rarely the form. It's the 9 seconds of silence after submit.", "ch-li", "rec-3", "scheduled", 1],
  ["AI slop in newsletters is just laziness with better grammar.", "ch-x", "rec-4", "scheduled", 2],
  ["Status pages should tell me what broke, not that 'some users may be impacted'.", "ch-x", "rec-5", "published", -7],
  ["6 things I stopped doing this quarter (and shipped more because of it) 🧵", "ch-x", "rec-6", "scheduled", 3],
  ["Brand voice isn't a font. It's the sentence you'd say out loud without cringing.", "ch-th", "rec-7", "draft", 0],
  ["What if your CRM was just voice notes with good search?", "ch-x", "rec-8", "draft", 0],
  ["Prepping for a podcast: three stories, zero slides.", "ch-li", "rec-9", "scheduled", 5],
  ["Launch week retro: the demo mattered more than the docs.", "ch-li", "rec-10", "published", -19],
  ["Hire the person who asks about the customer in minute two.", "ch-x", "rec-11", "scheduled", 6],
  ["Community question of the week: how do you batch content without sounding batched?", "ch-nl", "rec-12", "scheduled", 8],
  ["Churn interviews round 3: people don't leave over price, they leave over silence.", "ch-li", "rec-13", "scheduled", 11],
  ["Q3 idea dump — picking three, killing nine.", "ch-th", "rec-14", "draft", 0],
  ["Reminder: audio first, edit later. The record button is the whole strategy.", "ch-x", "rec-1", "scheduled", 4],
];

export const demoPosts: DemoPost[] = postSeed.map(([content, channel_id, project_id, status, offset], i) => {
  const day = offset === 0 ? now : offset < 0 ? subDays(now, -offset) : addDays(now, offset);
  const hour = 9 + (i % 8);
  return {
    id: `post-${i + 1}`,
    project_id,
    channel_id,
    content,
    status,
    scheduled_at: status === "draft" ? null : at(day, hour, (i % 4) * 15),
    published_at: status === "published" ? at(day, hour, (i % 4) * 15) : null,
    external_url: status === "published" ? "https://x.com/maraonaudio" : null,
    created_at: iso(subDays(now, Math.abs(offset) + 3)),
  };
});
