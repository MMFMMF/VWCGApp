# Codebase Structure

**Analysis Date:** 2026-02-13

## Directory Layout

```
vwcgapp/
├── src/
│   ├── main.tsx                    # Entry point: initializes registry, validation, charts
│   ├── App.tsx                     # Router setup, workspace bootstrap
│   ├── index.css                   # Tailwind imports
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx        # Main layout: sidebar, topbar, outlet
│   │   │   └── SafeModeBanner.tsx  # Safe Mode modal for workspace import preview
│   │   ├── dashboard/
│   │   │   └── StrategicHealthWidget.tsx  # Health score display (sidebar + dashboard)
│   │   ├── ui/
│   │   │   ├── Button.tsx          # Reusable button component
│   │   │   └── ExportButton.tsx    # Export workspace button
│   │   └── ErrorBoundary.tsx       # Error boundary wrapper
│   │
│   ├── store/
│   │   └── workspaceStore.ts       # Zustand store with persist middleware
│   │
│   ├── registry/
│   │   ├── ToolRegistry.ts         # Tool registry interface and functions
│   │   └── registry.ts             # Tool registration init
│   │
│   ├── tools/
│   │   ├── dashboard/
│   │   │   └── DashboardTool.tsx   # Home page / dashboard
│   │   ├── ai-readiness/
│   │   │   ├── index.ts            # ToolDefinition export
│   │   │   └── AiReadinessTool.tsx # AI Readiness assessment component
│   │   ├── leadership-dna/
│   │   │   ├── index.ts            # ToolDefinition export
│   │   │   └── LeadershipDnaTool.tsx # Leadership competencies radar chart
│   │   ├── emotional-intelligence/
│   │   │   ├── index.tsx           # ToolDefinition export
│   │   │   ├── BeiComponent.tsx    # Behavioral/Emotional Intelligence form
│   │   │   └── BeiTrendChart.tsx   # Trend visualization
│   │   ├── vision-canvas/
│   │   │   ├── index.ts            # ToolDefinition export (file location may vary)
│   │   │   └── VisionCanvasTool.tsx # Vision/strategy definition (assumed)
│   │   ├── swot/
│   │   │   ├── index.ts            # ToolDefinition export
│   │   │   └── SwotTool.tsx        # SWOT analysis (assumed)
│   │   ├── sop/
│   │   │   ├── index.ts            # ToolDefinition export (3 tools: taxonomy, creation, management)
│   │   │   ├── SopTaxonomyTool.tsx # SOP taxonomy (assumed)
│   │   │   ├── SopCreationTool.tsx # SOP creation (assumed)
│   │   │   └── SopManagementTool.tsx # SOP management (assumed)
│   │   ├── roadmap/
│   │   │   ├── index.tsx           # ToolDefinition export
│   │   │   └── RoadmapTool.tsx     # 90-Day roadmap (assumed)
│   │   ├── advisor-readiness/
│   │   │   ├── index.tsx           # ToolDefinition export
│   │   │   ├── AdvisorTool.tsx     # Advisor maturity assessment
│   │   │   ├── AdvisorResults.tsx  # Results display (assumed)
│   │   │   └── questions.ts        # Question definitions
│   │   ├── report/
│   │   │   ├── index.tsx           # ToolDefinition export
│   │   │   ├── ReportCenter.tsx    # Report generation / export
│   │   │   ├── ReportPreview.tsx   # Report preview (assumed)
│   │   │   └── PdfService.ts       # PDF generation utilities
│   │   ├── authority/
│   │   │   ├── index.tsx           # ToolDefinition export
│   │   │   └── AuthorityTool.tsx   # Authority/hierarchy assessment (assumed)
│   │   └── ...
│   │
│   ├── engine/
│   │   ├── synthesis.ts            # Synthesis rule orchestration: runSynthesis()
│   │   ├── rules.ts                # Cross-tool rules (E1-E5): executionGapRule, etc.
│   │   ├── types.ts                # Insight, SynthesisRule interfaces
│   │   ├── cloud.ts                # AI consultation via Gemini API
│   │   └── prompts.ts              # System prompts for AI consultation
│   │
│   ├── validation/
│   │   ├── types.ts                # ValidationResult, ValidationIssue, ValidationProfile interfaces
│   │   ├── index.ts                # initializeValidation() - profile registration
│   │   ├── validator.ts            # validateWorkspace() - L0/L1/L2 orchestration
│   │   ├── profiles_p1.ts          # AI Readiness, Leadership DNA, BEI profiles
│   │   ├── profiles_p2.ts          # Vision Canvas, SWOT, SOP profiles
│   │   └── profiles_p3.ts          # Roadmap, Advisor Readiness profiles
│   │
│   ├── lib/
│   │   └── charts.ts               # Chart.js registration and setup
│   │
│   ├── utils/
│   │   ├── cn.ts                   # className utility: clsx + tailwind-merge
│   │   └── fileSystem.ts           # saveWorkspaceToFile(), loadWorkspaceFromFile()
│   │
│   ├── assets/
│   │   └── (images, logos, static files)
│   │
│   └── scripts/
│       ├── verify_joe.ts           # Standalone verification script
│       ├── e2e_test_audit_fixes.ts # E2E test script
│       └── test_consult_ai.ts      # AI consultation testing
│
├── public/
│   └── (public assets served directly)
│
├── dist/
│   └── (Vite production build output - NOT committed)
│
├── vite.config.ts                  # Vite config with @/ alias to src/
├── tsconfig.json                   # Base TypeScript config
├── tsconfig.app.json               # App-specific TS config with @/ alias
├── package.json                    # Dependencies and scripts
├── package-lock.json               # Lockfile
├── index.html                      # HTML entry point
├── firebase.json                   # Firebase Hosting config
└── .planning/
    └── codebase/                   # GSD planning documents (generated)
```

## Directory Purposes

**src/:**
- Purpose: All source code
- Contains: TypeScript, React components, utilities, configuration
- Key files: `main.tsx`, `App.tsx`, `index.css`

**src/components/:**
- Purpose: Shared React components (layout, UI primitives, specialized widgets)
- Contains: AppShell (layout), SafeModeBanner (Safe Mode modal), StrategicHealthWidget (metrics), UI button/export
- Key files: `layout/AppShell.tsx`, `layout/SafeModeBanner.tsx`

**src/tools/:**
- Purpose: Tool implementations (each tool is a subdirectory)
- Contains: Tool components, definitions, and optional validation profiles
- Key files: `{tool-name}/index.ts` (exports ToolDefinition), `{tool-name}/{ToolName}Tool.tsx` (component)
- Naming: kebab-case directory names (e.g., `ai-readiness`, `leadership-dna`, `vision-canvas`)

**src/store/:**
- Purpose: Global state management
- Contains: Zustand store with persist middleware
- Key files: `workspaceStore.ts` (single store)

**src/registry/:**
- Purpose: Tool registration and discovery
- Contains: Tool registry interface, registration orchestration
- Key files: `ToolRegistry.ts` (interface/functions), `registry.ts` (init with all tools)

**src/engine/:**
- Purpose: Cross-tool synthesis and AI consultation
- Contains: Synthesis rule definitions, orchestration, AI integration
- Key files: `synthesis.ts` (rule execution), `rules.ts` (E1-E5 rules), `cloud.ts` (Gemini API)

**src/validation/:**
- Purpose: Workspace validation at import time
- Contains: Per-tool validation profiles, validator orchestration
- Key files: `validator.ts` (L0/L1/L2 orchestrator), `profiles_p*.ts` (per-tool schemas)
- Pattern: Profiles split across 3 files for maintainability

**src/lib/:**
- Purpose: Chart and library initialization
- Contains: Chart.js registration
- Key files: `charts.ts`

**src/utils/:**
- Purpose: Utility functions
- Contains: className composition, file I/O
- Key files: `cn.ts` (clsx + tailwind-merge wrapper), `fileSystem.ts` (save/load .vwcg files)

**src/scripts/:**
- Purpose: Standalone test and verification scripts
- Contains: E2E tests, verification logic, excluded from TypeScript compilation
- Key files: `verify_joe.ts`, `e2e_test_audit_fixes.ts`, `test_consult_ai.ts`

## Key File Locations

**Entry Points:**
- `src/main.tsx`: App bootstrap with registry/validation/charts init
- `src/App.tsx`: Router setup and workspace initialization
- `src/components/layout/AppShell.tsx`: Main layout and navigation

**Configuration:**
- `vite.config.ts`: Build config with @/ alias
- `tsconfig.json`: Base TypeScript settings
- `tsconfig.app.json`: App-specific TS with @/ alias (required by `verbatimModuleSyntax`)

**Core Logic:**
- `src/store/workspaceStore.ts`: Single Zustand store, persistence, synthesis orchestration
- `src/engine/synthesis.ts`: Rule orchestration
- `src/engine/rules.ts`: Cross-tool analysis rules
- `src/validation/validator.ts`: Workspace validation
- `src/registry/ToolRegistry.ts`: Tool registry interface

**Testing:**
- `src/scripts/`: Standalone scripts (not part of normal build)
- No Jest or Vitest configured; verification is manual or via standalone scripts

## Naming Conventions

**Files:**
- Components: PascalCase `.tsx` (e.g., `LeadershipDnaTool.tsx`)
- Utilities/helpers: camelCase `.ts` (e.g., `fileSystem.ts`)
- Types/interfaces: PascalCase in interfaces themselves; file can be lowercase (e.g., `types.ts` exports `ValidationResult`)
- Tool definitions: `index.ts` in tool directory, exports `{ToolName}Definition`

**Directories:**
- Tool directories: kebab-case (e.g., `ai-readiness`, `leadership-dna`, `vision-canvas`)
- Feature directories: lowercase singular (e.g., `store`, `engine`, `validation`, `registry`)

**Functions/Variables:**
- Hooks: `use*` prefix (e.g., `useWorkspaceStore`)
- Functions: camelCase (e.g., `runSynthesis`, `updateToolData`)
- Constants: UPPER_SNAKE_CASE (e.g., `STORAGE_KEY`, `LOGIC_VERSION`)
- React components: PascalCase function names

**Types/Interfaces:**
- Interfaces: PascalCase (e.g., `ToolDefinition`, `ValidationResult`, `SynthesisRule`)
- Type imports: Use `type` keyword explicitly (required by `verbatimModuleSyntax`)

## Where to Add New Code

**New Tool:**
1. Create `src/tools/{tool-id}/` directory (kebab-case)
2. Create `index.ts` exporting `ToolDefinition`:
   ```typescript
   export const myToolDefinition: ToolDefinition = {
     id: 'my-tool',
     name: 'My Tool',
     description: 'Description',
     path: '/tools/my-tool',
     icon: SomeIcon,
     component: MyToolComponent,
     validationProfileId: 'my-tool_v1' // optional
   };
   ```
3. Create `MyToolComponent.tsx` with React component
4. Register in `src/registry/registry.ts`: `import { myToolDefinition } from '../tools/my-tool'; registerTool(myToolDefinition);`
5. Optionally: Create validation profile in `src/validation/profiles_p*.ts` and register in `src/validation/index.ts`
6. Tool data automatically persists at `state.tools['my-tool']`; read via `useWorkspaceStore(s => s.tools['my-tool'])`, write via `updateToolData('my-tool', data)`

**New Synthesis Rule:**
1. Create rule object in `src/engine/rules.ts`:
   ```typescript
   export const myRule: SynthesisRule = {
     id: 'E6_my_rule',
     name: 'Rule Name',
     description: 'Description',
     execute: (workspace) => {
       // Access tools via workspace.tools[toolId]
       // Return Insight | null
     }
   };
   ```
2. Add to `rules` array in `src/engine/synthesis.ts`

**New Validation Profile:**
1. Create profile in `src/validation/profiles_p1.ts` (or p2/p3):
   ```typescript
   export const myToolProfile: ToolValidationProfile = {
     id: 'my-tool_v1',
     validate: (data) => {
       const issues: ValidationIssue[] = [];
       // Add validation logic
       return issues;
     }
   };
   ```
2. Register in `src/validation/index.ts`: `registerProfile(myToolProfile);`
3. Link to tool in tool definition: `validationProfileId: 'my-tool_v1'`

**New UI Component:**
- Shared components: `src/components/{category}/` (create if needed)
- Button/text input/etc.: `src/components/ui/`
- Tool-specific: within `src/tools/{tool-id}/`

**New Utility:**
- General utilities: `src/utils/{name}.ts`
- Export from file, import as needed
- Use `cn()` for className composition

**New API Integration:**
- Add to `src/engine/cloud.ts` or create new file in `src/lib/`
- Use optional env var pattern (e.g., `VITE_GEMINI_API_KEY`)
- Wrap in try-catch and log errors

## Special Directories

**src/scripts/:**
- Purpose: Standalone verification and testing scripts
- Generated: No
- Committed: Yes
- Notes: Run outside normal build; not included in TypeScript compilation. Used for E2E testing and script-based verification.

**dist/:**
- Purpose: Vite production build output
- Generated: Yes (via `npm run build`)
- Committed: No (in .gitignore)
- Notes: Deployed to Firebase Hosting

**node_modules/:**
- Purpose: npm dependencies
- Generated: Yes (via `npm install`)
- Committed: No (in .gitignore)
- Notes: Package-lock.json controls versions

**.planning/codebase/:**
- Purpose: GSD codebase analysis documents
- Generated: Yes (by /gsd:map-codebase)
- Committed: Yes
- Notes: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, STACK.md, INTEGRATIONS.md, CONCERNS.md

---

*Structure analysis: 2026-02-13*
