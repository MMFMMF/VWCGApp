# Requirements: VWCG Assessment Suite — Report Redesign

**Defined:** 2026-02-13
**Core Value:** Every deliverable passes the "Holy Cow" Standard — a founder reads it and feels like a senior consultant analyzed their business.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Design System

- [ ] **DSGN-01**: Color system implemented: Deep Navy #1B2A4A, Charcoal #2D3436, White #FFFFFF, Warm White #F8F7F4, Strategic Blue #2E6EA6, Alert Amber #D4930D, Risk Red #C0392B, Growth Green #27864A
- [ ] **DSGN-02**: Typography system: Inter or DM Sans with defined type scale (hero 48-64pt, section 24pt, subsection 18pt, body 11-12pt, caption 9-10pt, callout 16pt)
- [ ] **DSGN-03**: Page layout templates: standard content page (1in margins, 6.5in max text width), data page (two-column, charts max 50% height), callout/insight page
- [ ] **DSGN-04**: Chart component library: horizontal bar charts, progress bars with gap visualization, simple gauges, dot plots, small multiples
- [ ] **DSGN-05**: Chart rules enforced: narrative titles stating insight (not metric name), max 3 colors, data labels on elements (not legends), 2-3 sentence interpretation after each chart
- [ ] **DSGN-06**: Anti-patterns eliminated: no radar/spider charts, no pie charts, no 3D, no gradient backgrounds, no rounded-corner cards with drop shadows, no decorative icons

### Data Collection

- [ ] **DATA-01**: User can input annual revenue range (<$1M, $1-3M, $3-8M, $8-15M, $15-30M, $30-50M, $50M+)
- [ ] **DATA-02**: User can select industry from dropdown (Professional Services, Manufacturing, Technology/SaaS, Healthcare, Distribution, Construction, Financial Services, Retail, Other)
- [ ] **DATA-03**: User can input number of employees range (1-5, 6-15, 16-50, 51-100, 101-250, 250+)
- [ ] **DATA-04**: User can input founder's weekly hours range (<40, 40-50, 50-60, 60-70, 70+)
- [ ] **DATA-05**: User can input years in business range (<2, 2-5, 5-10, 10-20, 20+)
- [ ] **DATA-06**: User can select primary growth goal (Revenue growth, Profitability improvement, Market expansion, Operational efficiency, Preparing for exit/succession, Stabilization)

### Synthesis Engine

- [ ] **SYNTH-01**: Execution-Ambition Ratio computed from Leadership Execution + Operational Maturity / (Vision Pillars x 2)
- [ ] **SYNTH-02**: Founder Dependency Index (0-10) computed from Empowerment gap (40%), SWOT bottleneck keywords (30%), Vision score (15%), Roadmap delegation indicators (15%)
- [ ] **SYNTH-03**: Strategic Coherence Score (Aligned / Partially Aligned / Misaligned) from cross-assessment alignment checks
- [ ] **SYNTH-04**: Revenue Risk Estimate (range) from SWOT threats, Founder Dependency Index, workforce risk, Financial Health buffer
- [ ] **SYNTH-05**: Organizational Readiness-for-Change Score (0-100, labeled Resistant/Cautious/Open/Eager) from Cultural Readiness + AI Culture + Adaptability + Empowerment
- [ ] **SYNTH-06**: Leadership Archetype assignment based on DNA score patterns (Visionary Builder, Trusted Operator, Stretched Strategist, Collaborative Explorer, Command Driver, Generalist Leader)
- [ ] **SYNTH-07**: Rule 1 — Vision-Execution Mismatch (>3 pillars + Execution <7 + SWOT capacity keywords)
- [ ] **SYNTH-08**: Rule 2 — Values-Reality Contradiction (balance values + burnout SWOT/70+ hours)
- [ ] **SYNTH-09**: Rule 3 — Technology Ambition Without Readiness (AI vision pillars + AI Readiness <40%)
- [ ] **SYNTH-10**: Rule 4 — Growth Vision Without Strategic Clarity (vague north star + Vision <6)
- [ ] **SYNTH-11**: Rule 5 — Founder Dependency + Succession Risk (FDI >6 + retirement threats + Empowerment gap >2)
- [ ] **SYNTH-12**: Rule 6 — Strong Finances + Weak Strategy (Financial Health >80% + Strategic Alignment <50%)
- [ ] **SYNTH-13**: Rule 7 — High AI Culture + Low Infrastructure (Culture >60% + Infrastructure <30%)
- [ ] **SYNTH-14**: Rule 8 — Execution Gap Dominance (largest gap is Execution + gap >2 + delivery SWOT keywords)
- [ ] **SYNTH-15**: SWOT text analysis with keyword dictionaries for bottleneck, capacity, burnout, retirement, technology terms

### Unified Strategic Briefing

- [ ] **USB-01**: Cover page: VWCG logo, "Strategic Business Assessment", client name, date, tagline, navy background
- [ ] **USB-02**: Executive Snapshot: headline finding (strategic observation, not a score), vital signs dashboard (4-5 metrics with one-line interpretation), three-word descriptors
- [ ] **USB-03**: "Where You're Strong" narrative (~1 page) synthesizing strengths across all assessments with strategic value explanation
- [ ] **USB-04**: "Where You're Exposed" narrative (~1-1.5 pages) connecting weaknesses across assessments, identifying compounding risks, naming business consequences
- [ ] **USB-05**: "The Contradictions" section (~0.5-1 page) identifying cross-assessment contradictions with specific evidence and strategic implications
- [ ] **USB-06**: "What This Is Costing You" financial impact page: 3 impact blocks (Founder Bottleneck Cost, Operational Inefficiency Cost, Strategic Risk Exposure) with dollar estimates and methodology
- [ ] **USB-07**: Benchmarking Context page: dot-plot visualizations for Advisor Readiness, AI Readiness, Leadership DNA, SWOT Risk Profile with stage labels and narrative interpretation
- [ ] **USB-08**: Top 3 Prioritized Recommendations (~2 pages): each with Why This First, What It Looks Like, Estimated Impact, First Step
- [ ] **USB-09**: 90-Day Quick Wins page: 3 time-boxed actions (Week 1-2, Week 3-4, Week 5-8) with specific actions and expected outcomes
- [ ] **USB-10**: "How to Use This Briefing" guidance page with soft advisory engagement bridge
- [ ] **USB-11**: Individual Report Downloads back page with report list and sharing guidance
- [ ] **USB-12**: Conditional content: cost section only when data supports estimates, contradictions section only when >=2 flagged, benchmarking with industry-specific or general SMB data

### Individual Report: Advisor Readiness

- [ ] **ADV-01**: Cover page with report type, client name, date, one-sentence description
- [ ] **ADV-02**: Overall Readiness page: large headline score with stage label (Emerging/Growing/Advancing/Mature), interpretation paragraph, horizontal bar chart with benchmark overlays
- [ ] **ADV-03**: Category Deep Dive: for each of 4 categories — score, stage label, interpretation (2-3 sentences), improvement actions (1-2 specific)
- [ ] **ADV-04**: Readiness Implications table: readiness assessment for common strategic moves (Hiring COO, Pursuing acquisition, New service line, Growth capital, Geographic expansion)

### Individual Report: AI Readiness

- [ ] **AIR-01**: Cover page
- [ ] **AIR-02**: AI Readiness Overview: headline stage (Pre-Digital/Foundational/Developing/Advanced/Leading), adoption curve narrative, horizontal bar chart of 6 dimensions
- [ ] **AIR-03**: Dimension Analysis: for each of 6 dimensions — score, one-line label, business-context interpretation (2-3 sentences), priority level (Critical/Important/Monitor)
- [ ] **AIR-04**: AI Readiness Roadmap: 3-stage path (Months 1-3 Foundation, 4-6 Build, 7-12 Scale) with 2-3 actions per stage based on scores

### Individual Report: Leadership DNA

- [ ] **LDR-01**: Cover page
- [ ] **LDR-02**: Leadership Profile: horizontal gap visualization (current bar + target outline + gap highlight), headline callout for biggest gap, narrative paragraph characterizing profile
- [ ] **LDR-03**: Gap Analysis: for each dimension with gap >1 — current/target/gap values, "What's behind this gap" (2-3 sentences), "What closing this gap unlocks" (1-2 sentences), "One thing this week" micro-step
- [ ] **LDR-04**: Leadership Archetype page: archetype assignment based on score patterns, 2-paragraph description, famous leaders comparison, #1 breakthrough action

### Individual Report: SWOT Analysis

- [ ] **SWOT-01**: Cover page
- [ ] **SWOT-02**: SWOT Summary: 2x2 priority matrix (impact vs. urgency), one-paragraph strategic position summary
- [ ] **SWOT-03**: Strategic Connections: Leverage (S+O), Defend (S+T), Watch (W+T), Invest (W+O) with narrative explanations
- [ ] **SWOT-04**: SWOT Action Items: 3 prioritized actions — highest-leverage S+O, most urgent W+T, one thing to stop doing

### Individual Report: Vision Canvas

- [ ] **VIS-01**: Cover page
- [ ] **VIS-02**: Vision Assessment: north star quoted with Vision Clarity Rating (Clear/Directional/Vague), explanation paragraph, per-pillar feasibility check and alignment check
- [ ] **VIS-03**: Vision Reality Gap: requirements vs. current state table, gap synthesis paragraph
- [ ] **VIS-04**: Core Values Audit: per-value assessment of whether operationalized or aspirational, with evidence from assessment data

### Individual Report: 90-Day Roadmap

- [ ] **RDM-01**: Cover page
- [ ] **RDM-02**: Roadmap Philosophy: paragraph explaining sequencing rationale (fix foundation → build capabilities → launch initiatives)
- [ ] **RDM-03**: Simplified Roadmap: 3-phase layout (Stabilize Weeks 1-4, Build Weeks 5-8, Launch Weeks 9-12), max 6 items total, each with action/why now/owner role/success outcome
- [ ] **RDM-04**: "What's Not on This Roadmap (And Why)": 2-3 deliberately excluded items with strategic rationale

### Narrative Engine

- [ ] **NARR-01**: Narrative generation uses consultant voice: direct, specific, quantified, never generic
- [ ] **NARR-02**: Narratives reference client's own words (SWOT items, vision statements, values) for personalization
- [ ] **NARR-03**: Banned words/phrases enforced: no "leverage" (verb), "synergy", "best practices", "low-hanging fruit", "move the needle", "world-class", "stakeholders", "going forward"
- [ ] **NARR-04**: Active voice throughout; lead with insight, not data; one idea per paragraph
- [ ] **NARR-05**: Every metric shown has at least 1 sentence of interpretation; no raw percentages without context

### PDF Generation

- [ ] **PDF-01**: PDF renders at 300 DPI for embedded graphics
- [ ] **PDF-02**: Charts rendered as SVG vectors where possible (not raster screenshots)
- [ ] **PDF-03**: PDF includes document metadata (title, author: "World Consulting Group", subject)
- [ ] **PDF-04**: File naming: [ClientName]-Strategic-Briefing-[Date].pdf for unified, [ClientName]-[ReportType]-[Date].pdf for individual
- [ ] **PDF-05**: Minimum body text size 11pt in generated PDFs
- [ ] **PDF-06**: Edge case handling: all-high scores (optimization framing), all-low (triage framing), vague SWOT entries (note and suggest specificity), missing modules (generate with note)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Nice-to-Have Data Inputs

- **DATA-07**: User can input percentage of revenue from top 3 clients
- **DATA-08**: User can input current profit margin range
- **DATA-09**: User can input biggest operational frustration (open text for narrative personalization)

### Enhanced Features

- **ENH-01**: AI-powered narrative generation via LLM for deeper personalization
- **ENH-02**: Historical comparison (re-assessment over time showing improvement)
- **ENH-03**: Multi-language support for reports
- **ENH-04**: White-label branding customization

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend services / server-side rendering | App remains client-side SPA; no infrastructure change |
| User authentication | Not part of assessment tool scope |
| Real-time collaboration | Single-user assessment tool |
| Payment/subscription | Business model concern, not product scope |
| Mobile native app | Web-first, PDF deliverable focus |
| BEI (Business Emotional Intelligence) report redesign | Not one of the 6 reports in the spec |
| SOP tool report redesigns | Not included in the 6 report types in the spec |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (Populated during roadmap creation) | | |

**Coverage:**
- v1 requirements: 64 total
- Mapped to phases: 0
- Unmapped: 64

---
*Requirements defined: 2026-02-13*
*Last updated: 2026-02-13 after initial definition*
