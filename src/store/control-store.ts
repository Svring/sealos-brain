import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  createSidebarSlice,
  SidebarSlice,
  SidebarActions,
  SidebarPath,
  SidebarVisibilityStatus,
  SidebarState,
} from "./control/sidebar-slice";
import {
  createPanelSlice,
  PanelSlice,
  PanelActions,
  PanelState,
  PanelData,
  DevboxCreateFormData,
  ViewportState,
  TemplateRepository,
  Template,
  DevboxCreatePanelData,
  PanelAction,
} from "./control/panel-slice";

// Re-export types for backward compatibility
export type {
  SidebarPath,
  SidebarVisibilityStatus,
  SidebarState,
} from "./control/sidebar-slice";

export type {
  PanelState,
  PanelData,
  DevboxCreateFormData,
  ViewportState,
  TemplateRepository,
  Template,
  DevboxCreatePanelData,
  PanelAction,
} from "./control/panel-slice";

// Control store interface
export interface ControlStore
  extends SidebarSlice,
    SidebarActions,
    PanelSlice,
    PanelActions {
  // The store now inherits all functionality from the slices
}

export const useControlStore = create<ControlStore>()(
  subscribeWithSelector((set, get) => {
    // Create the sidebar slice
    const sidebarSlice = createSidebarSlice(set as any, get as any, {} as any);

    // Create the panel slice
    const panelSlice = createPanelSlice(set as any, get as any, {} as any);

    return {
      // Sidebar slice
      ...sidebarSlice,

      // Panel slice
      ...panelSlice,
    };
  })
);

// Subscribe to panel changes to log for debugging
if (typeof window !== "undefined") {
  useControlStore.subscribe(
    (state) => state.panel,
    (panel) => {
      console.log("🎛️ Control Store: Panel changed to", panel);
    }
  );

  useControlStore.subscribe(
    (state) => state.panelData,
    (panelData) => {
      console.log("📊 Control Store: Panel data changed to", panelData);
    }
  );

  useControlStore.subscribe(
    (state) => state.sidebar,
    (sidebar) => {
      console.log("📱 Control Store: Sidebar state changed to", sidebar);
    }
  );
}
