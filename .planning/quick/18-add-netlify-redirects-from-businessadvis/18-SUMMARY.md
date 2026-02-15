# Quick Task 18 Summary

## Task
Add Netlify redirects from businessadvisors.app to vwcg.app

## Changes
- **netlify.toml**: Added 2 redirect blocks at end of file
  - `https://businessadvisors.app/*` → `https://vwcg.app/:splat` (301, force)
  - `https://*.businessadvisors.app/*` → `https://vwcg.app/:splat` (301, force)

## Verification
- Build passes clean (tsc + astro build, 17 pages)
- All existing redirects and headers unchanged
- Both new redirect blocks use status 301 and force = true
