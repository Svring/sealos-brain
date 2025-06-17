import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  createPanelSlice,
  PanelSlice,
  PanelActions,
} from "./control/panel-slice";

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
export interface ControlStore extends PanelSlice, PanelSlice, PanelActions {
  // The store now inherits all functionality from the slices
}

export const useControlStore = create<ControlStore>()(
  subscribeWithSelector((set, get) => {
    // Create the panel slice
    const panelSlice = createPanelSlice(set as any, get as any, {} as any);

    return {
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
}
