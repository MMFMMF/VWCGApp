---
wave: 1
depends_on: []
files_modified:
  - package.json
  - astro.config.mjs
  - tsconfig.json
  - tailwind.config.mjs
  - src/styles/global.css
  - src/layouts/BaseLayout.astro
  - src/layouts/AppLayout.astro
  - src/pages/index.astro
  - src/pages/app/[...tool].astro
  - .gitignore
  - .env.example
autonomous: true
---

# Plan: Project Setup

## Objective

Initialize Astro 5 project with React integration, Tailwind CSS 4, TypeScript, and the foundational file structure. This establishes the hybrid architecture where marketing pages are pure Astro (static HTML) and assessment tools use React islands.

## Tasks

### Task 1: Initialize Astro Project

**Action:** Create new Astro 5 project with React and Tailwind integrations
**Files:** package.json, astro.config.mjs
**Details:**

```bash
npm create astro@latest . -- --template minimal --typescript strict
npx astro add react tailwind
npm install react-router-dom@6
```

Configure astro.config.mjs:
```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    react(),
    tailwind()
  ],
  output: 'static',
  vite: {
    ssr: {
      external: ['zustand']
    }
  }
});
```

### Task 2: Configure TypeScript

**Action:** Set up strict TypeScript with path aliases
**Files:** tsconfig.json
**Details:**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@lib/*": ["src/lib/*"],
      "@stores/*": ["src/stores/*"],
      "@types/*": ["src/types/*"]
    },
    "strict": true,
    "skipLibCheck": true
  }
}
```

### Task 3: Configure Tailwind CSS

**Action:** Set up Tailwind CSS 4 with custom configuration
**Files:** tailwind.config.mjs, src/styles/global.css
**Details:**

tailwind.config.mjs:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        }
      }
    },
  },
  plugins: [],
}
```

src/styles/global.css:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }
}
```

### Task 4: Create Base Layouts

**Action:** Create Astro layouts for marketing and app sections
**Files:** src/layouts/BaseLayout.astro, src/layouts/AppLayout.astro
**Details:**

BaseLayout.astro - shared HTML structure with head, meta tags
AppLayout.astro - thin wrapper for React island (minimal HTML, loads React app)

### Task 5: Create Route Structure

**Action:** Set up file-based routing with React island catch-all
**Files:** src/pages/index.astro, src/pages/app/[...tool].astro
**Details:**

- index.astro: Pure Astro marketing homepage placeholder
- app/[...tool].astro: Renders single React island with `client:only="react"` directive

```astro
---
// src/pages/app/[...tool].astro
import AppLayout from '../../layouts/AppLayout.astro';
import AssessmentApp from '../../components/AssessmentApp';
---
<AppLayout title="VWCGApp">
  <AssessmentApp client:only="react" />
</AppLayout>
```

### Task 6: Create Project Configuration Files

**Action:** Set up environment and git configuration
**Files:** .env.example, .gitignore
**Details:**

.env.example:
```
PUBLIC_APP_NAME="VWCGApp"
PUBLIC_APP_VERSION="1.0.0"
```

.gitignore should exclude:
- node_modules
- dist
- .env (not .env.example)
- .astro

### Task 7: Create Placeholder AssessmentApp Component

**Action:** Create minimal React entry point for the app section
**Files:** src/components/AssessmentApp.tsx
**Details:**

Basic React component with BrowserRouter setup:
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function AssessmentApp() {
  return (
    <BrowserRouter basename="/app">
      <div className="min-h-screen bg-gray-50">
        <h1>VWCGApp Assessment Platform</h1>
        {/* Routes will be added by tool registry */}
      </div>
    </BrowserRouter>
  );
}
```

## Verification

- [ ] `npm run dev` starts development server without errors
- [ ] Visiting `/` shows Astro marketing page placeholder
- [ ] Visiting `/app` loads React island with "VWCGApp Assessment Platform"
- [ ] TypeScript compilation succeeds with `npx tsc --noEmit`
- [ ] Tailwind classes render correctly (e.g., `bg-gray-50` applies)
- [ ] Path aliases work (e.g., `import X from '@/lib/foo'`)
- [ ] `npm run build` produces static output in `dist/`

## Must-Haves

- Astro 5 with React integration configured
- TypeScript strict mode with path aliases
- Tailwind CSS 4 working with custom config
- File-based routing with React island catch-all for /app/*
- Clean separation: marketing pages (Astro) vs app (React)
