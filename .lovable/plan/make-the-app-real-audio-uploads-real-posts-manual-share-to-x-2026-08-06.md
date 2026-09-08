# Make the app real: audio uploads, real posts, manual share to X

Replace the demo placeholders with working functionality. Automatic/background publishing stays out of scope — publishing is a deliberate, manual action by the user.

## What you'll be able to do

1. **Upload audio to a recording** — drag or pick an audio file, it uploads to private storage, and you can play it back from the recording row.
2. **Write posts** — compose real post content tied to a recording and a channel, edit it later.
3. **Schedule posts on the calendar** — pick a date and time; the calendar shows what's planned. Nothing auto-sends.
4. **Share to X manually** — a "Share to X" button opens X's compose window pre-filled with your post text. After it opens, you confirm "I posted this" and the post is marked published with a timestamp.
5. **Honest labels stay only where they're still true** — the "not wired up yet" modal on Channels is replaced with a short, accurate note that publishing is manual by design.

## Screens affected

- **Recordings** — new upload control in the create dialog and a per-row "Upload audio" action; audio player and file size/duration shown when present. Demo banner removed.
- **Recording detail (new)** — clicking a recording opens a page with its audio player and the list of posts written for it, with inline compose/edit.
- **Calendar** — schedule dialog gains a time field and a "Share to X" action on each post; day cells show real post titles. Demo banner removed.
- **Channels** — connect flow keeps the saved handle (used to attribute posts) but the modal copy changes from "not wired up" to "manual publishing: we open X for you to post". No fake OAuth claims.

## Technical details

**Storage**
- Private bucket `recordings`, path `{user_id}/{project_id}/{filename}`.
- RLS on `storage.objects`: users can read/insert/delete only under their own `user_id` prefix.
- Playback via signed URLs generated on demand.
- Client-side validation: audio MIME types only, 50 MB cap.

**Schema migration**
- `projects`: add `audio_path text`, `audio_mime text`, `audio_size bigint`, `duration_seconds numeric`.
- `posts`: add `external_url text` (link to the live post, optional) and allow status values `draft | scheduled | published`.
- Grants + existing RLS patterns unchanged (owner-scoped, `authenticated` role).

**Share to X**
- Web intent: `https://x.com/intent/post?text=<encoded content>`, opened via `window.open` in a new tab.
- Character counter on the composer (280 for X; other platforms show a soft count).
- After the tab opens, a confirm step sets `status = 'published'`, `published_at = now()`, optional pasted post URL into `external_url`.
- Non-X channels get the same manual pattern: copy-to-clipboard plus "mark as published".

**Out of scope (explicit)**
- Automated/background publishing, OAuth token storage, cron jobs.
- Transcription and AI draft generation (can be added later; not part of this change).
