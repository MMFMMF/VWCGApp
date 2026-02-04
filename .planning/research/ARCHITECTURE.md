# Architecture Research

## Executive Summary

Strategic assessment platforms in 2026 follow a **JAMstack-inspired architecture** with clear separation between marketing content and gated application logic. For an SMB assessment tool with no backend database, the optimal architecture leverages:

- **Static site generation** for marketing/SEO content
- **Client-side state management** with localStorage for workspace persistence
- **Headless/flat-file CMS** for blog content
- **Modular assessment engine** with shared data context
- **Client-side PDF generation** for reports
- **Route-based access control** for invite-only sections

This architecture maximizes SEO, minimizes infrastructure costs, and provides excellent UX for multi-step assessments while maintaining data privacy (all data stays client-side).

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (Client-Side)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌────────────────────────┐   │
│  │  Marketing Site  │         │  Assessment App        │   │
│  │  (Static/SSG)    │◄───────►│  (SPA with Router)     │   │
│  │                  │         │                        │   │
│  │  - Landing       │         │  ┌──────────────────┐ │   │
│  │  - Blog/SEO      │         │  │  11 Assessment   │ │   │
│  │  - CTA           │         │  │  Tools           │ │   │
│  └──────────────────┘         │  └──────────────────┘ │   │
│          │                    │          │            │   │
│          │                    │          ▼            │   │
│          │                    │  ┌──────────────────┐ │   │
│          │                    │  │  Synthesis       │ │   │
│          │                    │  │  Engine          │ │   │
│          │                    │  └──────────────────┘ │   │
│          │                    │          │            │   │
│          │                    │          ▼            │   │
│          │                    │  ┌──────────────────┐ │   │
│          │                    │  │  Report          │ │   │
│          │                    │  │  Generator (PDF) │ │   │
│          │                    │  └──────────────────┘ │   │
│          │                    └────────────────────────┘   │
│          │                             │                   │
│          └─────────────┬───────────────┘                   │
│                        ▼                                   │
│              ┌──────────────────┐                          │
│              │  Shared Services │                          │
│              ├──────────────────┤                          │
│              │ - Router         │                          │
│              │ - State Manager  │                          │
│              │ - localStorage   │                          │
│              │ - Auth Guard     │                          │
│              └──────────────────┘                          │
│                        │                                   │
│                        ▼                                   │
│              ┌──────────────────┐                          │
│              │  Browser Storage │                          │
│              ├──────────────────┤                          │
│              │ - localStorage   │                          │
│              │ - sessionStorage │                          │
│              └──────────────────┘                          │
└─────────────────────────────────────────────────────────────┘

         ┌──────────────────────┐
         │  Static CMS Content  │
         │  (Markdown/JSON)     │
         │  Built at deploy     │
         └──────────────────────┘
```

**Key Architectural Principles:**
1. **Zero-backend**: All logic runs client-side, no database calls
2. **SEO-first**: Marketing content pre-rendered as static HTML
3. **Privacy-by-design**: User data never leaves browser
4. **Progressive disclosure**: Marketing → Landing → Gated tools
5. **Offline-capable**: All assessment work can happen offline

---

## Component Structure

### 1. Marketing Site (Public)

**Purpose:** Drive traffic, explain value, convert visitors to leads

**Components:**
- **Landing Page** (`/`)
  - Hero section with CTA
  - Value proposition
  - Social proof / testimonials
  - Lead capture form
  - Static or SSG-rendered

- **Blog** (`/blog/*`)
  - SEO-optimized content
  - Static site generation from markdown
  - Article list + individual posts
  - RSS feed for content syndication
  - Lightweight CMS for content updates

- **About/Contact** (`/about`, `/contact`)
  - Static pages with company info
  - Contact forms (can POST to third-party service)

**Technology Recommendations:**
- Static Site Generator: Astro, Next.js (SSG mode), or Eleventy
- Flat-file CMS: Markdown files in `/content` directory
- Build-time rendering for maximum SEO
- CDN deployment (Netlify, Vercel, Cloudflare Pages)

**Data Sources:**
- Markdown files for blog posts (`/content/blog/*.md`)
- JSON configuration for site metadata
- No runtime data fetching

---

### 2. Assessment Application (Invite-Only)

**Purpose:** Interactive tools for business assessment, synthesis, reporting

**Architecture Pattern:** Single-Page Application (SPA) with client-side routing

#### 2.1 Assessment Tools Module

**Structure:**
```
/app
  /tools
    /tool-01-vision-mission
    /tool-02-strategic-goals
    /tool-03-[...]
    /tool-11-synthesis-view
  /components
    /shared
      - FormInput.jsx
      - Slider.jsx
      - RadarChart.jsx
      - BarChart.jsx
      - LineChart.jsx
      - TimelineChart.jsx
```

**Each Tool Component:**
- Self-contained route (`/app/tools/{tool-name}`)
- Form inputs with validation
- Local state for UI interactions
- Reads from/writes to global workspace context
- Navigation controls (previous/next tool)
- Progress indicator

**Shared UI Components:**
- Form primitives (inputs, selects, sliders, textareas)
- Chart library wrappers (Chart.js, Recharts, or D3 wrapper)
- Navigation components
- Progress indicators

**Data Flow:**
```
User Input → Component State → Workspace Context → localStorage
                                      ↓
                              Synthesis Engine
                                      ↓
                              Report Generator
```

#### 2.2 Synthesis Engine

**Purpose:** Cross-tool business logic to identify gaps and generate insights

**Architecture:**

```javascript
// Conceptual structure
class SynthesisEngine {
  constructor(workspaceData) {
    this.data = workspaceData; // All 11 tools' data
  }

  // Rule-based analysis
  analyzeStrategicAlignment() {
    // Compare tool-01 (vision) with tool-02 (goals)
    // Return gaps, strengths, warnings
  }

  analyzeResourceAllocation() {
    // Cross-reference multiple tools
    // Identify misalignments
  }

  generateInsights() {
    // Run all analysis functions
    // Return structured insights object
  }

  calculateScores() {
    // Compute aggregate scores per dimension
    // Return radar chart data
  }
}
```

**Implementation Pattern:**
- **Pure functions**: Given workspace data, return insights (no side effects)
- **Rule engine**: Define business rules as declarative config or functions
- **Scoring system**: Numeric scoring per dimension with thresholds
- **Gap detection**: Compare expected vs actual states across tools
- **Prioritization logic**: Rank recommendations by impact/urgency

**Rule Organization:**
```
/synthesis
  /rules
    - strategic-alignment.js
    - resource-allocation.js
    - capability-gaps.js
    - risk-assessment.js
    - [one file per rule category]
  /scorers
    - dimension-scores.js
    - aggregate-scores.js
  /engine.js (orchestrator)
```

**Data Requirements:**
- Access to complete workspace object
- Schema validation (ensure required fields exist)
- Default/fallback values for incomplete data
- Version compatibility (if workspace schema evolves)

#### 2.3 Report Generator

**Purpose:** Generate downloadable PDF reports from assessment results

**Architecture:**
- **Client-side PDF library**: jsPDF or pdfmake
- **Template engine**: Define report layout/sections
- **Data binding**: Map workspace + insights to report sections
- **Chart rendering**: Convert interactive charts to static images (canvas.toDataURL)

**Report Structure:**
```
Report Template:
├── Cover Page (company name, date, logo)
├── Executive Summary (auto-generated from synthesis)
├── Assessment Results (per-tool summaries)
│   ├── Tool 01: Vision & Mission
│   ├── Tool 02: Strategic Goals
│   ├── [...]
│   └── Tool 11: Overall Synthesis
├── Charts & Visualizations
│   ├── Radar Chart (dimension scores)
│   ├── Gap Analysis (bar charts)
│   └── Timeline/Roadmap
├── Recommendations (prioritized action items)
└── Appendix (raw data tables)
```

**Performance Optimization:**
- Use Web Workers for heavy PDF generation (keep UI responsive)
- Lazy-load PDF library (only when generating report)
- Show progress indicator during generation
- Cache intermediate results

**File Export Options:**
- **PDF**: Primary deliverable
- **JSON**: Workspace data export (backup/restore)
- **CSV**: Raw data for further analysis

---

### 3. Shared Infrastructure

#### 3.1 State Management Architecture

**Pattern:** React Context + useReducer (or Zustand/Jotai for simpler API)

**Workspace State Structure:**
```javascript
{
  meta: {
    companyName: "Acme Corp",
    assessmentDate: "2026-02-04",
    version: "1.0",
    lastSaved: timestamp,
    inviteCode: "ABC123" // for access control
  },
  tools: {
    tool01: { /* vision/mission data */ },
    tool02: { /* strategic goals data */ },
    // ... tool03-11
  },
  synthesis: {
    insights: [ /* generated insights */ ],
    scores: { /* dimension scores */ },
    gaps: [ /* identified gaps */ ]
  },
  ui: {
    currentTool: "tool01",
    completedTools: ["tool01", "tool02"],
    progress: 0.18 // 2/11 tools
  }
}
```

**State Management Functions:**
- `initializeWorkspace()` - Load from localStorage or create new
- `updateToolData(toolId, data)` - Update specific tool's data
- `saveWorkspace()` - Persist to localStorage
- `exportWorkspace()` - Download as JSON file
- `importWorkspace(file)` - Restore from JSON file
- `clearWorkspace()` - Reset for new assessment

**Persistence Strategy:**
- **Primary**: localStorage (automatic save on every data change)
- **Secondary**: File export (manual backup by user)
- **Debounced saves**: Use debounce to avoid excessive writes
- **Version migration**: Handle schema updates across app versions

**localStorage vs sessionStorage:**
- Use **localStorage** for workspace data (persist across browser sessions)
- Use **sessionStorage** for invite code validation (per-tab, more secure)
- Max localStorage size: ~5-10MB (sufficient for assessment data)

#### 3.2 Routing Strategy

**Public Routes** (no authentication):
```
/                    → Landing page
/blog                → Blog list
/blog/{slug}         → Individual post
/about               → About page
/contact             → Contact page
```

**Gated Routes** (invite code required):
```
/app                 → Assessment dashboard (tool list)
/app/tools/tool-01   → Individual tool
/app/tools/tool-02   → [...]
/app/tools/tool-11   → Synthesis view
/app/report          → Report preview/generation
/app/export          → Data export options
```

**Access Control Implementation:**
```javascript
// Route guard
function RequireInvite({ children }) {
  const inviteCode = sessionStorage.getItem('inviteCode');

  if (!isValidInvite(inviteCode)) {
    return <Navigate to="/access-denied" />;
  }

  return children;
}

// Usage in router
<Route path="/app/*" element={
  <RequireInvite>
    <AssessmentApp />
  </RequireInvite>
} />
```

**Invite Code Validation:**
- Hardcoded list of valid codes (client-side)
- OR: Check against static JSON file fetched at runtime
- OR: Simple hash validation (encode expiry date in code)
- Store validated code in sessionStorage (cleared on tab close)

#### 3.3 Utility Services

**File Organization:**
```
/lib
  /storage
    - workspace.js      (localStorage abstraction)
    - export.js         (file download utilities)
  /validation
    - schemas.js        (data validation rules)
  /charts
    - chart-config.js   (shared chart theming)
  /utils
    - date-helpers.js
    - formatting.js
```

---

## Data Flow

### Primary Data Flow (Assessment Completion)

```
1. User navigates to /app/tools/tool-01
2. Component reads from Workspace Context
3. User fills form, interacts with sliders
4. onChange handlers update Component State
5. onBlur or onNext triggers Context update
6. Context update triggers localStorage save (debounced)
7. User clicks "Next" → Navigate to tool-02
8. Repeat steps 2-7 for all tools
9. On tool completion, trigger Synthesis Engine
10. Synthesis reads full workspace, runs rules
11. Insights saved back to workspace context
12. User clicks "Generate Report"
13. Report Generator reads workspace + insights
14. PDF generated client-side via jsPDF
15. Browser downloads PDF file
```

### Data Flow Diagram

```
┌─────────────┐
│   User      │
│   Input     │
└──────┬──────┘
       │ onChange
       ▼
┌─────────────┐
│ Component   │
│ Local State │
└──────┬──────┘
       │ onBlur/onNext
       ▼
┌─────────────────┐      Auto-save     ┌──────────────┐
│ Workspace       │◄─────(debounced)───►│ localStorage │
│ Context (React) │                     └──────────────┘
└─────────────────┘
       │
       │ (when all tools complete)
       ▼
┌─────────────────┐
│ Synthesis       │
│ Engine          │
│ (Pure Functions)│
└─────────────────┘
       │
       │ (generate insights)
       ▼
┌─────────────────┐
│ Workspace       │
│ (updated with   │
│  insights)      │
└─────────────────┘
       │
       │ (user clicks "Generate Report")
       ▼
┌─────────────────┐
│ Report          │
│ Generator       │
│ (jsPDF/pdfmake) │
└─────────────────┘
       │
       │ (download)
       ▼
┌─────────────────┐
│ Browser         │
│ Downloads       │
└─────────────────┘
```

---

## State Management Architecture

### Recommended Approach: React Context + useReducer

**Rationale:**
- Built-in to React (no external dependency)
- Sufficient for moderate complexity
- Easy to understand for future maintainers
- Can upgrade to Redux/Zustand later if needed

**Alternative:** Zustand (simpler API, smaller bundle)

### Implementation Pattern

```javascript
// WorkspaceContext.js
const WorkspaceContext = createContext();

function WorkspaceProvider({ children }) {
  const [workspace, dispatch] = useReducer(workspaceReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('assessment-workspace');
    if (saved) {
      dispatch({ type: 'LOAD_WORKSPACE', payload: JSON.parse(saved) });
    }
  }, []);

  // Save to localStorage on every change (debounced)
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      localStorage.setItem('assessment-workspace', JSON.stringify(workspace));
    }, 1000); // 1 second debounce

    return () => clearTimeout(saveTimer);
  }, [workspace]);

  return (
    <WorkspaceContext.Provider value={{ workspace, dispatch }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// Actions
const actions = {
  updateTool: (toolId, data) => ({
    type: 'UPDATE_TOOL',
    payload: { toolId, data }
  }),

  runSynthesis: (insights) => ({
    type: 'SET_SYNTHESIS',
    payload: insights
  }),

  clearWorkspace: () => ({ type: 'CLEAR_WORKSPACE' })
};
```

### State Persistence Strategy

**Auto-save timing:**
- **onBlur** for text inputs (user finished typing)
- **onChange (debounced)** for sliders (smooth interaction)
- **onNext** when navigating between tools (explicit checkpoint)

**Conflict resolution:**
- Single-tab usage expected (SMB owner working alone)
- If multi-tab is concern, use BroadcastChannel API to sync tabs
- Show warning if multiple tabs detected

**Data migration:**
```javascript
function migrateWorkspace(data) {
  const version = data.meta?.version || '0.0';

  if (version === '1.0') return data;

  // Apply migrations for older versions
  if (version === '0.9') {
    // Transform 0.9 → 1.0
    return migrate_0_9_to_1_0(data);
  }

  return data;
}
```

---

## Synthesis Engine Design

### Architecture Pattern: Rule Engine + Scorers

**Core Concept:** The synthesis engine is a **pure function** that takes workspace data and returns insights. No side effects, fully testable, deterministic.

### Rule Engine Structure

```javascript
// synthesis/engine.js
export class SynthesisEngine {
  constructor(workspaceData) {
    this.data = workspaceData;
    this.rules = [
      new StrategicAlignmentRule(),
      new ResourceAllocationRule(),
      new CapabilityGapRule(),
      // ... more rules
    ];
  }

  analyze() {
    const insights = [];
    const scores = {};

    // Run all rules
    for (const rule of this.rules) {
      const result = rule.evaluate(this.data);
      insights.push(...result.insights);
      Object.assign(scores, result.scores);
    }

    // Prioritize insights
    const prioritized = this.prioritizeInsights(insights);

    return {
      insights: prioritized,
      scores: scores,
      gaps: this.identifyGaps(insights),
      recommendations: this.generateRecommendations(insights)
    };
  }

  prioritizeInsights(insights) {
    // Sort by severity, impact, urgency
    return insights.sort((a, b) => {
      return (b.severity * b.impact) - (a.severity * a.impact);
    });
  }

  identifyGaps(insights) {
    // Extract high-severity issues as "gaps"
    return insights.filter(i => i.severity >= 7);
  }

  generateRecommendations(insights) {
    // Map insights to actionable recommendations
    return insights.map(i => i.recommendation);
  }
}
```

### Rule Definition Pattern

```javascript
// synthesis/rules/strategic-alignment.js
export class StrategicAlignmentRule {
  evaluate(data) {
    const vision = data.tools.tool01.vision;
    const goals = data.tools.tool02.goals;

    const insights = [];
    const scores = {};

    // Business logic: Check if goals align with vision
    if (!this.goalsAlignWithVision(vision, goals)) {
      insights.push({
        type: 'misalignment',
        severity: 8,
        impact: 9,
        title: 'Strategic Goals Misaligned with Vision',
        description: 'Your stated goals do not directly support your vision...',
        recommendation: 'Revise goals to explicitly support vision statements.',
        affectedTools: ['tool01', 'tool02']
      });
      scores.strategicAlignment = 4; // Low score
    } else {
      scores.strategicAlignment = 9; // High score
    }

    return { insights, scores };
  }

  goalsAlignWithVision(vision, goals) {
    // Implement alignment logic
    // Could be keyword matching, semantic analysis, etc.
    return true; // Placeholder
  }
}
```

### Scoring System

**Dimensions to Score:**
- Strategic Alignment (vision ↔ goals)
- Resource Allocation (budget ↔ priorities)
- Capability Maturity (skills ↔ needs)
- Risk Management (threats ↔ mitigation)
- Operational Readiness (processes ↔ scale)
- [5-10 total dimensions based on tools]

**Score Scale:** 1-10
- 8-10: Strong, minimal gaps
- 5-7: Moderate, some improvement needed
- 1-4: Weak, significant gaps

**Aggregate Score:**
```javascript
function calculateOverallScore(dimensionScores) {
  const weights = {
    strategicAlignment: 0.25,
    resourceAllocation: 0.20,
    capabilityMaturity: 0.20,
    riskManagement: 0.15,
    operationalReadiness: 0.20
  };

  let total = 0;
  for (const [dimension, score] of Object.entries(dimensionScores)) {
    total += score * (weights[dimension] || 0.10);
  }

  return Math.round(total);
}
```

### Insight Object Schema

```javascript
{
  id: "insight-001",
  type: "gap" | "strength" | "warning" | "opportunity",
  severity: 1-10,
  impact: 1-10,
  title: "Brief headline",
  description: "Detailed explanation",
  recommendation: "Actionable next step",
  affectedTools: ["tool01", "tool02"],
  data: { /* supporting data */ }
}
```

### Integration Points

**When to Run Synthesis:**
1. **On-demand:** User clicks "Analyze" button
2. **After tool completion:** Auto-run after each tool (show mini-insights)
3. **Pre-report:** Always run fresh before generating PDF

**Caching Considerations:**
- Cache synthesis results in workspace context
- Re-run if tool data changes (check lastModified timestamps)
- Show "Analysis outdated" warning if data changed since last run

---

## Build Order Recommendations

### Phase 1: Foundation (Weeks 1-2)
1. **Project Setup**
   - Initialize React app (Vite or Next.js)
   - Configure routing (React Router or Next.js)
   - Set up Tailwind CSS or component library
   - Create basic folder structure

2. **Shared Infrastructure**
   - Implement WorkspaceContext + localStorage
   - Build routing scaffold (public + gated routes)
   - Create invite code validation
   - Build shared UI components (forms, buttons)

3. **Marketing Site Skeleton**
   - Landing page structure
   - Blog listing page (static data first)
   - Basic navigation

**Deliverable:** Can navigate between pages, invite code works, localStorage persists data

---

### Phase 2: Assessment Tools (Weeks 3-5)
4. **Tool Template Component**
   - Generic tool layout (header, form area, navigation)
   - Progress indicator
   - Form validation utilities

5. **Build First 3 Tools**
   - Tool 01: Vision & Mission (text inputs)
   - Tool 02: Strategic Goals (list builder)
   - Tool 03: [Next simplest tool] (mix of inputs)
   - Focus on UX patterns, reusable components

6. **Chart Components**
   - Integrate Chart.js or Recharts
   - Build wrapper components for radar, bar, line charts
   - Test with mock data

**Deliverable:** Can complete 3 assessment tools, data persists, navigation works

---

### Phase 3: Remaining Tools + Synthesis (Weeks 6-8)
7. **Complete Tools 4-10**
   - Apply patterns from first 3 tools
   - Build any complex interactions (sliders, conditional logic)

8. **Synthesis Engine MVP**
   - Implement 2-3 core rules
   - Build simple scoring system
   - Create insights display component

9. **Tool 11: Synthesis View**
   - Dashboard showing all insights
   - Dimension scores (radar chart)
   - Gap summary

**Deliverable:** All 11 tools functional, synthesis generates insights

---

### Phase 4: Reports + Polish (Weeks 9-10)
10. **PDF Report Generator**
    - Integrate jsPDF or pdfmake
    - Build report template
    - Implement data binding
    - Add chart-to-image conversion

11. **Data Export/Import**
    - JSON export/import
    - CSV export (optional)
    - Workspace reset functionality

12. **Marketing Content**
    - Write blog posts (Markdown)
    - Set up static CMS (if needed)
    - Final landing page copy + design

**Deliverable:** Full feature set complete, PDF reports working

---

### Phase 5: Testing + Launch (Week 11-12)
13. **Testing**
    - User acceptance testing with beta users
    - Cross-browser testing
    - Mobile responsiveness
    - Edge cases (empty data, large data sets)

14. **Deployment**
    - Set up CDN deployment (Netlify/Vercel)
    - Configure custom domain
    - Set up analytics
    - Final SEO optimization

**Deliverable:** Production-ready application

---

## Routing Strategy

### Technology Recommendation: React Router v6

**Rationale:**
- Industry standard
- Nested routes for app sections
- Easy route guards for invite-only access
- Good TypeScript support

**Alternative:** Next.js App Router (if SSR/SSG benefits needed)

### Route Structure

```javascript
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Gated Routes */}
        <Route path="/app" element={<RequireInvite />}>
          <Route index element={<Dashboard />} />
          <Route path="tools/:toolId" element={<ToolView />} />
          <Route path="report" element={<ReportView />} />
          <Route path="export" element={<ExportView />} />
        </Route>

        {/* Utility Routes */}
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Invite Code Implementation Options

**Option 1: Hardcoded List (Simplest)**
```javascript
const VALID_CODES = ['DEMO2026', 'BETA123', 'EARLY-ACCESS'];

function isValidInvite(code) {
  return VALID_CODES.includes(code.toUpperCase());
}
```

**Option 2: Date-Based Codes (Time-Limited Access)**
```javascript
function generateInviteCode(expiryDate) {
  // Encode expiry in the code itself
  const timestamp = expiryDate.getTime();
  return btoa(`INVITE-${timestamp}`);
}

function isValidInvite(code) {
  try {
    const decoded = atob(code);
    const timestamp = parseInt(decoded.split('-')[1]);
    return Date.now() < timestamp;
  } catch {
    return false;
  }
}
```

**Option 3: Fetch from Static JSON (Updatable)**
```javascript
// public/invite-codes.json
{
  "codes": ["CODE1", "CODE2", "CODE3"],
  "expires": "2026-12-31"
}

async function isValidInvite(code) {
  const res = await fetch('/invite-codes.json');
  const data = await res.json();
  return data.codes.includes(code) && Date.now() < new Date(data.expires);
}
```

---

## File Structure Recommendation

```
fwt-assessment/
├── public/
│   ├── index.html
│   ├── invite-codes.json (optional)
│   └── assets/
│       ├── images/
│       └── fonts/
├── src/
│   ├── app/                      # Assessment application
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ToolView.jsx
│   │   │   ├── ReportView.jsx
│   │   │   └── ExportView.jsx
│   │   ├── tools/
│   │   │   ├── Tool01VisionMission.jsx
│   │   │   ├── Tool02StrategicGoals.jsx
│   │   │   ├── [...]/
│   │   │   └── Tool11Synthesis.jsx
│   │   └── layout/
│   │       ├── AppLayout.jsx
│   │       └── ProgressHeader.jsx
│   ├── marketing/                # Marketing site
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── BlogList.jsx
│   │   │   ├── BlogPost.jsx
│   │   │   ├── About.jsx
│   │   │   └── Contact.jsx
│   │   └── layout/
│   │       ├── MarketingLayout.jsx
│   │       ├── Header.jsx
│   │       └── Footer.jsx
│   ├── components/               # Shared components
│   │   ├── forms/
│   │   │   ├── Input.jsx
│   │   │   ├── Slider.jsx
│   │   │   ├── Select.jsx
│   │   │   └── TextArea.jsx
│   │   ├── charts/
│   │   │   ├── RadarChart.jsx
│   │   │   ├── BarChart.jsx
│   │   │   ├── LineChart.jsx
│   │   │   └── TimelineChart.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Modal.jsx
│   │   └── navigation/
│   │       ├── ToolNavigation.jsx
│   │       └── ProgressIndicator.jsx
│   ├── lib/                      # Utilities & services
│   │   ├── storage/
│   │   │   ├── workspace.js
│   │   │   └── export.js
│   │   ├── synthesis/
│   │   │   ├── engine.js
│   │   │   ├── rules/
│   │   │   │   ├── strategic-alignment.js
│   │   │   │   ├── resource-allocation.js
│   │   │   │   └── [...].js
│   │   │   └── scorers/
│   │   │       └── dimension-scores.js
│   │   ├── report/
│   │   │   ├── generator.js
│   │   │   └── templates/
│   │   │       └── default-template.js
│   │   ├── validation/
│   │   │   └── schemas.js
│   │   └── utils/
│   │       ├── date-helpers.js
│   │       └── formatting.js
│   ├── context/                  # State management
│   │   ├── WorkspaceContext.jsx
│   │   └── AuthContext.jsx
│   ├── hooks/                    # Custom React hooks
│   │   ├── useWorkspace.js
│   │   ├── useLocalStorage.js
│   │   └── useSynthesis.js
│   ├── routes/                   # Routing configuration
│   │   ├── AppRoutes.jsx
│   │   └── RequireInvite.jsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── tailwind.css
│   ├── App.jsx
│   └── main.jsx
├── content/                      # CMS content (Markdown)
│   └── blog/
│       ├── post-001-intro.md
│       ├── post-002-strategy.md
│       └── [...].md
├── .planning/                    # Project documentation
│   ├── research/
│   │   └── ARCHITECTURE.md (this file)
│   └── roadmap/
├── package.json
├── vite.config.js (or next.config.js)
├── tailwind.config.js
└── README.md
```

---

## Technology Stack Recommendations

### Core Framework
**Recommended:** React + Vite
- Fast dev experience
- Simple build process
- No backend complexity
- Easy deployment

**Alternative:** Next.js (if SEO is critical)
- Better SEO for marketing pages
- API routes for invite code validation
- Image optimization
- Slightly more complex

### UI Libraries
**Component Library:** shadcn/ui or Headless UI
- Unstyled, customizable
- Good accessibility
- Works with Tailwind

**Charts:** Recharts
- React-first API
- Good documentation
- Composable components

### State Management
**Recommended:** React Context + useReducer
- Built-in, no dependencies
- Sufficient for this app

**Alternative:** Zustand
- Simpler API than Redux
- Smaller bundle size

### PDF Generation
**Recommended:** jsPDF
- Mature, well-documented
- Good performance
- Large community

**Alternative:** pdfmake
- Declarative API
- Better for complex layouts

### CMS
**Recommended:** Markdown files + frontmatter
- Simple, no external service
- Version controlled
- Free

**Alternative:** Headless CMS (Sanity, Contentful)
- If non-technical content editors
- Adds dependency + cost

---

## Security Considerations

### Client-Side Limitations
- **No sensitive data**: Since all logic is client-side, assume data can be inspected
- **Invite codes**: Are obfuscation, not true security (acceptable for lead gen)
- **Data privacy**: Actually a benefit—user data never leaves browser

### Best Practices
1. **Input validation**: Validate all user inputs (XSS prevention)
2. **Content Security Policy**: Set CSP headers to prevent injection attacks
3. **HTTPS only**: Serve over HTTPS (free with Netlify/Vercel)
4. **Dependency auditing**: Regularly audit npm packages for vulnerabilities
5. **localStorage encryption**: Optional—encrypt sensitive workspace data before storing

### Invite Code Security
- **Rotation**: Change codes periodically
- **Obfuscation**: Use non-obvious strings
- **Expiry**: Implement time-based expiration
- **Rate limiting**: Not possible client-side, but CDN can help

---

## Performance Optimization

### Bundle Size
- **Code splitting**: Lazy-load assessment tools (React.lazy)
- **Tree shaking**: Only import used components
- **PDF library**: Lazy-load only when generating report

### Runtime Performance
- **Debounced saves**: Avoid excessive localStorage writes
- **Web Workers**: Offload synthesis engine + PDF generation
- **Memoization**: Memoize expensive calculations (React.memo, useMemo)

### SEO Optimization
- **Static rendering**: Pre-render marketing pages
- **Meta tags**: Dynamic meta tags per page
- **Sitemap**: Generate sitemap for blog posts
- **RSS feed**: Provide RSS for blog

---

## Deployment Strategy

### Recommended Platform: Netlify or Vercel

**Benefits:**
- Free tier for small projects
- Automatic HTTPS
- CDN distribution
- Git-based deployment (push to deploy)
- Environment variables for invite codes
- Edge functions (if needed)

**Build Command:**
```bash
npm run build
```

**Deploy Directory:** `dist/` (Vite) or `out/` (Next.js)

### Environment Variables
```
VITE_INVITE_CODES=CODE1,CODE2,CODE3
VITE_ANALYTICS_ID=GA-XXXXXXX
```

### CI/CD
- Push to `main` branch → auto-deploy to production
- Push to `develop` branch → deploy to staging URL
- Preview deployments for pull requests

---

## Testing Strategy

### Unit Tests
- **Synthesis Engine**: Test rules in isolation
- **Utilities**: Test validation, formatting functions
- **Components**: Test form inputs, state updates

### Integration Tests
- **Data flow**: Test workspace context updates
- **Navigation**: Test route guards, invite validation
- **localStorage**: Test persistence across reloads

### E2E Tests (Optional)
- **User flows**: Complete assessment → Generate report
- **Cross-browser**: Test in Chrome, Firefox, Safari

**Tools:** Vitest (unit), Playwright (E2E)

---

## Future Enhancements (Post-MVP)

### Phase 2 Features
- **Backend sync** (optional): Add Firebase/Supabase for cross-device sync
- **Team collaboration**: Multi-user workspaces
- **Templates**: Pre-filled assessments for different industries
- **Advanced analytics**: Track tool completion rates, time spent

### Scalability Considerations
- **Database migration**: If user base grows, add backend for persistence
- **Authentication**: Replace invite codes with proper auth (Auth0, Clerk)
- **Payment integration**: If moving to paid model (Stripe)

---

## Research Sources

### Architecture Patterns
- [Modern Web Application Architecture in 2026](https://quokkalabs.com/blog/modern-web-application-architecture/)
- [Web Application Architecture: The Ultimate Guide 2026](https://www.owebest.com/blog/web-application-architecture-guide-2024)
- [Data Flow Architecture](https://www.tutorialspoint.com/software_architecture_design/data_flow_architecture.htm)
- [Data Flow Diagram (DFD)](https://sbscyber.com/blog/data-flow-diagrams-101)

### State Management
- [Mastering State Persistence with Local Storage in React](https://medium.com/@roman_j/mastering-state-persistence-with-local-storage-in-react-a-complete-guide-1cf3f56ab15c)
- [Multistep Forms in React with Persistent State](https://andyfry.co/multi-step-form-persistent-state/)
- [State Management in Single Page Applications (SPAs)](https://blog.pixelfreestudio.com/state-management-in-single-page-applications-spas/)

### PDF Generation
- [How to Generate PDFs in the Browser with Javascript](https://joyfill.io/blog/how-to-generate-pdfs-in-the-browser-with-javascript-no-server-needed)
- [How We Improved Client-Side PDF Generation by 5x](https://dev.to/karanjanthe/how-we-improved-our-client-side-pdf-generation-by-5x-3n69)
- [jsPDF GitHub Repository](https://github.com/parallax/jsPDF)

### CMS & Static Sites
- [Static Site Generators - Top Open Source SSGs](https://jamstack.org/generators/)
- [Headless CMS vs. Static Site Generator](https://www.contentstack.com/cms-guides/headless-cms-vs-static-site-generator)
- [Static Site CMS: Definition, Examples, and How to Choose](https://buttercms.com/blog/static-site-cms-definition-examples-and-how-to-choose/)

---

## Quality Gate Checklist

- [x] Components clearly defined with boundaries
  - Marketing Site, Assessment App, Shared Infrastructure detailed
- [x] Data flow direction explicit
  - User Input → Component State → Context → localStorage → Synthesis → Report
- [x] Build order implications noted
  - 5-phase plan with dependencies and week estimates
- [x] Synthesis engine architecture clear
  - Rule-based engine with pure functions, scoring system, insight generation

---

## Conclusion

This architecture provides a solid foundation for an SMB strategic assessment platform that:

1. **Prioritizes SEO** through static marketing pages
2. **Protects user privacy** with client-only data storage
3. **Delivers actionable insights** via synthesis engine
4. **Generates professional reports** with client-side PDF generation
5. **Scales affordably** with no backend infrastructure costs

The phased build order ensures early validation of core patterns before building all 11 tools. The synthesis engine's rule-based design allows easy addition of new business logic as understanding of SMB assessment needs deepens.

**Next Steps:**
1. Review this architecture with stakeholders
2. Refine tool definitions (what data each tool collects)
3. Define synthesis rules (specific business logic for gap detection)
4. Begin Phase 1 implementation (foundation + infrastructure)
