# Populate the demo account by hand, fixing bugs found along the way

The dashboard screens exist but have only ever been exercised with data inserted directly into the database. The demo account currently has 4 recordings and nothing else: no profile, no connected channels, no scheduled posts. So Channels, Calendar, Settings and Analytics have never actually been driven through their own UI.

## Goal

Drive the real app in a browser as the demo user and build up the full demo state through the interface itself — no direct database seeding — treating every failure found on the way as a bug to fix.

## What gets done

1. **Fresh demo account**
   - Create a new demo user (email + password) and sign in through the real `/auth` sign-in form.
   - Confirm the redirect into `/dashboard` works for a brand-new user with zero data (empty states on every screen).

2. **Walk each screen and populate it by hand**
   - **Settings** — set display name, pick a default tone, toggle auto-publish. Verifies profile row creation on first save.
   - **Channels** — connect X, LinkedIn, and one more platform with handles; mark one as default.
   - **Recordings** — create recordings and move them through draft → processing → ready → published states so filters, search and sorting have something real to act on.
   - **Calendar** — schedule posts on several dates, including some in the past (published) and some upcoming, then check both month and list views.
   - **Analytics** — confirm the stats grid, the recordings-over-time chart and the activity feed reflect what was entered.
   - **Home** — confirm summary stats and recent projects match.

3. **Fix bugs as they surface**
   Any error, broken empty state, failed write, or wrong number found during the walkthrough gets fixed immediately, then the step is re-run to confirm. Likely candidates, based on the fact these paths have never been used with real input:
   - Screens with no "create" affordance at all (Recordings and Calendar may only read data) — a create/schedule action will be added where it's missing, since otherwise the state cannot be built by hand.
   - Missing profile row on first Settings load.
   - Empty-state rendering on charts and calendar grids with zero rows.

4. **Report**
   - Final credentials for the demo account.
   - A list of every bug found and how it was fixed.

## Technical notes

- Browser automation (Playwright against the local dev server) does the clicking, so each step is verified against real rendered UI, not assumed.
- Email confirmation is temporarily auto-confirmed for the signup, then reverted, exactly as done for the previous demo account.
- No seed SQL: every row must arrive through the app's own mutations. Reads against the database are only used to verify what the UI wrote.
- The old `demo@preview.app` account and its 4 projects are left untouched unless you'd rather they be removed.
