# Architecture rules

- Keep app entitlements independent of builder billing; `plan_config` and `access_for` are the central trusted configuration and resolution boundary.
- Enforce AI allowances through service-only atomic `reserve_ai`/`finish_ai`, with authenticated ownership validation first; never expose these privileged calls to client roles.
- Every live provider call must be covered by an operation reservation; text/link metadata is deterministic to avoid unmetered AI processing.
- Store verified billing, protected admin roles and complimentary grants separately; client state never grants access or changes billing.
- Enforce bucket counts and personal planner-date access with database triggers, preserving existing data and date removal after downgrade.
- Source preparation and content creation have separate allowances; snapshots preserve provenance and every rewrite is reviewable.
- Share editor write queues across mounts keyed by authenticated user and post, so navigation cannot create parallel stale saves; recover pending work from a matching user-scoped local backup.
- Keep brand voice prompt construction shared between create and rewrite; Brand DNA is the single persistent voice source.
- Share planner rendering and local-date helpers between real and fictional demo views; bucket palette keys persist under existing ownership policies, and view preferences are user-scoped.
