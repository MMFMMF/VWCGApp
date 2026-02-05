import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';

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

// SSR-safe storage that only uses sessionStorage on the client
const getSessionStorage = (): StateStorage => {
  // Return a no-op storage during SSR
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    };
  }
  return sessionStorage;
};

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
      storage: createJSONStorage(getSessionStorage), // ACC-04: SSR-safe sessionStorage
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        inviteCode: state.inviteCode,
        authenticatedAt: state.authenticatedAt
      }),
      skipHydration: false
    }
  )
);
