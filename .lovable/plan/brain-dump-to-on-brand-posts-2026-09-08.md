# Brain dump to on-brand posts

Turn the app from "voice note → X post" into a brain-dump catcher built for ADHD / executive dysfunction: throw in anything (voice, typed note, screenshot, link), and get on-brand drafts for every platform you care about — without losing the golden idea you had last week.

## The three pieces

### 1. Brand DNA (one-time setup, editable forever)
A short guided setup, one question per screen, skippable and resumable:
- Who you are / what you do
- Who you're talking to (audience, their problem)
- Your voice: pick tone traits, paste 2-3 posts that sound like you, list words and phrases you'd never say
- Your offers / links / CTA style
- Platforms you actually post on

Everything you paste becomes the voice reference the AI writes against, so drafts sound like you instead of like ChatGPT. Shown as a "Brand DNA" page with a completeness meter; you can improve it any time and drafts get better.

### 2. Brain dump inbox
One big "Dump it" button on every screen. Accepts:
- **Voice** — record in the app or upload a voice note; auto-transcribed
- **Text** — typed or pasted notes
- **Screenshots / images** — text is read out of them automatically, plus a one-line summary of what the idea is
- **Links** — saved with the page title

Every dump lands in an inbox with an auto-title, a plain-language summary, and a few suggested tags, so nothing is a wall of text you have to re-read. Inbox items have exactly three states: New, Used, Archived. Search across everything (including screenshot text), so the golden nugget from last week is findable.

ADHD-friendly details: nothing is ever required to be finished, dumps save instantly, no forms with many fields, one primary action per screen, and a "Resurface" strip that shows a few older unused ideas so they don't rot.

### 3. Idea → posts
Open a dump (or select several), hit "Make posts", pick platforms, and get drafts written to each platform's native shape using your Brand DNA:
- **X** — short post or a thread
- **Instagram** — caption + hook + hashtag suggestions
- **TikTok / YouTube Shorts** — a spoken script with a hook, beats, and on-screen text
- **LinkedIn** — longer post with a hook line and takeaway
- **Threads / Facebook** — native-length post
- **Newsletter** — subject line + short body

Each draft is editable, has a live character count against that platform's limit, and can be regenerated with a nudge ("punchier", "shorter", "more personal"). Drafts keep a link back to the dump they came from.

### Publishing stays manual
One tap copies the text (and downloads the image if there is one) and opens the platform's composer, then you confirm "I posted this" and it's marked published with a timestamp and optional link. TikTok and Instagram don't allow simple posting from a web app, so manual keeps every platform working the same honest way. Scheduling on the calendar becomes a reminder, not an auto-send.

## What changes on existing screens

- **Sidebar** — Dump (inbox), Ideas, Posts, Calendar, Brand DNA, Channels, Analytics.
- **Recordings** becomes part of the inbox rather than its own concept; existing recordings and their posts are preserved and appear as dumps.
- **Channels** becomes "where I post" — platform selection and handles, with the honest manual-publishing note.
- **Settings** — default tone moves into Brand DNA; the "auto-publish" toggle is removed since nothing auto-publishes.
- **Landing page copy** is reworked around brain dump → on-brand posts, and names ADHD / executive dysfunction directly.

## Technical details

**Data model (new tables, owner-scoped RLS + grants):**
- `brand_profiles` — one per user: positioning, audience, tone traits, voice samples, banned words, offers/CTAs, active platforms, completeness score.
- `dumps` — kind (`audio | text | image | link`), title, raw text/transcript, summary, tags, source file path, status (`new | used | archived`), created_at.
- `dump_assets` — extra files per dump (multiple screenshots).
- `posts` — extend with `dump_id`, `platform`, `variant` (post/thread/script/caption), `prompt_notes`, `char_count`; keep `channel_id`, status, `scheduled_at`, `published_at`, `external_url`.
- Existing `projects` rows are migrated into `dumps`; `posts.project_id` is kept nullable during transition.
- Full-text search index over dump text + summary.

**Storage:** existing private `recordings` bucket reused for audio; new private `dumps` bucket for images, same `{user_id}/...` prefix RLS; signed URLs for playback/preview.

**AI (Lovable AI, no keys needed), all in edge functions:**
- `transcribe-dump` — audio → transcript via the gateway speech-to-text endpoint (streamed), chunking long files.
- `read-image-dump` — screenshot → extracted text + one-line idea via a multimodal chat model.
- `summarize-dump` — title, summary, tags for any dump.
- `generate-posts` — Brand DNA + selected dumps + chosen platforms → structured drafts per platform (constraint-free schema, limits stated in the prompt and clamped in code, guarded against non-conforming output).
- Gateway failures (rate limit, credits, policy) surface as clear in-app messages, never a silent empty draft.

**Client:** `src/lib/platforms.ts` extended with per-platform limits and native formats; `src/lib/share.ts` extended to intent URLs where they exist (X, LinkedIn, Facebook, Threads) and copy-and-open elsewhere (Instagram, TikTok, YouTube).

## Suggested order
1. Brand DNA setup + page (drafts have something to write against).
2. Dump inbox with voice/text/image/link, transcription, screenshot reading, summaries, search.
3. Post generation for all eight platforms + editing/regeneration.
4. Manual share flow per platform, calendar as reminders, sidebar/landing copy rework.
