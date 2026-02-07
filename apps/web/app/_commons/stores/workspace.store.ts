import { create } from "zustand";

interface WorkspaceState {
  currentWorkspaceId: string | null;
}

interface WorkspaceActions {
  setCurrentWorkspace: (id: string) => void;
  clearCurrentWorkspace: () => void;
}

type WorkspaceStore = WorkspaceState & WorkspaceActions;

const initialState: WorkspaceState = {
  currentWorkspaceId: null,
};

export const useWorkspaceStore = create<WorkspaceStore>()(set => ({
  ...initialState,

  setCurrentWorkspace: id => set({ currentWorkspaceId: id }),

  clearCurrentWorkspace: () => set({ currentWorkspaceId: null }),
}));

// Selectors
export const selectCurrentWorkspaceId = (state: WorkspaceStore) => state.currentWorkspaceId;
