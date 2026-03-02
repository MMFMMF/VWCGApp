# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

## [1.1.0] - 2026-03-02

### Changed
- **LLM provider migrated from OpenAI to Anthropic Claude**
  - `src/engine/llm/openai-service.ts` fully rewritten to use Anthropic SDK
  - Model: `claude-sonnet-4-20250514`
  - API key env var renamed from `VITE_OPENAI_API_KEY` to `VITE_ANTHROPIC_API_KEY`
  - Response parsing updated for Anthropic content block format
  - `.env.example` updated to reflect new key name

### Updated
- `src/tools/report/ReportCenter.tsx` — 5 UI updates for Anthropic service integration
- `CLAUDE.md` — Added LLM service section, updated env var table, corrected tool count (11)
- `README.md` — Added Anthropic to architecture table, updated AI features description
- `CHANGELOG.md` — Added this entry

### Infrastructure
- `VITE_ANTHROPIC_API_KEY` set in Netlify environment variables (all scopes, all contexts)
- Git commit: `b82f2be` — pushed to `master` on GitHub (MMFMMF/VWCGApp)
- Netlify auto-deploy triggered on push

---

## [1.0.0] - 2026-01-22

### Added
- **11 Integrated Tools** for strategic planning and assessment
  - AI Readiness Assessment
  - Leadership DNA
  - Business Emotional Intelligence (BEI)
  - Vision Canvas
  - SWOT Analysis
  - SOP Suite (Taxonomy, Creation, Management)
  - 90-Day Roadmap
  - Advisor Readiness
  - Report Center
- **Cross-Tool Synthesis Engine** with 8 v2 rules for generating insights
- **Validation System** with L0-L3 validation levels
- **Workspace Persistence** with Save/Load functionality (.vwcg format)
- **Safe Mode** for protected file imports
- **Report Generation** with PDF export
- **AI Consultation** via Gemini API integration
- **Individual Export PDF buttons** for all tools
- Documentation improvements (README, CONTRIBUTING, CHANGELOG)
