---
wave: 2
depends_on:
  - 01-PLAN-marketing-landing
files_modified:
  - src/lib/auth/inviteCode.ts
  - src/stores/authStore.ts
  - src/components/auth/InviteGate.tsx
  - src/pages/app/[...tool].astro
  - src/pages/invite.astro
autonomous: true
---

# Plan: Access Control Gate (Invite Code System)

## Objective

Implement invite-only access to assessment tools while keeping the landing page and blog publicly accessible. Simple invite code validation with session persistence.

## Tasks

### Task 1: Create Invite Code Utilities

**Action:** Create utility functions for invite code generation and validation
**Files:** src/lib/auth/inviteCode.ts
**Details:**

```typescript
// Simple invite code system - codes stored in environment or config
// For MVP: hardcoded list, later: database or API validation

const VALID_CODES = new Set([
  'VWCG-DEMO-2026',
  'VWCG-BETA-001',
  'VWCG-BETA-002',
  'VWCG-BETA-003',
  'VWCG-PARTNER-001',
  // Add more codes as needed
]);

// Check if running in development mode
const isDev = import.meta.env.DEV;

export function validateInviteCode(code: string): boolean {
  // In development, accept any non-empty code for testing
  if (isDev && code.trim().length > 0) {
    return true;
  }

  // Normalize code: uppercase, trim whitespace
  const normalizedCode = code.toUpperCase().trim();
  return VALID_CODES.has(normalizedCode);
}

export function generateInviteCode(prefix: string = 'VWCG'): string {
  // Generate a random code for new invites
  // Format: PREFIX-XXXX-XXXX
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes ambiguous chars
  const segment1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const segment2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${segment1}-${segment2}`;
}

export function formatInviteCode(code: string): string {
  // Format code for display (uppercase with dashes)
  return code.toUpperCase().trim();
}
```

### Task 2: Create Auth Store

**Action:** Create Zustand store for auth state with sessionStorage persistence
**Files:** src/stores/authStore.ts
**Details:**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  // ACC-04: Session persistence
  isAuthenticated: boolean;
  inviteCode: string | null;
  authenticatedAt: number | null;

  // Actions
  authenticate: (code: string) => void;
  logout: () => void;
  checkSession: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      inviteCode: null,
      authenticatedAt: null,

      authenticate: (code: string) => {
        set({
          isAuthenticated: true,
          inviteCode: code.toUpperCase().trim(),
          authenticatedAt: Date.now()
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          inviteCode: null,
          authenticatedAt: null
        });
      },

      checkSession: () => {
        const state = get();
        // Session valid for 24 hours
        const SESSION_DURATION = 24 * 60 * 60 * 1000;

        if (!state.isAuthenticated || !state.authenticatedAt) {
          return false;
        }

        const elapsed = Date.now() - state.authenticatedAt;
        if (elapsed > SESSION_DURATION) {
          // Session expired, clear auth
          get().logout();
          return false;
        }

        return true;
      }
    }),
    {
      name: 'vwcg-auth',
      storage: createJSONStorage(() => sessionStorage), // ACC-04: sessionStorage
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        inviteCode: state.inviteCode,
        authenticatedAt: state.authenticatedAt
      })
    }
  )
);
```

### Task 3: Create Invite Gate Component

**Action:** Create React component that wraps protected content
**Files:** src/components/auth/InviteGate.tsx
**Details:**

```typescript
import { useState, useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@stores/authStore';
import { validateInviteCode } from '@lib/auth/inviteCode';

interface InviteGateProps {
  children: ReactNode;
  fallbackUrl?: string;
}

export default function InviteGate({ children, fallbackUrl = '/invite' }: InviteGateProps) {
  const { isAuthenticated, checkSession, authenticate } = useAuthStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if session is valid on mount
    const valid = checkSession();
    setIsLoading(false);

    // Check for code in URL params (for direct links)
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('code');
    if (urlCode && !valid) {
      handleSubmit(urlCode);
    }
  }, []);

  const handleSubmit = async (submitCode?: string) => {
    const codeToValidate = submitCode || code;
    setError(null);

    if (!codeToValidate.trim()) {
      setError('Please enter an invite code');
      return;
    }

    if (validateInviteCode(codeToValidate)) {
      authenticate(codeToValidate);
    } else {
      setError('Invalid invite code. Please check and try again.');
    }
  };

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  // ACC-02: If authenticated, show protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // ACC-02: Show invite code entry form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold text-gray-900">Invite Required</h1>
            <p className="mt-2 text-gray-600">
              Enter your invite code to access the assessment tools.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="invite-code" className="block text-sm font-medium text-gray-700 mb-1">
                Invite Code
              </label>
              <input
                id="invite-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VWCG-XXXX-XXXX"
                className={`w-full px-4 py-3 text-lg font-mono tracking-wider border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                autoComplete="off"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Access Tools
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have a code?{' '}
              <a href="/#contact" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Request access
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
```

### Task 4: Update App Page to Use Gate

**Action:** Wrap app page with InviteGate component
**Files:** src/pages/app/[...tool].astro
**Details:**

Modify the existing app page to wrap content with InviteGate:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import AssessmentApp from '../../components/AssessmentApp';
import InviteGate from '../../components/auth/InviteGate';
---

<BaseLayout title="Assessment Tools">
  <InviteGate client:load>
    <AssessmentApp client:only="react" />
  </InviteGate>
</BaseLayout>
```

### Task 5: Create Dedicated Invite Page

**Action:** Create standalone invite entry page
**Files:** src/pages/invite.astro
**Details:**

```astro
---
import MarketingLayout from '../layouts/MarketingLayout.astro';
import InviteGate from '../components/auth/InviteGate';
---

<MarketingLayout
  title="Enter Invite Code"
  description="Enter your invite code to access VWCGApp assessment tools."
>
  <InviteGate client:load fallbackUrl="/invite">
    <script>
      // If authenticated, redirect to app
      window.location.href = '/app';
    </script>
    <div class="min-h-screen flex items-center justify-center">
      <p>Redirecting to app...</p>
    </div>
  </InviteGate>
</MarketingLayout>
```

### Task 6: Verify Build

**Action:** Run build to verify no errors
**Files:** N/A

## Verification

- [ ] Landing page (/) is accessible without invite code (ACC-01)
- [ ] App page (/app) shows invite code form when not authenticated (ACC-02)
- [ ] Valid invite code grants access to assessment tools (ACC-03)
- [ ] Invalid invite code shows error message
- [ ] Session persists in sessionStorage (ACC-04)
- [ ] Closing and reopening browser tab maintains session
- [ ] Session expires after 24 hours (configurable)
- [ ] Logout clears session
- [ ] Code in URL parameter auto-validates (?code=XXXX)
- [ ] Build completes successfully

## Must-Haves

- ACC-01: Public landing page and blog accessible without invite
- ACC-02: Assessment tools gated behind invite code entry
- ACC-03: Simple invite code generation and validation
- ACC-04: Session persistence for validated users (sessionStorage)
