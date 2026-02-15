/**
 * Zustand store for transient UI state
 *
 * This store manages ephemeral UI state that should NOT be persisted
 * to localStorage (unlike the workspace store).
 *
 * Examples: modals, loading states, current view, etc.
 */

import { create } from 'zustand';
import type { ToolId } from '../types/workspace';

/**
 * UI state interface
 */
interface UIState {
  /** Currently active tool view */
  currentTool: ToolId | null;

  /** Whether a modal is open */
  isModalOpen: boolean;

  /** Type of modal currently open */
  modalType: 'export' | 'import' | 'clear' | null;

  /** Loading state for async operations */
  isLoading: boolean;

  /** Loading message to display */
  loadingMessage?: string;

  /** Sidebar collapsed state */
  isSidebarCollapsed: boolean;

  /** Current theme (for future dark mode support) */
  theme: 'light' | 'dark';
}

/**
 * UI actions interface
 */
interface UIActions {
  /** Set the current active tool */
  setCurrentTool: (toolId: ToolId | null) => void;

  /** Open a modal */
  openModal: (modalType: 'export' | 'import' | 'clear') => void;

  /** Close any open modal */
  closeModal: () => void;

  /** Set loading state */
  setLoading: (isLoading: boolean, message?: string) => void;

  /** Toggle sidebar collapsed state */
  toggleSidebar: () => void;

  /** Set theme */
  setTheme: (theme: 'light' | 'dark') => void;

  /** Reset UI to initial state */
  resetUI: () => void;
}

/**
 * Combined UI store type
 */
type UIStore = UIState & UIActions;

/**
 * Initial UI state
 */
const initialUIState: UIState = {
  currentTool: null,
  isModalOpen: false,
  modalType: null,
  isLoading: false,
  loadingMessage: undefined,
  isSidebarCollapsed: false,
  theme: 'light',
};

/**
 * Create the UI store
 */
export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  ...initialUIState,

  // Actions
  setCurrentTool: (toolId) => {
    set({ currentTool: toolId });
  },

  openModal: (modalType) => {
    set({
      isModalOpen: true,
      modalType,
    });
  },

  closeModal: () => {
    set({
      isModalOpen: false,
      modalType: null,
    });
  },

  setLoading: (isLoading, message) => {
    set({
      isLoading,
      loadingMessage: message,
    });
  },

  toggleSidebar: () => {
    set((state) => ({
      isSidebarCollapsed: !state.isSidebarCollapsed,
    }));
  },

  setTheme: (theme) => {
    set({ theme });
  },

  resetUI: () => {
    set(initialUIState);
  },
}));
