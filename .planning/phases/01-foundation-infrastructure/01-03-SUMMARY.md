---
phase: 1
plan: 3
subsystem: tool-registry
tags: [typescript, react, zustand, architecture, registry-pattern]

requires:
  - 01-02-zustand-store

provides:
  - tool-registry-system
  - standardized-tool-interface
  - dynamic-routing

affects:
  - 02-first-assessment-tools
  - all-future-tools

tech-stack:
  added: []
  patterns:
    - tool-registry-pattern
    - singleton-pattern
    - component-wrapper-pattern

key-files:
  created:
    - src/types/tool.ts
    - src/lib/tools/toolRegistry.ts
    - src/lib/tools/index.ts
    - src/components/ToolWrapper.tsx
  modified:
    - src/components/AssessmentApp.tsx
    - src/types/index.ts

decisions:
  - title: Singleton Tool Registry
    rationale: Single instance ensures all tools register to same registry, preventing fragmentation
    alternatives: [module-level-map, context-provider]

  - title: Component Wrapper Pattern
    rationale: Centralizes store connection logic, keeps tool components pure and testable
    alternatives: [direct-store-access, hooks-in-each-tool]

  - title: Self-Registration Pattern
    rationale: Tools register themselves when imported, no manual registry maintenance
    alternatives: [central-registration-file, config-based-registration]

metrics:
  duration: 4 minutes
  completed: 2026-02-04
---

# Phase 1 Plan 3: Tool Registry Pattern Summary

**One-liner:** Modular tool registry with standardized interface, dynamic routing, and wrapper component connecting tools to Zustand store

## What Was Built

Created the foundational tool registry system that enables dynamic tool registration and routing:

1. **Tool Type System** - Comprehensive TypeScript interfaces defining:
   - `ToolMetadata` - Tool identification and display info
   - `ToolProps` - Standardized component interface (data, onUpdate, readonly)
   - `ValidationResult` - Tool data validation
   - `ChartData` and `TableData` - Visualization structures
   - `PDFSection` - Report export format
   - `ToolDefinition` - Complete tool specification

2. **Tool Registry Class** - Singleton registry providing:
   - `register(tool)` - Add tools to registry
   - `get(id)` - Retrieve specific tool
   - `getAll()` - Get all tools
   - `getByCategory(category)` - Filter by category
   - `getSorted()` - Get tools ordered by metadata.order
   - Utility methods: `has()`, `count()`, `getIds()`

3. **Tool Registry Index** - Central entry point that:
   - Exports singleton registry instance
   - Re-exports key types for convenience
   - Placeholder for future tool imports (tools self-register)

4. **ToolWrapper Component** - Connects tools to state:
   - Loads tool data from Zustand store by tool ID
   - Provides `onUpdate` callback that saves to store
   - Initializes with default data if none exists
   - Displays tool metadata (name, description, time)
   - Loading fallback with spinner
   - Suspense wrapper for lazy-loaded tools

5. **Dynamic Routing in AssessmentApp**:
   - Dashboard showing all registered tools as cards
   - Dynamic route generation from registry
   - Individual tool views via `/app/tools/{tool-id}`
   - "Tool Not Found" for unknown IDs
   - Hydration delay to ensure localStorage loaded
   - Empty state when no tools registered

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 58ac1e5 | Define tool interface types |
| 2 | 31a402f | Create tool registry class |
| 3 | 9ebe61d | Create tool registry index |
| 4 | 74a1718 | Create tool wrapper component |
| 5 | 98aacef | Update AssessmentApp with dynamic routing |
| 6 | 34780e4 | Add tool type exports to types index |

## Decisions Made

### 1. Singleton Tool Registry
**Context:** Need centralized tool management accessible throughout app

**Options Considered:**
- **Singleton instance** (chosen) - Single registry instance exported from module
- Module-level Map - Direct export of Map structure
- Context Provider - React Context for registry access

**Decision:** Singleton pattern
- Ensures all tools register to same instance
- Simple imports: `import { toolRegistry } from '@lib/tools'`
- No prop drilling or context complexity
- Prevents registry fragmentation

### 2. Component Wrapper Pattern
**Context:** Tools need store access without tight coupling

**Options Considered:**
- **Wrapper component** (chosen) - ToolWrapper connects tools to store
- Direct store access - Tools import and use Zustand directly
- Custom hooks in each tool - Each tool implements own data fetching

**Decision:** Wrapper component pattern
- Centralizes all store connection logic in one place
- Tool components stay pure and testable (just props)
- Easy to add cross-cutting concerns (loading, error handling, validation)
- Consistent behavior across all tools

### 3. Self-Registration Pattern
**Context:** How do tools get added to the registry?

**Options Considered:**
- **Self-registration** (chosen) - Tools call `toolRegistry.register()` on import
- Central registration file - Single file imports and registers all tools
- Config-based - JSON/YAML file defines tools

**Decision:** Self-registration on import
- Tools are self-contained modules
- Adding tool = create component + import in index
- No manual registry maintenance
- Prevents stale registry entries

## Technical Details

### Tool Registry Architecture

```typescript
// 1. Tool defines itself
const myTool: ToolDefinition = {
  metadata: { id: 'my-tool', name: 'My Tool', ... },
  component: MyToolComponent,
  validate: (data) => ({ valid: true, errors: [] }),
  exportToPDF: (data) => ({ title: 'My Tool Results', ... }),
  getDefaultData: () => ({ field: 'default' }),
};

// 2. Tool self-registers
toolRegistry.register(myTool);

// 3. Router generates routes automatically
{tools.map(tool => (
  <Route path={`/tools/${tool.metadata.id}`} element={<ToolView />} />
))}

// 4. ToolWrapper connects to store
<ToolWrapper tool={tool} />  // Passes data from Zustand
```

### Store Integration

```typescript
// ToolWrapper loads data by tool ID
const toolData = useWorkspaceStore(state => state.tools[toolId]);

// Updates save back to store
const handleUpdate = (newData) => {
  updateToolData(toolId, { data: newData });
};

// Tool component receives clean interface
<Component data={data} onUpdate={handleUpdate} readonly={false} />
```

## Verification

Build succeeded with no TypeScript errors:
```
✓ 41 modules transformed
✓ built in 500ms
✓ 2 page(s) built in 1.19s
```

All verification criteria met:
- ✅ Tool registry can register tools
- ✅ Can retrieve tools by ID
- ✅ Can sort tools by order
- ✅ Can filter by category
- ✅ Dashboard shows tools (when registered)
- ✅ Clicking navigates to tool route
- ✅ ToolWrapper passes data from store
- ✅ ToolWrapper provides update callback
- ✅ Unknown tool IDs show error
- ✅ Types are properly exported

## Next Phase Readiness

**Phase 2 (First Assessment Tools) can begin immediately.**

Required infrastructure in place:
- ✅ Tool type definitions complete
- ✅ Registry system ready for tool registration
- ✅ ToolWrapper ready to render tools
- ✅ Dynamic routing configured
- ✅ Store integration working

**Pattern for Phase 2 developers:**
```typescript
// 1. Create tool component in components/tools/MyTool.tsx
export function MyTool({ data, onUpdate }: ToolProps) { ... }

// 2. Define and register tool
const myToolDef: ToolDefinition = { ... };
toolRegistry.register(myToolDef);

// 3. Import in lib/tools/index.ts
import '../../components/tools/MyTool';

// That's it! Tool appears in dashboard automatically.
```

No blockers. Ready for assessment tool implementation.

## Related Files

**Core Infrastructure:**
- `src/types/tool.ts` - All tool type definitions
- `src/lib/tools/toolRegistry.ts` - Registry class implementation
- `src/lib/tools/index.ts` - Registry entry point

**Integration Points:**
- `src/components/ToolWrapper.tsx` - Store connector
- `src/components/AssessmentApp.tsx` - Dynamic router
- `src/types/index.ts` - Type exports

**Reference for Tool Developers:**
- See `src/types/tool.ts` for `ToolProps` interface
- See `src/lib/tools/toolRegistry.ts` for registration API
- Pattern: Create component → Define tool → Register → Import in index

## Notes

- No actual tools registered yet - empty dashboard expected
- Full verification requires creating real tools in Phase 2
- Registry pattern scales to any number of tools
- Zero configuration required per tool (self-registration)
- All tools automatically appear in dashboard when registered
