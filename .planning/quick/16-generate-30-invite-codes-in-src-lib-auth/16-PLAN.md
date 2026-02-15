---
phase: quick-16
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/auth/inviteCode.ts
autonomous: true

must_haves:
  truths:
    - "All 8 existing invite codes remain valid and functional"
    - "30 new unique invite codes exist in VWCG-XXXXX-XXXXX-XXXXX format"
    - "Codes are organized under 6 comment sections"
    - "No other part of the invite gate system is modified"
  artifacts:
    - path: "src/lib/auth/inviteCode.ts"
      provides: "Invite code registry with 38 total codes"
      contains: "VALID_CODES"
  key_links: []
---

<objective>
Add 30 new pre-generated invite codes to the VALID_CODES Set in src/lib/auth/inviteCode.ts, organized by category with comment headers.

Purpose: Provide invite codes for three distribution channels (General Access, PPC Campaigns, Outreach).
Output: Updated inviteCode.ts with 38 total codes (8 existing + 30 new).
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/auth/inviteCode.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Generate 30 invite codes and update inviteCode.ts</name>
  <files>src/lib/auth/inviteCode.ts</files>
  <action>
    Update the VALID_CODES Set in src/lib/auth/inviteCode.ts to organize existing codes under comment headers and add 30 new codes.

    **Step 1: Generate 30 unique codes**

    Use this approach to generate codes in VWCG-XXXXX-XXXXX-XXXXX format:
    - Each segment is 5 characters, uppercase alphanumeric (A-Z, 0-9)
    - Generate 10 codes for each of the 3 new categories
    - All 30 codes must be unique (no duplicates among themselves or existing codes)
    - Codes should look random, not sequential or patterned

    Generate codes by running a quick Node script or use pre-hardcoded random values. The codes are static constants, not runtime-generated.

    **Step 2: Restructure the VALID_CODES Set with comment sections**

    Reorganize the Set contents with these exact comment headers in this order:

    ```
    const VALID_CODES = new Set([
      // DEMO & TESTING
      'VWCG-DEMO-2026',

      // BETA ACCESS
      'VWCG-BETA-001',
      'VWCG-BETA-002',
      'VWCG-BETA-003',

      // PARTNER ACCESS
      'VWCG-PARTNER-001',
      'VWCG-CLIENT-001',
      'VWCG-CLIENT-002',
      'VWCG-VIP-2026',

      // GENERAL ACCESS — Batch 1
      'VWCG-XXXXX-XXXXX-XXXXX',
      ... (10 codes)

      // PPC CAMPAIGN CODES
      'VWCG-XXXXX-XXXXX-XXXXX',
      ... (10 codes)

      // OUTREACH CODES
      'VWCG-XXXXX-XXXXX-XXXXX',
      ... (10 codes)
    ]);
    ```

    **Critical constraints:**
    - Keep ALL 8 existing codes exactly as they are (same format, same values)
    - Do NOT modify the validateInviteCode, generateInviteCode, or formatInviteCode functions
    - Do NOT modify the isDev constant or the top-of-file comments
    - Do NOT change the dev-mode bypass behavior
    - Only the VALID_CODES Set declaration changes
  </action>
  <verify>
    1. Run `npm run build` to confirm TypeScript compiles without errors
    2. Visually confirm the file has exactly 38 entries in the Set (8 existing + 30 new)
    3. Confirm all 30 new codes match the format VWCG-XXXXX-XXXXX-XXXXX (3 segments of 5 chars after prefix)
    4. Confirm all 8 original codes are present and unchanged
    5. Confirm the 6 comment section headers exist in correct order
    6. Confirm no duplicate codes exist (all 38 are unique)
    7. Confirm validateInviteCode, generateInviteCode, and formatInviteCode functions are untouched
  </verify>
  <done>
    - inviteCode.ts contains 38 unique invite codes in the VALID_CODES Set
    - 30 new codes follow VWCG-XXXXX-XXXXX-XXXXX format with uppercase alphanumeric segments
    - Codes organized under 6 comment headers: DEMO & TESTING, BETA ACCESS, PARTNER ACCESS, GENERAL ACCESS — Batch 1, PPC CAMPAIGN CODES, OUTREACH CODES
    - All existing functionality (validation, generation, formatting) unchanged
    - Build passes cleanly
  </done>
</task>

</tasks>

<verification>
- `npm run build` passes with zero errors
- The VALID_CODES Set contains exactly 38 entries
- All 30 new codes are in VWCG-XXXXX-XXXXX-XXXXX format
- All 8 original codes are preserved verbatim
- No changes outside the VALID_CODES Set declaration
</verification>

<success_criteria>
1. Build succeeds (`npm run build` exits 0)
2. 38 unique invite codes in VALID_CODES (8 existing + 30 new)
3. 30 new codes in correct VWCG-XXXXX-XXXXX-XXXXX format
4. 6 comment section headers present and correctly labeled
5. Functions below VALID_CODES are completely untouched
</success_criteria>

<output>
After completion, create `.planning/quick/16-generate-30-invite-codes-in-src-lib-auth/16-SUMMARY.md`
</output>
