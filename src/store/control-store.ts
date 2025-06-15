import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// Types for different panel states
export type PanelState =
  | { type: "none" }
  | { type: "node-create" }
  | { type: "devbox-create"; nodeId?: string; formData?: DevboxCreateFormData }
  | { type: "devbox-detail"; devboxName: string }
  | { type: "database-create"; nodeId?: string }
  | { type: "ai-proxy-create"; nodeId?: string };

// Form data for devbox creation
export interface DevboxCreateFormData {
  name?: string;
  templateId?: string;
  cpu?: number;
  memory?: number;
  disk?: number;
  gpu?: {
    type: string;
    count: number;
  };
}

// Viewport state
export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

// Control store interface
export interface ControlStore {
  // UI State
  panel: PanelState;
  viewport: ViewportState;
  sidebar: {
    open: boolean;
    pinned: boolean;
  };

  // Form states for different panels
  devboxCreateForm: DevboxCreateFormData;

  // Actions
  openPanel: (panel: PanelState) => void;
  closePanel: () => void;
  setViewport: (viewport: Partial<ViewportState>) => void;
  setSidebarState: (state: Partial<{ open: boolean; pinned: boolean }>) => void;

  // Form actions
  updateDevboxCreateForm: (data: Partial<DevboxCreateFormData>) => void;
  resetDevboxCreateForm: () => void;

  // AI-specific helpers
  getSerializableState: () => any;

  // Integration helpers
  syncWithNodeView: (
    activeDetailsId: string | null,
    detailsComponent: React.ReactNode | null
  ) => void;
}

const defaultDevboxCreateForm: DevboxCreateFormData = {
  name: "",
  templateId: "",
  cpu: 1,
  memory: 2,
  disk: 20,
};

export const useControlStore = create<ControlStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    panel: { type: "none" },
    viewport: { x: 0, y: 0, zoom: 1 },
    sidebar: { open: true, pinned: true },
    devboxCreateForm: { ...defaultDevboxCreateForm },

    // Actions
    openPanel: (panel) => {
      set({ panel });

      // If opening devbox-create with form data, update the form
      if (panel.type === "devbox-create" && panel.formData) {
        set({
          devboxCreateForm: { ...defaultDevboxCreateForm, ...panel.formData },
        });
      }
    },

    closePanel: () => {
      set({ panel: { type: "none" } });
      // Reset form when closing
      get().resetDevboxCreateForm();
    },

    setViewport: (viewport) => {
      set((state) => ({
        viewport: { ...state.viewport, ...viewport },
      }));
    },

    setSidebarState: (sidebarUpdate) => {
      set((state) => ({
        sidebar: { ...state.sidebar, ...sidebarUpdate },
      }));
    },

    // Form actions
    updateDevboxCreateForm: (data) => {
      set((state) => ({
        devboxCreateForm: { ...state.devboxCreateForm, ...data },
      }));
    },

    resetDevboxCreateForm: () => {
      set({ devboxCreateForm: { ...defaultDevboxCreateForm } });
    },

    // AI-specific helpers
    getSerializableState: () => {
      const state = get();
      return {
        panel: state.panel,
        viewport: state.viewport,
        sidebar: state.sidebar,
        forms: {
          devboxCreate: state.devboxCreateForm,
        },
      };
    },

    // Integration helpers
    syncWithNodeView: (activeDetailsId, detailsComponent) => {
      // This will be called by NodeViewProvider to keep control store in sync
      const currentPanel = get().panel;

      // Infer panel type from activeDetailsId
      if (!activeDetailsId) {
        if (currentPanel.type !== "none") {
          set({ panel: { type: "none" } });
        }
      } else if (activeDetailsId === "node-create") {
        if (currentPanel.type !== "node-create") {
          set({ panel: { type: "node-create" } });
        }
      } else if (activeDetailsId.startsWith("devbox-create-")) {
        const nodeId = activeDetailsId.replace("devbox-create-", "");
        if (
          currentPanel.type !== "devbox-create" ||
          currentPanel.nodeId !== nodeId
        ) {
          set({ panel: { type: "devbox-create", nodeId } });
        }
      } else if (activeDetailsId.startsWith("devbox-")) {
        const devboxName = activeDetailsId.replace("devbox-", "");
        if (
          currentPanel.type !== "devbox-detail" ||
          currentPanel.devboxName !== devboxName
        ) {
          set({ panel: { type: "devbox-detail", devboxName } });
        }
      }
    },
  }))
);

// Subscribe to panel changes to log for debugging
if (typeof window !== "undefined") {
  useControlStore.subscribe(
    (state) => state.panel,
    (panel) => {
      console.log("🎛️ Control Store: Panel changed to", panel);
    }
  );
}
