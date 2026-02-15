# VWCGApp

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)

> **Strategic Assessment Platform for Executives and Advisors**

VWCGApp (Value-Weighted Capability Gap Application) is a React-based platform for evaluating organizational readiness, identifying strategic risks, and creating actionable roadmaps.

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
http://localhost:5173
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

2. Add your API keys (optional, for AI features):
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

> **Note**: The app works without an API key, but AI Consultation features will be disabled.

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
| **Report Center** | PDF export of all tools |

---

## Architecture

| Layer | Technology |
|-------|------------|
| **Framework** | React 19 + TypeScript 5.9 |
| **Build** | Vite 7.2 |
| **Styling** | TailwindCSS 3.4 |
| **State** | Zustand 5.0 (global store with provenance) |
| **Charts** | Chart.js + D3.js |
| **PDF** | jsPDF + html2canvas |

### Key Systems
- **Synthesis Engine** – 5 cross-tool rules generate real-time insights
- **Validation** – L0-L3 validation with 20+ error codes
- **Safe Mode** – Protected import workflow for workspace files

---

## Documentation

📚 **[Full Technical Documentation](./docs/documentation.md)** – Architecture, tool reference, API contracts, and schemas.

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:
- Development setup
- Code style guidelines
- Pull request process

---

## License

This project is licensed under the MIT License – see the [LICENSE](./LICENSE) file for details.

---

Built with ❤️ using React + TypeScript + Vite
