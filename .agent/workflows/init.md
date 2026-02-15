---
description: Initialize workspace and display project summary
---

# VWCG App Initialization Workflow

This workflow initializes the agent workspace and displays a summary of the project status.

## Steps

1. **Display Project Summary**
   
   Show the user a brief summary of the VWCGApp project including:
   - Project name and purpose
   - Technology stack
   - Available npm scripts
   - Key directories and their purposes
   - Registered tools

2. **Check Development Server Status**
   
   // turbo
   ```bash
   npm run dev --help
   ```

3. **List Recent Conversations** (if available)
   
   Reference the conversation history to identify ongoing work.

---

## Project Quick Reference

**VWCGApp** (Value-Weighted Capability Gap Application) is a React-based strategic assessment platform.

### Tech Stack
- **Framework**: React 19 + TypeScript 5.9
- **Build**: Vite 7.2
- **Styling**: TailwindCSS 3.4
- **State**: Zustand 5.0
- **Charts**: Chart.js + D3.js
- **PDF**: jsPDF + html2canvas

### NPM Scripts
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Key Directories
```
src/
├── components/   # Shared UI components
├── engine/       # Synthesis + AI integration
├── registry/     # Tool registration
├── store/        # Zustand state
├── tools/        # 11 Tool implementations
├── validation/   # Data validation
└── lib/          # Utilities
```

### Registered Tools
1. AI Readiness Assessment
2. Leadership DNA
3. Business Emotional Intelligence (BEI)
4. Vision Canvas
5. SWOT Analysis
6. SOP Taxonomy
7. SOP Creation
8. SOP Management
9. 90-Day Roadmap
10. Advisor Readiness
11. Report Center

### Documentation
Full technical documentation: `docs/documentation.md`
