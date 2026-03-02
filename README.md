# VWCGApp

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)

> **Strategic Assessment Platform for Executives and Advisors**

VWCGApp (Value-Weighted Capability Gap Application) is a React-based platform for evaluating organizational readiness, identifying strategic risks, and creating actionable roadmaps. Live at **https://vwcg.app**.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Features](#features)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:4321
```

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18.0+ |
| npm | 9.0+ |

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys:
   ```
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-...   # Required for AI Strategic Briefing
   VITE_GEMINI_API_KEY=your_key_here          # Optional: enables AI Consultation tab
   ```

3. **Production (Netlify):** Set both keys in Netlify → Project configuration → Environment variables for site `sparkly-speculoos-87b564`. Keys are never committed to the repo.

> **Note**: The app runs without API keys but AI Strategic Briefing (Report Center) and AI Consultation will be disabled.

---

## Features

| Tool | Purpose |
|:-----|:--------|
| **AI Readiness** | Assess organizational AI maturity across 6 dimensions |
| **Leadership DNA** | 6-dimension leadership radar (Current vs Target) |
| **BEI** | Business Emotional Intelligence tracking over time |
| **Vision Canvas** | North Star, strategic pillars, core values |
| **SWOT Analysis** | Strengths, Weaknesses, Opportunities, Threats |
| **SOP Suite** | Taxonomy, creation, and management of SOPs |
| **90-Day Roadmap** | Task planning with dependencies (weeks 1-12) |
| **Advisor Readiness** | 4-tab diagnostic with ROI projections |
| **Report Center** | PDF export + Claude-powered AI Strategic Briefing |

---

## Architecture

| Layer | Technology |
|-------|------------|
| **Framework** | Astro 5 + React 19 + TypeScript 5.9 |
| **Build** | Vite 7.2 |
| **Styling** | TailwindCSS 3.4 |
| **State** | Zustand 5.0 (global store with provenance) |
| **Charts** | Chart.js + D3.js |
| **PDF** | jsPDF + html2canvas |
| **AI Briefing** | Anthropic Claude (`claude-sonnet-4-20250514`) |
| **AI Consultation** | Google Gemini 1.5 Flash (optional) |

### Key Systems
- **Synthesis Engine** — 8 cross-tool v2 rules generate real-time insights on every data change
- **LLM Service** — Anthropic Claude generates executive-level strategic briefings in Report Center
- **Validation** — L0-L3 validation with 20+ error codes
- **Safe Mode** — Protected import workflow for workspace files (`.vwcg` format)

---

## Documentation

📚 **[Full Technical Documentation](./docs/documentation.md)** — Architecture, tool reference, API contracts, and schemas.

📋 **[CLAUDE.md](./CLAUDE.md)** — Guidance for Claude Code: commands, architecture deep-dive, conventions.

---

## Contributing

Please see our [Contributing Guide](./CONTRIBUTING.md) for development setup, code style, and PR process.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

Built with React + TypeScript + Astro + Anthropic Claude
