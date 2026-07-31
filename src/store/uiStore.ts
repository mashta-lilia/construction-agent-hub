import { create } from 'zustand';

import type { ProjectFilter } from '@/types';

interface UiState {
  /** Sidebar filter of the project list; `null` means "all projects". */
  projectFilter: ProjectFilter | null;
  sidebarOpen: boolean;
  setProjectFilter: (filter: ProjectFilter | null) => void;
  toggleSidebar: () => void;
}

/**
 * Global *client* state only. Server data (projects, documents, reports) belongs
 * to `features/<name>/services` and must not be mirrored here by hand.
 */
export const useUiStore = create<UiState>((set) => ({
  projectFilter: null,
  sidebarOpen: true,
  setProjectFilter: (filter) => {
    set({ projectFilter: filter });
  },
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },
}));
