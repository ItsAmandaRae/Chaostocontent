# Roadmap

## Focused authentication repair (2026-10-22)
- [x] Read-only live bundle comparison proves published `/assets/index-CTJNkMV0.js` lacks application recovery marker/form and persistent signup guidance; old reset request targets `/auth`, current source targets `/reset-password`. Published `/reset-password` has no reset UI. Intercepted recover requests before network dispatch: no emails sent.
- [x] Reproduced expired recovery/confirmation callback -> logo -> forced callback screen instead of landing. Explicit departures now clear state and invalidate late validation; ordinary sign-in clears recovery permission. Initialization fallback cannot supersede an observed recovery event. Email whitespace normalized for login/signup/reset/resend; persistent reset/login errors and Set or reset password label added.
- [x] Real GET `/auth/v1/settings` returned 200: email enabled, signup enabled, confirmation required, anonymous disabled. Project-info confirms active service. Supported read-only tools/CLI do not expose hosted site_url or redirect allowlist; neither verified nor changed. Owner account/password/roles/verification/sessions untouched.
- [x] `bun tests/signup.test.ts`, `bun tests/recovery.test.ts`, real read-only `bun tests/authSettings.test.ts`, `python3 tests/authRepair.browser.py`, `python3 tests/recovery.browser.py`, `python3 tests/signup.browser.py` passed. New isolated tests cover expired-link departure, abandoned asynchronous callback checks, slow validation -> new-password without reload, whitespace/exact redirect, persistent login/reset errors, ordinary session denial. Existing recovery test now opens each email callback as a fresh document instead of hash-only navigation/reload workaround; validated recovery reload and mocked save -> local signout -> sign-in still pass. Desktop/360px screenshots inspected; no page errors. Managed build OK at 05:53:00 UTC.
- Changed files: `src/lib/signup.ts`, `src/lib/recoverySession.ts`, `src/lib/confirmationSession.ts`, `src/pages/Auth.tsx`, `src/components/SignupVerification.tsx`, `tests/signup.test.ts`, `tests/recovery.browser.py`, new `tests/authRepair.browser.py`, `AGENTS.md`, `roadmap.md`. RecoveryForm, RecoveryRedirect, DashboardLayout and generated storage inspected, left unchanged. Latest observed managed checkpoint `ab35999` before this documentation update; no manual commit.
- Limit: real email delivery and genuine recovery-link -> saved-password -> sign-in cannot be verified without an authorized isolated inbox/link; no real account or credential operations. Hosted preview browser navigation timed out; running local preview and published site compared. Publication remains pending, never automatic.

## Mobile planner redesign + pre-invite readiness audit
- [x] Shared PlannerBoard mobile: true 7-column month grid and week strip at 360/390px with weekday headings, bounded cells, visible bucket-colored mini bars (not dots), all buckets together; tap selects a day, single selected-day panel (owned by PlannerBoard; removed Calendar's duplicate section) lists ALL day records with full titles/bucket labels and explicit "Add content to this day" chooser action. Selected (ring + aria-pressed) and Today (bold/underline + aria-current) distinct beyond color. Desktop bounded 180px/190px views, overflow dialog, view memory, local dates and legend preserved. List view unchanged.
- [x] Dependency patches: react-router-dom 6.30.6 / react-router 6.30.6 / @remix-run/router 1.23.3, lodash 4.18.1, ws 8.21.0 via package.json overrides + regenerated package-lock; rescan clean for ws/lodash/open-redirect advisories. UNRESOLVED: two moderate react-router advisories (SSR deserializeErrors constructor injection; backslash open redirect) fixed only in react-router 7.18 — major migration, not done in this pass; both require SSR or attacker-crafted links, and this app is a client-rendered SPA.
- [x] Landing 360px horizontal overflow fixed (BentoGrid section now clips); public/auth/demo pages 0 overflow at 1280/390/360.
- [x] AI provider confirmed Lovable gateway only (shared helper, all three functions). Customer-facing 402/403 text replaced with plain temporary-unavailability wording (no workspace-credit instructions); upstream error body no longer echoed to users. Functions redeployed.
- [x] Legacy audio client limit aligned to the real 25 MB storage cap (was 50 MB, which storage rejected). Upload caps: audio 25 MB, images 20 MB enforced client+server. GAP (report only): no aggregate per-user storage cap exists; pending owner policy decision.
- [x] Read-only owner access check (projectfindingfreedom@gmail.com): email confirmed, admin role, active no-expiry complimentary grant, no billing row, effective plan Complimentary (paid: true, billing_active: false), allowances 97/100 creations and 99/100 media reads. No paid checkout/subscription/webhook is implemented — billing_entitlements comment states "No billing integration enabled"; do not invite paying users yet.
- [x] Allowance recovery confirmed: all three functions release reservations on failure; unreleased reservations expire after 10 minutes. Minor caveat: release() ignores the refund RPC's own error (expiry bounds impact).
- [x] Recovery hardening: bare `?code=` callback no longer treated as recovery intent (avoids misrouting OAuth/signup PKCE callbacks); recovery tests updated.
- [x] Tests: recovery/signup/ux/contentReuse unit suites passed; recovery.browser.py, signup.browser.py passed; plannerReuse.browser.py updated (mobile month/week selected-day panel assertions; Edmonton-local date fix) and passed at 1280/390/360 including landing overflow == 0. Managed build OK. Real signed-in planner viewed read-only at 390/360/1280 (owner session, no writes): grid, legend, mini bars, no overflow, no console errors.
- Limits: live email delivery/confirmation and recovery end-to-end remain unverified (no isolated inbox); mocked suites cover the flows. Owner has no profiles row (pre-existing; onboarding creates it if needed). Preview URL contains these changes; the published site (chaostocontent.lovable.app) is unchanged until you publish.

### Files for this iteration
- `src/components/PlannerBoard.tsx`, `src/pages/dashboard/Calendar.tsx`, `src/components/sections/Hero.tsx`, `src/components/sections/BentoGrid.tsx`
- `src/lib/audio.ts`, `src/lib/recovery.ts`, `supabase/functions/_shared/ai.ts` (redeployed process-dump/extract-ideas/generate-posts)
- `package.json`, `package-lock.json`, `tests/plannerReuse.browser.py`, `tests/recovery.test.ts`, `AGENTS.md`, `roadmap.md`

## Unified planner and no-AI platform reuse
- [x] Every bucket together in shared Week/Month/List planner, date chooser and unplanned list; non-filtering labelled legend and separate bucket manager (demo changes local-only).
- [x] Three 32px single-line bars plus reachable overflow, bounded month 180px/week 190px days; twelve named preset colors, unused-first locked default, original four keys/styles/assignments untouched. Month height includes date and overflow actions.
- [x] Owner-scoped `reuse_content` transaction changes only platform or makes a retry-idempotent editable copy, verifies latest saved text, preserves title/type/bucket/source snapshot/voice/reference/source associations; copies start unscheduled/unposted. No AI reservation/usage path.
- [x] Tweak wording disclosure contains optional nudges/rewrite/usage note; suggestions remain outside it, reviewable until applied/discarded. Copy/Open/planner and autosave feedback visible. Reset display explicitly UTC; dynamic allowances and Paid-coming-soon unchanged.
- [x] Passed `bun tests/contentReuse.test.ts`, `bun --env-file=.env tests/contentReuse.database.test.ts`, `bun run test:drafts`, `bun tests/ux.test.ts`, signup/recovery unit and browser regressions. Isolated persistence tested all twelve colors/defaults, bad palette, expected-text mismatch, destination-only metadata, latest wording/provenance copy, original retained, unscheduled/unposted copy, concurrent idempotency, cross-owner denial, bucket retention, exact unchanged app usage/zero AI rows. Fictional accounts/rows cleaned up; no emails/provider calls.
- [x] Entirely mocked signed-in browser: mixed pink/cyan/mint same day, exactly three 32px bars, 180px month/190px week bounds, six records through overflow at 1280/390/360, day chooser all content, event opens editor not chooser, unsaved-wording flush/change/copy, repeated clicks once, save failure blocks copy, mocked Instagram open + exact current clipboard, Edmonton reset November 1. `tests/plannerReuse.browser.py` retained; screenshots/logs in `/tmp/browser/planner-reuse`. Public/auth/demo desktop/mobile inspected; zero page errors, no planner/auth/demo horizontal overflow.
- [x] Latest managed production build/typecheck signal `build OK` (2026-10-17 21:13:38 UTC); no standalone build/typecheck, no manual commit. Managed checkpoint observed `8fed372` before final test/documentation updates.
- Limit: existing landing horizontal overflow at 360px measures 140px; unchanged in this planner/editor pass. Live owner writes, real provider output and live email/password flows not exercised. Existing source hard-delete cascade and 5000-character database constraint observed read-only, not altered in this scope. No billing/provider migration/payment/publishing/auth changes or dependencies.

### Files for this iteration
- `AGENTS.md`, `roadmap.md`, `src/lib/planner.ts`, `src/lib/draftQueue.ts`, `src/lib/contentReuse.ts`, `src/index.css`
- `src/components/BucketLegend.tsx`, `BucketChips.tsx`, `PlannerBoard.tsx`, `DraftCard.tsx`, `PlanAccessSection.tsx`
- `src/pages/dashboard/Calendar.tsx`, `Posts.tsx`, `src/demo/pages/Calendar.tsx`
- `drizzle/migrations/0007_unified_palette_and_content_reuse.sql`, tool-maintained migration journal and regenerated types
- `tests/contentReuse.test.ts`, `tests/contentReuse.database.test.ts`, `tests/plannerReuse.browser.py`

## Signup guidance follow-up (auth only)
- [x] No-session signup retains persistent email-verification guidance, address, spam/confirmation/sign-in next steps, Edit email and Back to sign in; no delivery/account-existence claims. Confirmation remains enabled.
- [x] Resend is an explicit signup-confirmation request with a 60-second cooldown, inflight guard and persistent errors/rate-limit guidance. Signup callbacks are separate from recovery and require server-validated confirmation before Continue.
- [x] `bun tests/signup.test.ts`, `bun tests/recovery.test.ts`, mocked signup browser flow and `python3 tests/recovery.browser.py` passed. Mocks covered no-session state/reload, no automatic resend, cooldown/inflight, resend success and 429, edit/back, validated signup callback -> Continue -> dashboard, expired confirmation without reset form, recovery regressions, 1280/360 no overflow. Latest managed build: OK. No live email, account or password changes.
- [ ] Real confirmation delivery and real recovery -> changed-password login remain blocked on supported isolated email/link access; never email owner/real people or change their passwords. No billing, publishing or planner work in this pass.

## Priority password recovery blocker
- [x] Implement SDK-owned recovery callback handling before normal redirects; public `/reset-password` and legacy `/auth` recovery, validated user/session-scoped expiring recovery marker, refresh recovery, new/confirm password + visibility and server error/retry, password-only update and local signout after success. Settings opens `/auth?mode=forgot` without sending email; requests retain a non-enumerating check-email state. Normal signup retains confirmation required.
- [x] `bun tests/recovery.test.ts` and `bun --env-file=.env tests/authSettings.test.ts` passed. `python3 tests/recovery.browser.py` passed with explicitly fictional network responses: SDK implicit recovery event/token cleanup, refresh, mismatch/show-hide, rejected update preserves form/retry, success/local signout, legacy callback, missing/expired callback, ordinary session + direct reset cannot update, signed-in forgot form/no automatic request, normal sign-in redirect, signup confirmation state, 1280/360 screenshots/no horizontal overflow/zero page errors. No real emails, fixture accounts, owner changes or settings writes.
- [ ] Live recovery -> new-password login/old-password rejection remains unverified: supported tools do not expose isolated generated recovery links; service-role link minting was explicitly rejected by the platform and was not bypassed. Actual implicit SDK config and preview broker were inspected without editing generated files. Redirect allowlist readback is not available in supported project-info/configure-auth/CLI tools; no allowlists or auth settings were changed. PKCE is not configured; SDK remains the sole callback consumer, with no manual/double exchange.
- [x] Hosted settings readback confirms signup/email enabled, confirmation required, anonymous disabled. HIBP remains untouched (previously enabled, not exposed by public readback). Latest managed compiler/build log reports `build OK`; no standalone build/typecheck run per harness requirements.
- Recovery files: `src/pages/Auth.tsx`, `src/App.tsx`, `src/pages/dashboard/Settings.tsx`, `src/components/RecoveryForm.tsx`, `src/components/RecoveryRedirect.tsx`, `src/lib/recovery.ts`, `src/lib/recoverySession.ts`, `tests/recovery.test.ts`, `tests/recovery.browser.py`, `AGENTS.md`, `roadmap.md`. Observed managed checkpoint before final documentation: `b7ce128`; no manual commit/publish/billing changes.
- Working forgot URL: `https://id-preview--189cbc37-4008-4e29-89e6-5b9845e9188c.lovable.app/auth?mode=forgot`.

- [x] Plan/access foundation: protected portable entitlements, atomic creation/media allowances, bucket/planner enforcement, admin-authorized gifts and audit
- [x] Plan/access UI, honest Free / Paid coming soon pricing with no price, demo Content/Planner, portable setup documentation
- [x] 44 isolated-fixture access regressions passed: direct-call authorization, forged state, creation/media concurrency and refunds, idempotency, expiry/revocation, billing coexistence, UTC/reset, bucket cap and downgrade/planner preservation. Serialized draft-queue tests passed.
- [x] Live fictional screenshot OCR/retry without another charge; edited idea angle persisted as generation focus; reference rewrite returns suggestion. Signed-in rapid edit/navigation persistence and suggestion apply verified (suggestion UI used a mocked response matching the verified live rewrite).
- [x] Browser checks: landing/auth/demo Content/Planner at 1280, 390 and 360px; fixture Settings/Content/Free Planner at desktop; no page errors. Latest preview build log clean. Dedicated manual production build/typecheck not run (managed build workflow).
- [x] Owner access: read-only verification of the explicitly supplied existing account confirmed verified email, admin role and active no-expiry complimentary grant; no bootstrap or account mutation
- [x] Signup blocker: supported configuration enabled ordinary signup and leaked-password protection; readback confirms signup enabled, email sign-in enabled, verification required and anonymous signup disabled. HIBP accepted by configuration tool, not exposed in public readback. Actual signup form no longer returns signup_disabled; reserved-domain fixture rejected by Cloud, no account/email created. Signed-out demo still accessible.
- [ ] Completed signup/confirmation verification: blocked pending an authorized deliverable test inbox; Cloud prohibits reserved-domain addresses. No bypass or real-user emails.
- [ ] Billing launch: blocked pending final USD price, Paid allowances and later explicitly approved provider setup; no checkout or credentials configured
- [ ] Aggregate upload storage policy/enforcement: pending owner policy decision before launch; per-file audio 25 MB/image 20 MB enforced

- [x] Rename LOUDIO to Chaos To Content
- [x] Reframe visible recording language as Brain Dumps
- [x] Replace yellow with pastel cyan through the shared palette
- [x] Replace microphone-first branding with a busy-brain visual system
- [x] Replace orange accents with pastel electric yellow
- [x] Remove placeholder testimonials
- [x] Refresh public typography and opening message
- [x] Verify public landing page at desktop and mobile sizes
- [x] Refined Logo component: scribble-to-card mark, "Chaos to Content" + "by Amanda Rae", full/compact/inverse variants
- [x] Matching SVG favicon derived from the mark
- [x] Consistent branding across landing header/footer, auth, dashboard and demo sidebars (compact variant in workspace)
- [x] Fixed low-contrast yellow text on light backgrounds (auth links, 404)
- [x] Core iteration: buckets + ideas tables, soft delete, ownership triggers (RLS + DB)
- [x] extract-ideas function (grounded, verbatim excerpts only) and extended generate-posts (formats, destinations, my-words/reference, bring-back-my-words)
- [x] Idea Bank page, shared Make Content dialog, Content page with autosave + undoable delete, Planner without legacy project/channel
- [x] Demo Idea Bank with clearly-labeled fictional sample data, local-only
- [x] Authenticated end-to-end checks: dump -> ideas -> save all; dump -> content opens immediately; autosave persists; delete/undo; bucket delete retains records; cross-owner refs rejected; planner without legacy project
- [x] Correctness pass: reference mode offered on all sources with persisted provenance (voice_mode/reference_note/source_snapshot on posts); REFERENCE_RULES on all rewrite paths incl. rawMode; idea-focused generation with parent dump as background; snapshot fallback if source deleted
- [x] Serialized/coalesced autosave in DraftCard with localStorage backup + recovery, unmount flush, rewrites as reviewable suggestions; long-form formats no longer warned against social caption limits
- [x] process-dump: faithful OCR (no invented takeaway), idempotent reprocess via original_notes column, server audio limit aligned to 25 MB
- [x] MakeContentDialog simplified to labelled selectors + optional details; state resets per source
- [x] Verified with isolated fixture account (deleted after): text dump with reference mode -> factual content + provenance; screenshot upload -> OCR + own note kept; speech WAV -> transcribed; pull-out-ideas -> save all; idea -> blog content with no caption limit; autosave Saved state; reload recovery of unsaved edits (server confirmed)
- [x] Previous pending checks completed: rewrite suggestion review/apply UI, live idempotent OCR reprocess, edited idea angle retained in generated-content provenance (wording remains AI-dependent)
- [ ] Voice note recorded in-browser (microphone) untested; only file upload path tested
- [x] Demo Content/Planner sample pages with fictional local-only data and navigation

## Voice, access copy and visual planner refinement
- [x] Single Brand DNA voice with add/remove custom traits in existing array; Settings summarizes voice and links to Brand DNA. Real/demo auto-posting and false password-reset controls removed; display-name saves exclude legacy tone/auto-publish fields.
- [x] Dynamic complimentary feature access/no payment/no expiry separated from remaining/limit creations and media reads, reset and provisional test-allowance note.
- [x] Additive bucket-color migration/backfill under unchanged ownership/allowance controls; optional create/edit color; shared Week (new-visit default), Month and List, user-scoped remembered view, accessible colored title/type/bucket/platform bars, mobile stacked days, month overflow dialog, existing-content day chooser, local-noon date writes.
- [x] Isolated persistence checks: custom traits and samples reload, bucket name/color reload and invalid palette rejection. Shared actual create/rewrite system-prompt helper tested for custom traits/samples/source wording/reference rules; no live AI/provider call in this pass.
- [x] Existing 44 isolated access regressions and draft queue regressions passed; new UX tests passed for week/month range, local date roundtrip, user-scoped view/default, title fallback, and mocked Instagram/TikTok/X Copy/Open (no external posting).
- [x] Browser checks: demo Week/Month/List at 1280/390/360 with seven week days and no horizontal overflow; isolated signed-in custom trait save/reload, dynamic complimentary text, month +2 overflow exposes all five fixtures, day chooser persists date, bucket color/name edit/reload, event opens editor. Zero page errors; all fixture accounts/data cleaned up. Landing/auth desktop screenshots captured.
- [x] Managed production build/typecheck latest log is clean. No manual build/typecheck run (project harness performs both). No auth/billing/publishing/dependency changes; owner content untouched except additive requested bucket-color backfill.
- [ ] Live provider output quality with new custom traits not re-tested; actual shared prompt construction verified without spending AI allowance. Live microphone remains untested as before.

### Exact files changed in this refinement
- `AGENTS.md`, `roadmap.md`
- `src/pages/dashboard/Settings.tsx`, `src/demo/pages/Settings.tsx`, `src/pages/dashboard/BrandDNA.tsx`
- `src/components/PlanAccessSection.tsx`, `src/components/MakeContentDialog.tsx`, `src/components/BucketChips.tsx`, `src/components/AddToPlannerDialog.tsx`, `src/components/PlannerBoard.tsx`
- `src/pages/dashboard/Calendar.tsx`, `src/demo/pages/Calendar.tsx`
- `src/lib/voice.ts`, `src/lib/planner.ts`, `src/lib/buckets.ts`, `src/index.css`
- `supabase/functions/generate-posts/index.ts`, `supabase/functions/_shared/voice.ts`
- `drizzle/migrations/0006_persist_bucket_palette.sql`, tool-maintained migration metadata and regenerated `src/integrations/supabase/types.ts`
- `tests/ux.test.ts`
- Latest observed managed commit checkpoint: `ee719a3` (`Changes`); commits are managed by the platform, not manually created here.

## Planner follow-up: coherent selection and tablet breakpoint
- [x] Prev/Next moves the selected day into the new period (same weekday ±7 days in Week; same day-of-month with clamping in Month), so the selected-day panel never shows an off-screen date. Switching Week/Month/List anchors the calendar to the selected day; Today still resets both.
- [x] Compact 7-column mini-bar layout now applies below 1024px (matching the desktop grid's lg breakpoint) via a local planner media query, so 768-1023px tablets no longer get giant stacked days. The shared 768px sidebar hook is unchanged.
- [x] Modest mobile spacing reduction in real and demo Planner (page padding, header and legend margins, board section spacing); type sizes and touch targets unchanged.
- [x] Browser checks at 360/390/820/1280 on the demo planner: tap day → next/prev month keeps panel in the new month (Oct 5 → Nov 5), Month→Week anchors to the selected day, next week moves selection +7 days, zero horizontal overflow at all widths, 7-column grid with mini bars at 820 and 360, zero stacked day sections. Latest build log entry is clean.
- Files changed: `src/components/PlannerBoard.tsx`, `src/pages/dashboard/Calendar.tsx`, `src/demo/pages/Calendar.tsx`.

## First-time user walkthrough (Oct 22)
- [x] Live site checked: published bundle still lacks signup-verification, "Set or reset password" and /reset-password code — owner must Publish > Update.
- [x] Preview walk at 390/1280 of landing, sign-in, sign-up, reset, and all demo pages: no overflow, no page errors.
- [x] Fixed clipped "Total transformation" heading on phones.
- [ ] Real signup email, password reset and live signed-in new-user journey unverified (no isolated inbox or test account; no emails sent).
- [ ] Paid checkout not implemented; only Free and complimentary access exist.
