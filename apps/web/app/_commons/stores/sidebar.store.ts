import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
}

interface SidebarActions {
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobileOpen: () => void;
  setMobileOpen: (open: boolean) => void;
  closeMobile: () => void;
}

type SidebarStore = SidebarState & SidebarActions;

const initialState: SidebarState = {
  isCollapsed: false,
  isMobileOpen: false,
};

export const useSidebarStore = create<SidebarStore>()(
  persist(
    set => ({
      ...initialState,

      toggleCollapsed: () => set(state => ({ isCollapsed: !state.isCollapsed })),

      setCollapsed: collapsed => set({ isCollapsed: collapsed }),

      toggleMobileOpen: () => set(state => ({ isMobileOpen: !state.isMobileOpen })),

      setMobileOpen: open => set({ isMobileOpen: open }),

      closeMobile: () => set({ isMobileOpen: false }),
    }),
    {
      name: "sidebar-state",
      partialize: state => ({ isCollapsed: state.isCollapsed }),
    },
  ),
);

// Selectors
export const selectIsCollapsed = (state: SidebarStore) => state.isCollapsed;
export const selectIsMobileOpen = (state: SidebarStore) => state.isMobileOpen;
