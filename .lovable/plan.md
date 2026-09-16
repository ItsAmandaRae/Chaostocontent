# Rebrand LOUDIO as Chaos To Content

## Goal
Make the whole product clearly about turning messy, multimodal brain dumps into authentic, on-brand posts—not managing recordings.

## Product language and naming
- Replace every visible **LOUDIO / Loudio** reference with **Chaos To Content** across the public site, sign-in flow, dashboard, demo, footer, notices, and page metadata.
- Replace the old LOUDIO artwork with a responsive **Chaos To Content** wordmark that remains readable in the header, sidebar, mobile menu, and large footer treatment.
- Use **Brain Dumps** for the collection and navigation label, **Brain Dump** for one item, and **Dump it** for the main capture action.
- Rewrite recording-first labels, empty states, tooltips, settings limits, analytics labels, channel descriptions, and detail-page language so audio is presented as one possible input rather than the product itself.
- Keep internal storage and database identifiers unchanged where renaming them would risk existing user data.

## Brain dump experience
- Make the existing multimodal inbox the primary Brain Dumps destination: voice notes, audio files, typed thoughts/rants, screenshots or images, and links all feed the same flow.
- Replace the signed-in **Ideas** navigation label with **Brain Dumps** while retaining the current capture, search, processing, resurfacing, and post-generation behavior.
- Rework the demo from a recording library into a representative Brain Dumps experience with varied sample inputs and brain-dump-focused actions and messages.
- Update dashboard and demo summaries to measure brain dumps and generated posts rather than recordings.
- Rename visible detail-page concepts from recording to brain dump, while keeping audio playback available when the source is audio.
- Introduce canonical `/dashboard/brain-dumps` and `/demo/brain-dumps` URLs, with redirects from old `/recordings` and current `/ideas` links so bookmarks do not break.

## Public-site message
- Rewrite the opening section around the literal offer: **Chaos To Content** turns scattered thoughts into usable posts.
- Explicitly show the accepted inputs—voice note, uploaded file, rant, text, screenshot, or link—and the outcome: organized ideas and platform-ready drafts in the user’s own voice.
- Update feature, use-case, CTA, FAQ, and footer copy to reflect Brand DNA, automatic reading/transcription, multimodal capture, AI-assisted drafting, and manual user-approved sharing across major platforms.
- Remove obsolete statements saying transcription, in-app recording, or AI drafting are unavailable.

## Color system
- Keep the existing pastel pink as the primary brand color.
- Replace the sunshine yellow semantic color with a very light pastel cyan (`#DDFBFF`) in both light and dark themes.
- Replace hardcoded yellow instances with the same semantic cyan token so landing, demo, dashboard, selections, tags, banners, and hover states stay consistent.
- Preserve the current black-and-white neo-brutalist structure and the existing mint/orange supporting accents; this is a focused palette update rather than a visual redesign.

## Metadata and cleanup
- Set the page title and social metadata to Chaos To Content with brain-dump-to-content wording.
- Remove stale template branding and the old audio-first/X-only description from metadata.
- Update accessible logo labels and demo identities that still contain the old name.
- Verify there are no remaining user-visible LOUDIO, audio-first, recording-library, yellow, or X-only claims.

## Validation
- Check the public page, authentication page, signed-in dashboard, Brain Dumps list/detail, and every demo page on desktop and mobile.
- Confirm old recording and ideas URLs redirect to the new Brain Dumps locations.
- Test all capture modes still open correctly and existing audio items remain accessible.
- Run the project’s checks and inspect the browser for layout overflow, broken links, and runtime errors after the longer wordmark and copy changes.

## Technical notes
- No database migration is needed for this rebrand; existing `dumps`, legacy project records, and storage paths remain compatible.
- Route aliases and redirects will protect existing links while the visible URLs and navigation move to Brain Dumps.
- Brand color changes will be made through semantic design tokens rather than one-off component colors.
