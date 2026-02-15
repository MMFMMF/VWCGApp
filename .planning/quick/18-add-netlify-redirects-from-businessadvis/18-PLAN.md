---
phase: quick-18
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - netlify.toml
autonomous: true

must_haves:
  truths:
    - "Requests to businessadvisors.app/* redirect 301 to vwcg.app/*"
    - "Requests to *.businessadvisors.app/* redirect 301 to vwcg.app/*"
    - "Existing redirects and headers remain unchanged"
    - "Build passes clean"
  artifacts:
    - path: "netlify.toml"
      provides: "Domain-level 301 redirects from businessadvisors.app to vwcg.app"
      contains: "businessadvisors.app"
  key_links: []
---

<objective>
Add two Netlify redirect rules to netlify.toml that 301-redirect all traffic from businessadvisors.app (and subdomains) to vwcg.app, preserving the path via :splat.

Purpose: Domain migration — redirect old domain to new domain.
Output: Updated netlify.toml with 2 new redirect blocks.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: Add domain redirects to netlify.toml</name>
  <files>netlify.toml</files>
  <action>
    Append two redirect blocks to the end of netlify.toml:

    ```toml
    # Domain redirect: businessadvisors.app → vwcg.app
    [[redirects]]
      from = "https://businessadvisors.app/*"
      to = "https://vwcg.app/:splat"
      status = 301
      force = true

    [[redirects]]
      from = "https://*.businessadvisors.app/*"
      to = "https://vwcg.app/:splat"
      status = 301
      force = true
    ```

    **Critical constraints:**
    - Do NOT modify any existing redirect or header blocks
    - Do NOT modify the [build] section
    - Append after the last existing [[redirects]] block
  </action>
  <verify>
    1. Run `npm run build` to confirm build passes
    2. Confirm both new redirect blocks exist in netlify.toml
    3. Confirm all existing content is unchanged
  </verify>
  <done>
    - netlify.toml contains 2 new domain redirect blocks
    - All existing redirects and headers preserved
    - Build passes
  </done>
</task>

</tasks>

<success_criteria>
1. Build succeeds (`npm run build` exits 0)
2. Two new [[redirects]] blocks with businessadvisors.app → vwcg.app
3. Both use status 301 and force = true
4. All existing netlify.toml content unchanged
</success_criteria>
