# Honest state: channels, calendar grid, and recordings

## Answering your questions first

**Are channel connections real?** No. Connecting a channel just saves a platform name and a handle string to the database. There is no OAuth, no provider tokens, and no publishing code anywhere in the project (there are no backend functions at all). A post marked "published" only changes a status value in our own database — nothing is sent to X, LinkedIn, Threads, or anywhere else.

**Where are the real recordings?** There aren't any. A "recording" today is just a title plus a status. There is no microphone capture, no file upload, no audio storage bucket, and no transcript or audio field on the record. Everything you saw was typed in by hand during the demo walkthrough.

**Calendar grid.** Confirmed bug. The month view only renders the days that exist in the month and shifts the first day with a column offset, so the leading and trailing cells of the grid are empty holes with no borders. The right-edge border also only clears on the very last cell instead of the last cell of each row — which is why the grid looks unfinished.

## What this plan does

Make the app honest about what is and isn't wired up, and fix the calendar rendering. It does not build real publishing or real audio capture — those are separate, larger pieces of work.

### 1. Fix the calendar grid

Render a complete 6-week grid from the start of the week containing the 1st to the end of the week containing the last day, so every cell exists. Remove the column-offset hack. Apply the right border per column (every 7th cell) instead of only on the final cell, and keep the bottom border on all rows so the outer frame closes cleanly. Days outside the current month render muted but still fill the grid.

### 2. "Not connected for real" disclosure on Channels

- Add a persistent notice at the top of the Channels page stating that connections are local records only and no posts leave the app yet.
- Change the connect dialog to open an informational modal per platform that explains, in plain language plus a short technical section, what real publishing requires: registering a developer app with that provider, an OAuth consent flow so each user grants access, secure storage of each user's tokens, and a backend function that calls the provider's publish endpoint on a schedule.
- Keep the existing "save a handle" action available below the explanation, clearly labelled as a demo placeholder, so the current demo data still works.
- Cards show a "Demo" badge instead of implying a live connection.

### 3. Publishing disclosure on Calendar and Recordings

- When a post is created or moved to "published", show a modal (or inline note in the scheduling dialog) clarifying that this records intent locally and nothing is transmitted to the platform.
- Add the same short explainer to the Recordings page for the "Published" status.

### 4. Recordings honesty + a real path forward

- Add a banner on the Recordings page explaining that entries are metadata only — no audio is captured or stored yet — and outlining what real recordings need: browser microphone capture, an audio storage bucket, a transcription step, and AI generation of post drafts.
- Keep the manual "New Recording" dialog as the demo entry point.

## Technical notes

- Files touched: `src/pages/dashboard/Calendar.tsx`, `src/pages/dashboard/Channels.tsx`, `src/pages/dashboard/Recordings.tsx`, plus one small shared component for the "not implemented yet" modal.
- No database migration required. No new dependencies.
- Styling stays neo-brutalist: 1px black borders, hard shadows, existing tokens.

## Not in scope here (say the word and I'll plan it separately)

- Real per-user OAuth connections and publishing to X / LinkedIn / Threads via a backend function.
- Real audio capture, storage, transcription, and AI post generation.
