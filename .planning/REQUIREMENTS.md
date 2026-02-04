# Requirements: VWCGApp

**Defined:** 2026-02-04
**Core Value:** SMB owners get clear, actionable visibility into their business readiness gaps

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Marketing Site

- [ ] **MKT-01**: Landing page optimized for cold traffic conversion (PPC, social ads)
- [ ] **MKT-02**: Blog with Decap CMS for WordPress-like content editing
- [ ] **MKT-03**: SEO optimization (meta tags, structured data, sitemap)
- [ ] **MKT-04**: Mobile-responsive design (60%+ expected mobile traffic)

### Access Control

- [ ] **ACC-01**: Public landing page and blog accessible without invite
- [ ] **ACC-02**: Assessment tools gated behind invite code entry
- [ ] **ACC-03**: Simple invite code generation and validation
- [ ] **ACC-04**: Session persistence for validated users (sessionStorage)

### Assessment Tools

- [ ] **AST-01**: AI Readiness Assessment — 6 dimensions (Strategy, Data, Infrastructure, Talent, Governance, Culture), 0-100% sliders, radar chart visualization
- [ ] **AST-02**: Leadership DNA — 6 dimensions (Vision, Execution, Empowerment, Decisiveness, Adaptability, Integrity), current vs target (0-10), dual-layer radar chart
- [ ] **AST-03**: Business Emotional Intelligence — 6 dimensions (Self Awareness, Self Regulation, Motivation, Empathy, Social Skills, Intuition), trend tracking over time, multi-entry support
- [ ] **AST-04**: SWOT Analysis — 4-quadrant matrix (Strengths, Weaknesses, Opportunities, Threats), confidence levels (1-5) per item
- [ ] **AST-05**: Vision Canvas — North Star metric, strategic pillars (max 6), core values list
- [ ] **AST-06**: Advisor Readiness — 20 questions across 4 categories (Strategic Alignment, Operational Maturity, Financial Health, Cultural Readiness), 1-5 scale, maturity percentage calculation
- [ ] **AST-07**: Financial Readiness Assessment — 5-8 key financial health indicators (cash flow, runway, debt-to-equity, profit margins, revenue growth), visual dashboard, risk score output

### SOP Assessment

- [ ] **SOP-01**: SOP Maturity Assessment — current process maturity evaluation (0-5 scale)
- [ ] **SOP-02**: Identification of top 3 critical SOPs needed based on assessment results
- [ ] **SOP-03**: Template suggestions for identified SOP gaps

### Planning Tools

- [ ] **PLN-01**: 90-Day Roadmap — 12-week timeline across 3 phases (Foundation 1-4, Growth 5-8, Scale 9-12)
- [ ] **PLN-02**: Task creation with title, owner, week, status, dependencies
- [ ] **PLN-03**: Status tracking (planned, in-progress, completed)
- [ ] **PLN-04**: Timeline visualization with phase-based coloring

### Synthesis Engine

- [ ] **SYN-01**: E1 — Execution Capability Gap (Leadership Execution < 6 + Pillars exceed dynamic limit)
- [ ] **SYN-02**: E2 — Unmitigated Threat (SWOT threat confidence >= 4 + no roadmap task addressing it)
- [ ] **SYN-03**: E3 — Burnout Risk (Advisor maturity < 50% + tasks > safe capacity)
- [ ] **SYN-04**: E4 — Strength Leverage (FIXED: high-confidence strength not connected to value proposition)
- [ ] **SYN-05**: E5 — SOP Metric Missing (metrics defined but SOP maturity too low)
- [ ] **SYN-06**: E10 — Opportunity-Capability Match (high-confidence opportunity + aligned capabilities)
- [ ] **SYN-07**: E11 — Strength Multiplication (compounding advantages across multiple dimensions)
- [ ] **SYN-08**: Automatic synthesis on every state update
- [ ] **SYN-09**: Insight display with severity badges, recommendations, related tools

### Report Center

- [ ] **RPT-01**: Section selection for PDF generation (checkboxes per tool)
- [ ] **RPT-02**: PDF generation with selected sections (jsPDF)
- [ ] **RPT-03**: Report includes assessment scores, charts, and synthesis insights
- [ ] **RPT-04**: Download as `VWCGReport_[workspace-name].pdf`

### Workspace Management

- [ ] **WRK-01**: Auto-save to browser localStorage via Zustand persist
- [ ] **WRK-02**: Save workspace to downloadable .vwcg file (JSON format)
- [ ] **WRK-03**: Load workspace from .vwcg or .json file
- [ ] **WRK-04**: Safe mode for imports with validation and partial import selection
- [ ] **WRK-05**: Logic version tracking and upgrade mechanism

### Contact & Lead Capture

- [ ] **CTT-01**: Contact form using Netlify Forms or Formspree (no backend)
- [ ] **CTT-02**: Pre-filled message template ("Please contact me to discuss execution of my recommendations")
- [ ] **CTT-03**: Form submission sends to consultant email

### Architecture & Extensibility

- [ ] **ARC-01**: Modular tool architecture — each tool is self-contained component
- [ ] **ARC-02**: Tool registry pattern for dynamic tool registration
- [ ] **ARC-03**: Standardized tool interface (data structure, state management, PDF export)
- [ ] **ARC-04**: Documented tool creation pattern for adding new tools
- [ ] **ARC-05**: Synthesis rule registry for adding new rules without modifying engine core

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Goal Tracking

- **GTR-01**: Mark roadmap milestones as complete
- **GTR-02**: Progress percentage calculation
- **GTR-03**: Re-engagement prompts at 30/60/90 days

### Competitive Positioning

- **CMP-01**: Identify top 3 competitors
- **CMP-02**: Compare on 5-6 dimensions
- **CMP-03**: Competitive position matrix output

### Team Alignment

- **TEM-01**: 10-12 questions about team structure and alignment
- **TEM-02**: Team alignment score and gap areas

### Additional Synthesis Rules

- **SYN-E6**: Financial-Growth Misalignment
- **SYN-E7**: Competitive Blind Spot
- **SYN-E8**: Market-Product Disconnect
- **SYN-E9**: Leadership-Team Capability Gap

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Full financial planning/forecasting | Separate product category — provide assessment only |
| Full project management system | 90-Day Roadmap is planning tool, not Asana competitor |
| Complete SOP/process management platform | Distracts from strategic assessment — consolidated to maturity assessment |
| CRM or customer management | Not a strategic assessment function |
| Industry-specific deep dives | Stay horizontal to serve all SMBs |
| Full advisory/coaching platform | Assessment creates leads — advisory is the business model |
| Social/community features | Requires different expertise and moderation |
| Database backend | localStorage + file export fulfills persistence needs |
| User accounts/authentication | Invite codes, not user management |
| Hard-sell tactics, gated reports | Genuine value first philosophy |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| MKT-01 | Phase 6 | Pending |
| MKT-02 | Phase 6 | Pending |
| MKT-03 | Phase 6 | Pending |
| MKT-04 | Phase 6 | Pending |
| ACC-01 | Phase 6 | Pending |
| ACC-02 | Phase 6 | Pending |
| ACC-03 | Phase 6 | Pending |
| ACC-04 | Phase 6 | Pending |
| AST-01 | Phase 2 | Pending |
| AST-02 | Phase 2 | Pending |
| AST-03 | Phase 2 | Pending |
| AST-04 | Phase 3 | Pending |
| AST-05 | Phase 3 | Pending |
| AST-06 | Phase 3 | Pending |
| AST-07 | Phase 3 | Pending |
| SOP-01 | Phase 3 | Pending |
| SOP-02 | Phase 3 | Pending |
| SOP-03 | Phase 3 | Pending |
| PLN-01 | Phase 4 | Pending |
| PLN-02 | Phase 4 | Pending |
| PLN-03 | Phase 4 | Pending |
| PLN-04 | Phase 4 | Pending |
| SYN-01 | Phase 4 | Pending |
| SYN-02 | Phase 4 | Pending |
| SYN-03 | Phase 4 | Pending |
| SYN-04 | Phase 4 | Pending |
| SYN-05 | Phase 4 | Pending |
| SYN-06 | Phase 4 | Pending |
| SYN-07 | Phase 4 | Pending |
| SYN-08 | Phase 4 | Pending |
| SYN-09 | Phase 4 | Pending |
| RPT-01 | Phase 5 | Pending |
| RPT-02 | Phase 5 | Pending |
| RPT-03 | Phase 5 | Pending |
| RPT-04 | Phase 5 | Pending |
| WRK-01 | Phase 5 | Pending |
| WRK-02 | Phase 5 | Pending |
| WRK-03 | Phase 5 | Pending |
| WRK-04 | Phase 5 | Pending |
| WRK-05 | Phase 5 | Pending |
| CTT-01 | Phase 6 | Pending |
| CTT-02 | Phase 6 | Pending |
| CTT-03 | Phase 6 | Pending |
| ARC-01 | Phase 1 | Pending |
| ARC-02 | Phase 1 | Pending |
| ARC-03 | Phase 1 | Pending |
| ARC-04 | Phase 1 | Pending |
| ARC-05 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 44 total
- Mapped to phases: 44
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-04*
*Last updated: 2026-02-04 after roadmap creation (all 44 requirements mapped to phases)*
