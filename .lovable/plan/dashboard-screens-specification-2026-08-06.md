# Dashboard Screens Specification

## Goal
Define and build the remaining dashboard screens so the sidebar navigation is fully functional and each screen serves a clear purpose in the creator workflow.

## Current State
- Only `/dashboard` exists. It shows a stats grid + recent projects table.
- The sidebar links to five sections plus Settings; all except Home are unbuilt and currently hit the 404 catch-all.
- The product is an AI-powered audio-to-content engine: users record audio, get clean transcripts, and generate posts (especially for X/Twitter).
- Existing data model: a single `projects` table with `title`, `status` (draft/processing/ready/published), and timestamps.

## Proposed Screen Inventory

### 1. Recordings (`/dashboard/recordings`)
**Purpose:** Full library of every audio recording/project. This is the main content workspace.

**Layout:**
- Page title: "Recordings".
- Primary CTA: "Record New" (opens browser audio recorder or upload modal).
- Filter bar: status tabs (All / Draft / Processing / Ready / Published) + search input.
- Sort dropdown: Last modified, Newest, Title A-Z.
- Reuse the `ProjectsTable` component but with filtering and pagination/infinite scroll.
- Empty state: illustration + "Record your first thought" CTA.

**Data & Behavior:**
- Reads from `projects` table scoped to the current user.
- Each row can be renamed, duplicated, or deleted (existing actions).
- Clicking a row opens a recording detail sheet/modal (future enhancement) or begins editing.

### 2. Channels (`/dashboard/channels`)
**Purpose:** Manage destinations where generated posts are published.

**Layout:**
- Page title: "Channels".
- Grid of channel cards: X/Twitter, LinkedIn, Threads, Newsletter, Blog, etc.
- Each card shows platform icon, name, connection status, and "Connect" / "Disconnect" action.
- A "Default Channel" toggle per connected channel.

**Data & Behavior:**
- Requires a new `channels` table: `id`, `user_id`, `platform` (enum), `handle`, `is_default`, `connected_at`, `updated_at`.
- RLS so users only see their own channels.
- For now, connections can be simulated (toggle + handle input) with real OAuth integration as a later phase.
- Used by the publish flow to pre-select destinations.

### 3. Calendar (`/dashboard/calendar`)
**Purpose:** View and manage the publishing schedule for posts derived from recordings.

**Layout:**
- Page title: "Content Calendar".
- View switcher: Month / Week / List.
- Calendar grid with colored dots for scheduled/published posts.
- Side panel or modal showing posts on the selected day.
- "Schedule Post" button for manually queueing content.

**Data & Behavior:**
- Requires a new `posts` table linked to `projects`: `id`, `project_id`, `user_id`, `content`, `channel_id`, `status` (scheduled/published/draft), `scheduled_at`, `published_at`, `created_at`, `updated_at`.
- RLS scoped to the user.
- Initially seed with sample scheduled posts for the demo account.
- Clicking a calendar item opens the post editor (read-only or draft editing).

### 4. Analytics (`/dashboard/analytics`)
**Purpose:** Surface activity metrics and trends for recordings and publishing.

**Layout:**
- Page title: "Analytics".
- Stat cards (same neo-brutalist style as home): Total Recordings, Total Posts, Published This Month, Avg. Recording Length.
- Simple bar chart or line chart for recordings created over the last 30 days.
- A "Recent Activity" feed list: created, published, edited events.
- Date range selector: 7 days / 30 days / 90 days / All time.

**Data & Behavior:**
- Aggregates from `projects` and `posts` tables.
- For the first pass, use derived metrics from existing rows (no external analytics APIs).
- Empty state for users with no activity.

### 5. Settings (`/dashboard/settings`)
**Purpose:** Account and application preferences.

**Layout:**
- Page title: "Settings".
- Tabs or vertical sections:
  - **Profile:** Display name, avatar, email (read-only from auth), default posting channel.
  - **Account:** Change password, delete account.
  - **Preferences:** Default post length, tone (professional/casual/witty), auto-publish toggle.
  - **Billing:** Plan name, usage quota, upgrade button (placeholder until payments are wired).

**Data & Behavior:**
- Requires a new `profiles` table extension or uses existing auth metadata plus a `profiles` table: `id`, `user_id`, `display_name`, `avatar_url`, `default_tone`, `auto_publish`, `created_at`, `updated_at`.
- RLS scoped to the user.
- Updates write back to the backend; toast confirmations via `sonner`.

## Routing & Navigation Changes
- Add nested routes in `App.tsx`:
  - `/dashboard` → Dashboard Home
  - `/dashboard/recordings` → Recordings
  - `/dashboard/channels` → Channels
  - `/dashboard/calendar` → Calendar
  - `/dashboard/analytics` → Analytics
  - `/dashboard/settings` → Settings
- Replace the flat `Dashboard.tsx` page with a layout component (`DashboardLayout`) that renders the sidebar and an `<Outlet>` for the nested screen content.
- Keep `DashboardSidebar.tsx` active-state logic; it already supports `pathname.startsWith(path)`.

## Database Additions Required
1. `projects` table — already exists, add RLS if missing.
2. `channels` table — new.
3. `posts` table — new.
4. `profiles` table — new (or extend auth metadata).

Each new table needs:
- `CREATE TABLE`
- `GRANT SELECT, INSERT, UPDATE, DELETE ... TO authenticated`
- `GRANT ALL ... TO service_role`
- `ENABLE ROW LEVEL SECURITY`
- Policies scoped to `auth.uid()`.

## Build Order
1. **Settings** — lowest risk, teaches the layout/outlet pattern and profile table.
2. **Recordings** — reuses existing `ProjectsTable`, adds filtering and routing.
3. **Channels** — introduces the `channels` table and connection UX.
4. **Calendar** — introduces the `posts` table and scheduling concept.
5. **Analytics** — aggregates data from the above tables.

## Design Constraints
- Keep the existing neo-brutalist style: 1px black borders, hard shadows, OKLCH tokens, no rounded corners except buttons/pills.
- Use Google Sans Flex for headings, Inter for body text.
- Mobile: reuse the existing sheet/drawer and responsive stat cards.
- Use `sonner` for all toast notifications.

## Out of Scope (for this plan)
- Real audio recording/upload pipeline.
- Real OAuth integrations (X, LinkedIn).
- Real external analytics APIs.
- Payment/billing integration.
- These can be wired later once the screens and data model exist.
