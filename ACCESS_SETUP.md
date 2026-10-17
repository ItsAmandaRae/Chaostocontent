# Portable app access setup

## Implemented foundation
- App access is independent of the Lovable builder subscription. Database migrations and edge-function sources can be deployed on another compatible PostgreSQL/auth/function host. Cancelling builder billing does **not** guarantee continued hosting, storage or AI service; arrange hosting and provider funding before relying on cancellation.
- Server `plan_config`: Free 5 creations + 5 successful media reads per UTC calendar month; 3 custom buckets. Paid includes planner and unlimited bucket count. Paid's 100 creations/100 reads are **internal provisional development/complimentary limits**, not published sales promises. Final Paid allowances and USD price: **pending**.
- Successful extraction (up to 5 ideas), one generated content item or rewrite suggestion costs one creation. Source OCR/transcription costs one media read, not an extra creation. Failed operations release reservations. Completed reads do not call AI again. Text/link preparation is deterministic.
- Usage reservations lock per user, include request UUID + payload hash, cache completed results and reject concurrent/duplicate active requests. Stale reservations expire after 10 minutes, cannot finalize afterwards, and do not occupy the next month. New attempts require new UUIDs. AI requests are time-bounded. Usage results persist for retry recovery; retention policy is a pre-launch item.
- Verified billing entitlements and complimentary grants are separate, protected records. Billing `active` requires a future `valid_until`; only a privileged verified webhook implementation may write it. No payment integration or checkout is enabled.
- Free retains all existing work and buckets after downgrade. Adding/moving personal planner dates requires Paid; viewing/editing/copying/removing remains available. The planner preview uses fictional local-only data.
- Audio per-file 25 MB, images 20 MB are enforced in private storage and source preparation. **Aggregate upload storage is not enforced**: define/enforce aggregate storage policy before launch. No unlimited storage claim.

## Owner access — verified existing assignment
Read-only verification on 2026-10-17 confirmed the explicitly identified owner account has verified email, an admin role and an active no-expiry complimentary grant. No role or grant was created or changed during this check. Do not bootstrap this owner again.

For a future independently verified owner only, use their exact auth user UUID in a privileged database session; never infer ownership from email, first signup or metadata:

```sql
-- Replace VERIFIED_AUTH_USER_UUID only after identity confirmation.
insert into public.user_roles(user_id, role)
select id, 'admin'::public.app_role from auth.users
where id = 'VERIFIED_AUTH_USER_UUID'::uuid
on conflict (user_id, role) do nothing;
```

Admin UI: `/dashboard/access`, also linked in Settings for an authorized admin. Exact email/user-ID lookup is protected server-side. Grants support 30 days, explicit future expiry or no expiry; revocation preserves billing/data. Active billing requires acknowledgement that a gift does not cancel it. Audit records include actor/recipient/time. Never expose the account directory publicly.

## Signup blocker — corrected on 2026-10-17
Before: hosted settings confirmed `disable_signup=true`, email provider enabled, email auto-confirm disabled (verification required), anonymous users disabled. The owner supplied today's UI evidence that leaked-password protection was disabled and explicitly authorized enabling it.

The supported Auth configuration tool accepted `disable_signup=false` and `password_hibp_enabled=true`, preserving `auto_confirm_email=false` and `external_anonymous_users_enabled=false`; unrelated optional settings were omitted. No upgrade or restriction was reported. Hosted readback confirms ordinary signup enabled, email provider enabled, email verification required and anonymous users disabled. HIBP is not exposed by the public settings endpoint: its enablement is confirmed by the successful configuration response, not independent readback.

The actual signed-out signup form submitted an isolated random address under reserved `example.com`. Cloud rejected it as a prohibited placeholder/reserved domain (HTTP 400), no longer `signup_disabled`. No account persisted and no email was sent to a real user. Completed signup and confirmation remain unverified without an authorized deliverable test inbox; do not bypass the domain restriction or email verification. Signed-out `/demo` remains accessible. Run `bun --env-file=.env tests/authSettings.test.ts` for the four publicly readable setting rules.

## Later billing boundary — not activated
1. Owner app access is verified; confirm final USD monthly price and Paid AI/media allowances.
2. Revisit payment-provider setup in an interactive editor; built-in payments are the recommended supported option. The requested own-account Stripe connection is not configured here; confirm that choice and portability requirements before proceeding.
3. If proceeding with own-account credentials, use a secure settings form for sandbox/restricted credentials; never paste secrets into source or chat. No placeholder secrets exist.
4. Implement signed, idempotent webhook subscription sync into `billing_entitlements`; derive access from verified server events, never checkout success URLs or client emails. Handle cancellation, expiry, payment failure and reconciliation.
5. Implement/test sandbox checkout + portal, gifting alongside paid subscription, webhook retries and downgrade preservation.
6. Arrange hosting/AI funding independently of builder subscription, enforce aggregate storage, complete the remaining verification noted in roadmap, then deliberately choose live launch.

## Regression checks
Run `bun run test:access` for isolated fixture direct-call, concurrency, month-reset and downgrade tests. Requires server credentials available in the sandbox; never logs tokens. It creates/deletes only explicitly isolated fixture accounts and records. Browser review and live AI fixture checks are tracked separately in roadmap.

Run `bun run test:drafts` for shared serialized write queues, coalescing, navigation/remount, review-suggestion apply, failure recovery and user-scoped backups.

### Verification completed in this pass
- 44 access regression assertions passed, including atomic creation/media limits, refunds, duplicate request and finalization, UTC/leap-month reset, denied forged state, admin authorization, gifting with active billing and downgrade preservation.
- Live isolated fixtures verified fictional screenshot OCR, completed-read retry without another charge, edited idea angle in stored generation focus/provenance, and reference rewrite without overwriting saved content.
- Browser verified rapid edit → navigate → return persistence and suggestion application; suggestion-panel UI used a mocked response matching the live-verified rewrite. Public/auth/demo reviewed at 1280/390/360px; fixture Settings/Content/Free Planner reviewed at desktop with no page errors. Fixtures and uploaded file were removed; existing users were untouched.
- Managed preview build log is clean. Separate manually invoked production build/typecheck is not claimed. Live microphone recording and admin grant-screen click-through remain unverified; admin endpoint/database flows are tested. Owner access and signup settings are verified; completed signup/confirmation requires an authorized deliverable test inbox. Final price/allowances, provider integration and aggregate storage enforcement remain pending.