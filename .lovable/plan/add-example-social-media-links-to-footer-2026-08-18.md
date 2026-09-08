# Add example social media links to footer

## Goal
Turn the footer social icons into real, clickable links that point to Lovable's official profiles as example destinations.

## Current state
- `Footer.tsx` renders four social SVG icons (X, LinkedIn, Instagram, Facebook) inside a decorative `div`.
- The icons are not wrapped in `<a>` tags, so they are not clickable and have no destinations.

## Changes

1. **Look up Lovable's official social URLs**
   - LinkedIn company page
   - X (Twitter) profile
   - Instagram profile
   - Facebook page

2. **Wrap each icon in `src/components/sections/Footer.tsx`**
   - Replace the plain `<svg>` wrappers with `<a href="..." target="_blank" rel="noopener noreferrer" aria-label="...">`.
   - Keep the existing SVG markup and styling unchanged.
   - Add descriptive `aria-label` to each link for accessibility.

3. **Verification**
   - Build passes.
   - Screenshot confirms icons remain visually identical.
   - Each icon is a clickable link to the correct external profile.