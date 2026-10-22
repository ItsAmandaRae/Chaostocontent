# Architecture rules

- Keep app entitlements independent of builder billing; `plan_config` and `access_for` are the central trusted configuration and resolution boundary.
- Enforce AI allowances through service-only atomic `reserve_ai`/`finish_ai`, with authenticated ownership validation first; never expose these privileged calls to client roles.
- Every live provider call must be covered by an operation reservation; text/link metadata is deterministic to avoid unmetered AI processing.
- Store verified billing, protected admin roles and complimentary grants separately; client state never grants access or changes billing.
- Enforce bucket counts and personal planner-date access with database triggers, preserving existing data and date removal after downgrade.
- Source preparation and content creation have separate allowances; snapshots preserve provenance and every rewrite is reviewable.
- Share editor write queues across mounts keyed by authenticated user and post, so navigation cannot create parallel stale saves; recover pending work from a matching user-scoped local backup.
- Keep brand voice prompt construction shared between create and rewrite; Brand DNA is the single persistent voice source.
- Let the auth SDK alone consume recovery callbacks; register recovery handling before redirects and require a validated, session-scoped recovery marker for password changes, so normal sessions and URL intent cannot authorize the recovery form.
- Classify signup confirmation separately from recovery before auth redirects; validate confirmation through the auth server and keep no-session signup guidance with user-initiated, guarded resend, so email intent never implies a session or delivery.
- Explicit departures from auth callbacks invalidate pending validations and clear callback UI state; ordinary sign-in clears recovery markers, so stale callbacks cannot trap navigation or confer reset permission.
- Share planner rendering and local-date helpers between real and fictional demo views; bucket palette keys persist under existing ownership policies, and view preferences are user-scoped.
- Planner supplies all content to every view and chooser; bucket legends are non-interactive, with management separate from Ideas/Content filtering.
- Mobile planner renders a compact seven-column month grid and week strip with bucket-colored mini bars; tapping selects a day and a single shared selected-day panel (owned by PlannerBoard, never duplicated by pages) lists all its records with the add-content action.
- Preset bucket defaults are assigned unused-first under the existing user advisory lock; expanding the palette never rewrites existing assignments.
- Platform reuse uses an owner-scoped security-invoker transaction after a failure-signalling queue flush, verifies expected saved wording and uses a retry-stable copy UUID; neither action touches AI reservations or usage.
