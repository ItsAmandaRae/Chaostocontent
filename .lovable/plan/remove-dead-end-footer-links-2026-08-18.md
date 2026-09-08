# Remove dead-end footer links

## Goal
Replace every footer link that currently points nowhere (`href="#"`) with either a real in-page anchor or remove it, so users never hit a dead link.

## Current state
- `Footer.tsx` lists three columns of links: **Product**, **Company**, **Legal**.
- Every link uses `href="#"`.
- Real routes in `App.tsx` are `/`, `/auth`, and `/dashboard/*` only.
- Landing sections with usable IDs: `#features` (BentoGrid) and `#pricing` (Pricing). FAQ has no `id` yet.

## Changes

1. **Make FAQ anchorable**
   - Add `id="faq"` to the root `<section>` in `src/components/sections/FAQ.tsx`.

2. **Rewrite footer link map in `src/components/sections/Footer.tsx`**
   - **Product**: keep only links that map to real sections.
     - Features → `#features`
     - Pricing → `#pricing`
     - FAQ → `#faq`
     - Remove "API" and "Showcase".
   - **Company**: remove the entire column (About, Blog, Careers, Contact have no pages).
   - **Legal**: remove the entire column (Privacy, Terms have no pages).

3. **Render remaining links as real anchors**
   - Use `<a href={href}>` for external/hash links.
   - Keep the existing hover/opacity styling.
   - Ensure the grid layout still looks balanced with only one link column remaining. If a single column looks too sparse on desktop, center the links block or reduce the grid to one column with a sensible max-width.

## Out of scope
- Creating new pages (About, Blog, Careers, Contact, Privacy, Terms, API, Showcase). The request is to only link pages that exist.
- Changing the social icons (they are not links).

## Verification
- Build passes.
- Footer renders only Features, Pricing, FAQ.
- Clicking each scrolls to the corresponding section.
- No `href="#"` remains in the footer.