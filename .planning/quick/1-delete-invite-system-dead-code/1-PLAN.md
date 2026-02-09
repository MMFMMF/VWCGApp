---
phase: quick-1
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/auth/InviteGate.tsx
  - src/lib/auth/inviteCode.ts
  - src/stores/authStore.ts
  - src/pages/invite.astro
  - CLAUDE.md
autonomous: true

must_haves:
  truths:
    - "Invite system files are deleted from codebase"
    - "CLAUDE.md no longer documents invite system"
    - "Build passes without import errors"
    - "No orphaned imports remain"
  artifacts:
    - path: "CLAUDE.md"
      provides: "Updated project documentation"
      contains: "No references to InviteGate or authStore"
  key_links:
    - from: "codebase"
      to: "deleted auth files"
      via: "no imports exist"
      pattern: "authStore|InviteGate|inviteCode"
---

<objective>
Delete the entire invite system which is now dead code after InviteGate was removed from /app in commit ee8fade.

Purpose: Clean up unused authentication code that's no longer part of the application flow.
Output: Four files deleted, CLAUDE.md updated, build verified clean.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
The invite gate was removed from the app in a previous commit. These files are now orphaned:
- `src/components/auth/InviteGate.tsx` — authentication UI wrapper (unused)
- `src/lib/auth/inviteCode.ts` — invite code validation logic (unused)
- `src/stores/authStore.ts` — sessionStorage auth state (unused)
- `src/pages/invite.astro` — invite code entry page (orphan route)

Grep confirms only InviteGate.tsx imports authStore and inviteCode — no other files reference these modules.

CLAUDE.md currently documents the invite system in:
- Line 43: "components/auth/" directory description
- Lines 47-49: "Authentication" section describing InviteGate flow
- Line 81: authStore in Zustand stores list
- Lines 91-95: Browser storage keys table (vwcg-auth entry)
</context>

<tasks>

<task type="auto">
  <name>Delete invite system files</name>
  <files>
    src/components/auth/InviteGate.tsx
    src/lib/auth/inviteCode.ts
    src/stores/authStore.ts
    src/pages/invite.astro
  </files>
  <action>
    Delete all four invite system files using git rm to ensure clean removal:

    ```bash
    git rm src/components/auth/InviteGate.tsx
    git rm src/lib/auth/inviteCode.ts
    git rm src/stores/authStore.ts
    git rm src/pages/invite.astro
    ```

    Check if src/components/auth/ directory is now empty, and if so, remove it:
    ```bash
    rmdir src/components/auth 2>/dev/null || true
    ```

    Check if src/lib/auth/ directory is now empty, and if so, remove it:
    ```bash
    rmdir src/lib/auth 2>/dev/null || true
    ```
  </action>
  <verify>
    ```bash
    # Verify files are deleted
    ls src/components/auth/InviteGate.tsx 2>&1 | grep "No such file"
    ls src/lib/auth/inviteCode.ts 2>&1 | grep "No such file"
    ls src/stores/authStore.ts 2>&1 | grep "No such file"
    ls src/pages/invite.astro 2>&1 | grep "No such file"

    # Verify no imports remain
    grep -r "authStore\|InviteGate\|inviteCode" src/ --include="*.ts" --include="*.tsx" --include="*.astro" || echo "No imports found (clean)"
    ```
  </verify>
  <done>All four files deleted, empty auth directories removed, no remaining imports in codebase</done>
</task>

<task type="auto">
  <name>Update CLAUDE.md documentation</name>
  <files>CLAUDE.md</files>
  <action>
    Remove all invite system documentation from CLAUDE.md:

    1. **Line 43** — Remove `components/auth/` row from Component Directory Structure table

    2. **Lines 47-49** — Delete entire "Authentication" section (3 lines total):
       ```
       ### Authentication

       The app is gated behind `InviteGate` (`src/components/auth/InviteGate.tsx`), which requires a valid invite code. The `/invite` page handles code entry; authenticated users are redirected to `/app`. Auth state lives in `authStore` (sessionStorage, 24-hour expiry). All storage access is SSR-safe (no-ops during server rendering).
       ```

    3. **Line 81** — In State Management section, remove authStore bullet and update count:
       - Change "Three stores with strict separation:" to "Two stores with strict separation:"
       - Delete "- **`authStore.ts`** — Persisted to sessionStorage (`vwcg-auth`). Holds invite-code authentication state with 24-hour session expiry."

    4. **Lines 91-95** — In Browser Storage Keys table, remove `vwcg-auth` row:
       ```
       | `vwcg-auth` | sessionStorage | `authStore` | Invite code + session expiry |
       ```

    After changes, the Storage Keys table should only have 2 rows (vwcg-workspace and vwcg-teaser-answers).
  </action>
  <verify>
    ```bash
    # Verify no invite system references remain
    grep -i "invitegate\|authstore\|invite code\|vwcg-auth" CLAUDE.md && echo "ERROR: References still exist" || echo "CLEAN: No references found"

    # Verify structure is valid
    grep "stores with strict separation" CLAUDE.md | grep "Two"
    ```
  </verify>
  <done>CLAUDE.md updated with invite system documentation removed, store count corrected to "Two stores"</done>
</task>

<task type="auto">
  <name>Verify build passes</name>
  <files>None (verification only)</files>
  <action>
    Run production build to verify no broken imports or missing modules:

    ```bash
    npm run build
    ```

    Build must complete successfully without errors related to authStore, InviteGate, or inviteCode imports.
  </action>
  <verify>
    ```bash
    # Build should complete with exit code 0
    npm run build 2>&1 | tee build-verify.log
    echo "Exit code: $?"

    # Check for any auth-related errors in output
    grep -i "authStore\|InviteGate\|inviteCode" build-verify.log && echo "ERROR: Auth references in build output" || echo "CLEAN: No auth references"
    ```
  </verify>
  <done>Production build completes successfully with no import errors or references to deleted auth files</done>
</task>

</tasks>

<verification>
1. All four invite system files are deleted
2. Empty auth directories removed
3. No imports of authStore, InviteGate, or inviteCode remain in codebase
4. CLAUDE.md updated to remove all invite system documentation
5. Store count changed from "Three stores" to "Two stores"
6. Build completes successfully with no errors
</verification>

<success_criteria>
- [ ] `src/components/auth/InviteGate.tsx` deleted
- [ ] `src/lib/auth/inviteCode.ts` deleted
- [ ] `src/stores/authStore.ts` deleted
- [ ] `src/pages/invite.astro` deleted
- [ ] `grep -r "authStore\|InviteGate\|inviteCode" src/` returns no results
- [ ] CLAUDE.md contains "Two stores with strict separation" (not "Three")
- [ ] CLAUDE.md has no references to InviteGate or authStore
- [ ] `npm run build` exits with code 0
- [ ] Build output contains no auth-related import errors
</success_criteria>

<output>
After completion, create `.planning/quick/1-delete-invite-system-dead-code/1-SUMMARY.md`
</output>
