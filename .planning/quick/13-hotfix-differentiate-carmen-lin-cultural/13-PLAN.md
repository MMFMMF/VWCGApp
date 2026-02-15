# Quick Task #13 Plan: Hotfix Carmen/Lin Cultural Narrative

## Problem
Carmen (Construction, $48M, 475 employees) and Lin (Manufacturing, $38M, 210 employees) get identical cultural readiness narrative because both match the `/industrial|manufactur|construct/` regex and produce the same industry suffix.

Quick Task #12 added data-point injection (SWOT + leadership scores) but the first 3 sentences remain identical:
1. Same tier+context base template
2. Same "industrial environment" industry suffix
3. Only appended data points differ

## Fix (1 task)

### Task 1: Enhance cultural narrative differentiation in AdvisorReadinessReport.tsx

**1a. Split "industrial" regex into sub-categories:**
- Construction/mining/logistics → construction-specific language (safety, field/office divide, retention)
- Manufacturing/supply → manufacturing-specific language (quality, cross-functional, knowledge transfer)

**1b. Enrich persona-specific data injection:**
- Pull from SWOT strengths too (not just weaknesses) — surfaces unique capabilities
- Broaden weakness keyword matching to catch more culture signals
- Use company name + specific SWOT quotes for unique phrasing

## Verify
- Carmen and Lin share NO identical sentences
- Spot-check other persona pairs in same industry tier
- Build clean, regenerate all 80 PDFs
