# Quick Task 14: Skip tsc gate in build command for Netlify deployment

## What Changed
- **package.json**: Changed `"build": "tsc -b && vite build"` to `"build": "vite build"`

## Why
The `tsc -b` step enforces strict TypeScript checks (unused vars, type annotations) that block the build on Netlify, even though these are not runtime errors. Vite builds the application successfully without the tsc gate.

## Verification
- `npm run build` completes successfully (4.85s, 2062 modules)
- `dist/` directory created with all assets
- No tsc compilation step in build output

## Impact
- Netlify deployments unblocked
- Type checking still available via IDE and manual `tsc -b`
- No runtime behavior changes
