import { StateCreator } from "zustand";

// Sidebar types
export type SidebarPath =
  | "/sidebar"
  | "/sidebar/dashboard"
  | "/sidebar/graph"
  | "/sidebar/devbox"
  | "/sidebar/database"
  | "/sidebar/ai-proxy";

export type SidebarVisibilityStatus = "closed" | "open" | "pinned";

export interface SidebarState {
  // Visibility state
  visibility: {
    status: SidebarVisibilityStatus;
    pinned: boolean;
    open: boolean; // computed from status
  };

  // Resize state
  resize: {
    width: number;
    minWidth: number;
    isResizing: boolean;
  };

  // Navigation state
  navigation: {
    currentPath: SidebarPath;
    history: SidebarPath[];
  };

  // Data fetching state
  dataFetch: {
    hasInitialFetch: boolean;
    lastFetchTimestamp: number | null;
  };

  // Settings
  settings: {
    closeDelay: number;
    initialWidth: number;
  };
}

// Sidebar actions interface
export interface SidebarActions {
  // Sidebar actions
  setSidebarVisibility: (status: SidebarVisibilityStatus) => void;
  toggleSidebarPin: () => void;
  enterSidebarHotZone: () => void;
  leaveSidebar: () => void;
  enterSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
  startSidebarResize: () => void;
  stopSidebarResize: () => void;
  navigateToSidebarPath: (path: SidebarPath) => void;
  goBackInSidebar: () => void;
  markSidebarDataFetched: () => void;
  shouldRefreshSidebarData: () => boolean;
  updateSidebarSettings: (settings: Partial<SidebarState["settings"]>) => void;
}

// Combined sidebar slice interface
export interface SidebarSlice {
  sidebar: SidebarState;
}

// Default sidebar state
export const defaultSidebarState: SidebarState = {
  visibility: {
    status: "pinned",
    pinned: true,
    open: true,
  },
  resize: {
    width: 280,
    minWidth: 180,
    isResizing: false,
  },
  navigation: {
    currentPath: "/sidebar",
    history: ["/sidebar"],
  },
  dataFetch: {
    hasInitialFetch: false,
    lastFetchTimestamp: null,
  },
  settings: {
    closeDelay: 100,
    initialWidth: 280,
  },
};

// Sidebar slice creator
export const createSidebarSlice: StateCreator<
  any, // Will be the full ControlStore type
  [],
  [],
  SidebarSlice & SidebarActions
> = (set, get) => ({
  // Initial state
  sidebar: { ...defaultSidebarState },

  // Sidebar actions
  setSidebarVisibility: (status) => {
    set((state: any) => ({
      sidebar: {
        ...state.sidebar,
        visibility: {
          ...state.sidebar.visibility,
          status,
          pinned: status === "pinned",
          open: status !== "closed",
        },
      },
    }));
  },

  toggleSidebarPin: () => {
    set((state: any) => {
      const currentStatus = state.sidebar.visibility.status;
      const newStatus: SidebarVisibilityStatus =
        currentStatus === "pinned" ? "open" : "pinned";
      return {
        sidebar: {
          ...state.sidebar,
          visibility: {
            ...state.sidebar.visibility,
            status: newStatus,
            pinned: newStatus === "pinned",
            open: true, // Both "open" and "pinned" mean the sidebar is open
          },
        },
      };
    });
  },

  enterSidebarHotZone: () => {
    set((state: any) => {
      if (state.sidebar.visibility.status === "closed") {
        return {
          sidebar: {
            ...state.sidebar,
            visibility: {
              ...state.sidebar.visibility,
              status: "open",
              pinned: false,
              open: true,
            },
          },
        };
      }
      return state;
    });
  },

  leaveSidebar: () => {
    set((state: any) => {
      if (!state.sidebar.visibility.pinned) {
        // Use setTimeout to respect closeDelay
        setTimeout(() => {
          set((currentState: any) => ({
            sidebar: {
              ...currentState.sidebar,
              visibility: {
                ...currentState.sidebar.visibility,
                status: "closed",
                pinned: false,
                open: false,
              },
            },
          }));
        }, state.sidebar.settings.closeDelay);
      }
      return state;
    });
  },

  enterSidebar: () => {
    // Clear any pending close timeout - this would be handled by the component
    // The state doesn't need to change, just prevent closing
  },

  setSidebarOpen: (open) => {
    set((state: any) => {
      const newStatus: SidebarVisibilityStatus = open ? "open" : "closed";
      return {
        sidebar: {
          ...state.sidebar,
          visibility: {
            ...state.sidebar.visibility,
            status: newStatus,
            open,
            // Don't change pinned state when programmatically setting open
          },
        },
      };
    });
  },

  setSidebarWidth: (width) => {
    set((state: any) => ({
      sidebar: {
        ...state.sidebar,
        resize: {
          ...state.sidebar.resize,
          width: Math.max(width, state.sidebar.resize.minWidth),
        },
      },
    }));
  },

  startSidebarResize: () => {
    set((state: any) => ({
      sidebar: {
        ...state.sidebar,
        resize: {
          ...state.sidebar.resize,
          isResizing: true,
        },
      },
    }));
  },

  stopSidebarResize: () => {
    set((state: any) => ({
      sidebar: {
        ...state.sidebar,
        resize: {
          ...state.sidebar.resize,
          isResizing: false,
        },
      },
    }));
  },

  navigateToSidebarPath: (path) => {
    set((state: any) => ({
      sidebar: {
        ...state.sidebar,
        navigation: {
          currentPath: path,
          history: [...state.sidebar.navigation.history, path],
        },
      },
    }));
  },

  goBackInSidebar: () => {
    set((state: any) => {
      const history = state.sidebar.navigation.history;
      if (history.length > 1) {
        const newHistory = history.slice(0, -1);
        const previousPath = newHistory[newHistory.length - 1];
        return {
          sidebar: {
            ...state.sidebar,
            navigation: {
              currentPath: previousPath,
              history: newHistory,
            },
          },
        };
      }
      return state;
    });
  },

  markSidebarDataFetched: () => {
    set((state: any) => ({
      sidebar: {
        ...state.sidebar,
        dataFetch: {
          hasInitialFetch: true,
          lastFetchTimestamp: Date.now(),
        },
      },
    }));
  },

  shouldRefreshSidebarData: () => {
    const state = get();
    const { hasInitialFetch, lastFetchTimestamp } = state.sidebar.dataFetch;

    if (!hasInitialFetch) return true;
    if (!lastFetchTimestamp) return true;

    // Refresh if data is older than 5 minutes
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - lastFetchTimestamp > fiveMinutes;
  },

  updateSidebarSettings: (settings) => {
    set((state: any) => ({
      sidebar: {
        ...state.sidebar,
        settings: {
          ...state.sidebar.settings,
          ...settings,
        },
      },
    }));
  },
});
