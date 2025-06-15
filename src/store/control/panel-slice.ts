import { StateCreator } from "zustand";
import React from "react";

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

// Panel-specific data types
export interface TemplateRepository {
  kind: "LANGUAGE" | "FRAMEWORK" | "OS" | "SERVICE";
  iconId: string;
  name: string;
  uid: string;
  description: string;
}

export interface Template {
  uid: string;
  name: string;
  config: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface DevboxCreatePanelData {
  step: "template" | "resource" | "network" | "summary";
  stepA: {
    repositories: TemplateRepository[];
    templates: Template[];
    selectedRepoUid: string | null;
    selectedTemplateUid: string | null;
    loadingRepos: boolean;
    loadingTemplates: boolean;
    error: string | null;
  };
  stepB: {
    quotaData: Array<{ type: string; limit: number; used: number }>;
    loading: boolean;
    error: string | null;
  };
  stepC: {
    networks: Array<{
      networkName: string;
      portName: string;
      port: number;
      protocol: "HTTP" | "GRPC" | "WS";
      openPublicDomain: boolean;
      publicDomain: string;
      customDomain: string;
      id: string;
    }>;
  };
}

// Panel data union type
export type PanelData =
  | { type: "none" }
  | { type: "devbox-create"; data: DevboxCreatePanelData }
  | { type: "node-create"; data: any }
  | { type: "devbox-detail"; data: any }
  | { type: "database-create"; data: any }
  | { type: "ai-proxy-create"; data: any };

// Action definition for AI interaction
export interface PanelAction {
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
  }>;
  handler: (...args: any[]) => Promise<any> | any;
}

// Panel state interface
export interface PanelStateSlice {
  // Core panel state
  panel: PanelState;
  panelData: PanelData;
  panelActions: Record<string, PanelAction>;
  viewport: ViewportState;

  // Form states for different panels
  devboxCreateForm: DevboxCreateFormData;
}

// Panel actions interface
export interface PanelActions {
  // Core panel actions
  openPanel: (panel: PanelState) => void;
  closePanel: () => void;
  setViewport: (viewport: Partial<ViewportState>) => void;

  // Panel data management
  setPanelData: (data: PanelData) => void;
  updatePanelData: (updates: Partial<any>) => void;

  // Panel action management
  registerPanelActions: (actions: Record<string, PanelAction>) => void;
  clearPanelActions: () => void;

  // Specific panel data updaters
  updateDevboxCreateStepA: (
    updates: Partial<DevboxCreatePanelData["stepA"]>
  ) => void;
  updateDevboxCreateStepB: (
    updates: Partial<DevboxCreatePanelData["stepB"]>
  ) => void;
  updateDevboxCreateStepC: (
    updates: Partial<DevboxCreatePanelData["stepC"]>
  ) => void;
  setDevboxCreateStep: (step: DevboxCreatePanelData["step"]) => void;

  // Form actions
  updateDevboxCreateForm: (data: Partial<DevboxCreateFormData>) => void;
  resetDevboxCreateForm: () => void;

  // AI-specific helpers
  getSerializableState: () => any;
  getPanelActionsForAI: () => Array<PanelAction>;

  // Integration helpers
  syncWithNodeView: (
    activeDetailsId: string | null,
    detailsComponent: React.ReactNode | null
  ) => void;
}

// Combined panel slice interface
export interface PanelSlice {
  panel: PanelState;
  panelData: PanelData;
  panelActions: Record<string, PanelAction>;
  viewport: ViewportState;
  devboxCreateForm: DevboxCreateFormData;
}

// Default form data
export const defaultDevboxCreateForm: DevboxCreateFormData = {
  name: "",
  templateId: "",
  cpu: 1,
  memory: 2,
  disk: 20,
};

// Default panel data
export const defaultDevboxCreatePanelData: DevboxCreatePanelData = {
  step: "template",
  stepA: {
    repositories: [],
    templates: [],
    selectedRepoUid: null,
    selectedTemplateUid: null,
    loadingRepos: true,
    loadingTemplates: false,
    error: null,
  },
  stepB: {
    quotaData: [],
    loading: true,
    error: null,
  },
  stepC: {
    networks: [],
  },
};

// Default panel state
export const defaultPanelState: PanelSlice = {
  panel: { type: "none" },
  panelData: { type: "none" },
  panelActions: {},
  viewport: { x: 0, y: 0, zoom: 1 },
  devboxCreateForm: { ...defaultDevboxCreateForm },
};

// Panel slice creator
export const createPanelSlice: StateCreator<
  any, // Will be the full ControlStore type
  [],
  [],
  PanelSlice & PanelActions
> = (set, get) => ({
  // Initial state
  ...defaultPanelState,

  // Core panel actions
  openPanel: (panel: PanelState) => {
    set({ panel });

    // Initialize panel data based on panel type
    if (panel.type === "devbox-create") {
      set({
        panelData: {
          type: "devbox-create",
          data: { ...defaultDevboxCreatePanelData },
        },
      });

      // If opening devbox-create with form data, update the form
      if (panel.formData) {
        set({
          devboxCreateForm: {
            ...defaultDevboxCreateForm,
            ...panel.formData,
          },
        });
      }
    } else {
      set({ panelData: { type: panel.type as any } });
    }
  },

  closePanel: () => {
    set({
      panel: { type: "none" },
      panelData: { type: "none" },
      panelActions: {},
    });
    // Reset form when closing
    get().resetDevboxCreateForm();
  },

  setViewport: (viewport: Partial<ViewportState>) => {
    set((state: any) => ({
      viewport: { ...state.viewport, ...viewport },
    }));
  },

  // Panel data management
  setPanelData: (data: PanelData) => {
    set({ panelData: data });
  },

  updatePanelData: (updates: Partial<any>) => {
    set((state: any) => {
      if (state.panelData.type === "none") return state;

      return {
        panelData: {
          ...state.panelData,
          data: { ...state.panelData.data, ...updates },
        },
      };
    });
  },

  // Panel action management
  registerPanelActions: (actions: Record<string, PanelAction>) => {
    set({ panelActions: actions });
  },

  clearPanelActions: () => {
    set({ panelActions: {} });
  },

  // Specific panel data updaters
  updateDevboxCreateStepA: (
    updates: Partial<DevboxCreatePanelData["stepA"]>
  ) => {
    set((state: any) => {
      if (state.panelData.type !== "devbox-create") {
        console.log(
          "⚠️ Panel Slice - Cannot update stepA: panel type is not devbox-create",
          state.panelData.type
        );
        return state;
      }

      console.log("📊 Panel Slice - Updating stepA data:", {
        repositories: updates.repositories?.length || 0,
        templates: updates.templates?.length || 0,
        selectedRepoUid: updates.selectedRepoUid,
        selectedTemplateUid: updates.selectedTemplateUid,
        loadingRepos: updates.loadingRepos,
        loadingTemplates: updates.loadingTemplates,
      });

      return {
        panelData: {
          ...state.panelData,
          data: {
            ...state.panelData.data,
            stepA: { ...state.panelData.data.stepA, ...updates },
          },
        },
      };
    });
  },

  updateDevboxCreateStepB: (
    updates: Partial<DevboxCreatePanelData["stepB"]>
  ) => {
    set((state: any) => {
      if (state.panelData.type !== "devbox-create") return state;

      return {
        panelData: {
          ...state.panelData,
          data: {
            ...state.panelData.data,
            stepB: { ...state.panelData.data.stepB, ...updates },
          },
        },
      };
    });
  },

  updateDevboxCreateStepC: (
    updates: Partial<DevboxCreatePanelData["stepC"]>
  ) => {
    set((state: any) => {
      if (state.panelData.type !== "devbox-create") return state;

      return {
        panelData: {
          ...state.panelData,
          data: {
            ...state.panelData.data,
            stepC: { ...state.panelData.data.stepC, ...updates },
          },
        },
      };
    });
  },

  setDevboxCreateStep: (step: DevboxCreatePanelData["step"]) => {
    set((state: any) => {
      if (state.panelData.type !== "devbox-create") return state;

      return {
        panelData: {
          ...state.panelData,
          data: {
            ...state.panelData.data,
            step,
          },
        },
      };
    });
  },

  // Form actions
  updateDevboxCreateForm: (data: Partial<DevboxCreateFormData>) => {
    set((state: any) => ({
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
      panelData: state.panelData,
      viewport: state.viewport,
      sidebar: state.sidebar,
      forms: {
        devboxCreate: state.devboxCreateForm,
      },
    };
  },

  getPanelActionsForAI: () => {
    const state = get();
    return Object.values(state.panelActions);
  },

  // Integration helpers
  syncWithNodeView: (
    activeDetailsId: string | null,
    detailsComponent: React.ReactNode | null
  ) => {
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
        (currentPanel.type === "devbox-create" &&
          currentPanel.nodeId !== nodeId)
      ) {
        set({ panel: { type: "devbox-create", nodeId } });
      }
    } else if (activeDetailsId.startsWith("devbox-")) {
      const devboxName = activeDetailsId.replace("devbox-", "");
      if (
        currentPanel.type !== "devbox-detail" ||
        (currentPanel.type === "devbox-detail" &&
          currentPanel.devboxName !== devboxName)
      ) {
        set({ panel: { type: "devbox-detail", devboxName } });
      }
    }
  },
});
