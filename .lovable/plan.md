# Chaos to Content — core functional iteration

## Schema (additive, all data preserved)
- New `public.buckets` (id, user_id, name, created_at) + `public.ideas` (id, user_id, dump_id nullable, bucket_id nullable, title, angle, source_excerpt, created_at/updated_at, deleted_at). RLS owner-only + GRANTs on both.
- Add columns: `posts.bucket_id uuid`, `posts.idea_id uuid`, `posts.deleted_at timestamptz` (soft delete); indexes. Regenerate types.
- Bucket delete = reassign items to null (Unsorted); enforced by app + RLS, never cascades content.

## Edge functions (shared auth/AI helpers already exist)
- New `extract-ideas`: validates dump ownership, reads original source (raw_text/summary/extracted text), returns ≤5 grounded ideas {title, angle, excerpt}. No content creation. Clear errors (empty source, unreadable, quota).
- Extend `generate-posts`: add `ideaId` source, `format` (text post, story sequence, reel/short script, carousel copy, blog, video script, email) + `platform`/destination (incl. blog, email, YouTube), `voiceMode: "my_words" | "reference"` + optional context note, `rawMode` for "Too polished. Bring back my words." (regenerates from ORIGINAL source; returned as suggestion, not overwrite). One primary output per request. No caption clamping on blog/script/email. System prompt: light-touch shaping, no invented facts/lessons/CTA, source treated as untrusted data.

## Frontend
- `IdeaDetail`/dump detail: after source readable, two actions — "Pull out ideas" and "Make content". Suggestion list: save one / save all / dismiss, double-click safe, retry on error.
- New `/dashboard/ideas` = Idea Bank (editable cards, source excerpt + link, "Make content", manual add). Old `/dashboard/ideas` (dumps) moves; `/dashboard/brain-dumps` and `/recordings` keep working via existing redirects.
- Shared content-creation UI for dump→content and idea→content: platform + format pickers, one output default, format-aware editing (slides, script, subject/body), copy.
- Content (`Posts.tsx` renamed nav label "Content"): editor with debounced autosave + saving/saved/error state, no stale-race overwrites, "Too polished" action with review/apply, optional bucket, "Add to planner", soft delete with undo.
- Buckets: shared chips (All / Unsorted / user buckets / + New) on Ideas + Content; create/rename/delete; delete moves items to Unsorted.
- Planner (`Calendar.tsx` renamed "Planner"): drop projects/channels dependency; plan any content to a date (same record, `scheduled_at`), move/remove date, open/edit/copy, optional "Posted" marking, "Planned for" labels, month + usable mobile list, local-timezone dates.
- Nav: Brain Dumps, Idea Bank, Content, Planner, Brand DNA (Home stays; Channels/Analytics routes preserved, moved out of primary nav).
- Demo: sample ideas/buckets/content, local-only changes, clearly labeled demo data, no live AI calls.
- Logo fix: dark strokes for inner card lines on inverse variant.
- Reduced-motion respected; no new deps.

## Verification
- Production build + tsgo. Playwright public/demo desktop+mobile. Authenticated routes remain unverified (no authorized test account) — reported as such.
