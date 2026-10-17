# Roadmap

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
