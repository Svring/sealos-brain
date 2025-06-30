import { create } from "zustand";
import type { User } from "@/payload-types";

// Types for tokens
interface UserTokens {
  kubeconfig?: string;
  regionToken?: string;
  appToken?: string;
  customToken?: string;
}

interface SealosStore {
  // Region and user info
  regionUrl: string;
  currentUser: User | null;
  tokens: UserTokens;
  currentGraphName: string | null;

  // Actions for region and user
  setRegionUrl: (regionUrl: string) => void;
  setCurrentUser: (user: User | null) => void;
  setTokens: (tokens: UserTokens) => void;
  setCurrentGraphName: (graphName: string | null) => void;
  // Debug function to print store state
  debugPrintState: () => void;

  // Token management
  updateTokenFromUser: (user: User) => void;
  hasRequiredTokens: (type: "devbox" | "account") => boolean;
}

export const useSealosStore = create<SealosStore>((set, get) => ({
  // Initial state
  regionUrl: "bja.sealos.run", // Set default region URL
  currentUser: null,
  tokens: {},
  currentGraphName: null,

  // Region and user actions
  setRegionUrl: (regionUrl) => set({ regionUrl }),

  setCurrentUser: (user) => {
    set({ currentUser: user });
    if (user) {
      get().updateTokenFromUser(user);
    }
  },

  setTokens: (tokens) => set({ tokens }),

  setCurrentGraphName: (graphName) => set({ currentGraphName: graphName }),

  // Debug function to print store state
  debugPrintState: () => {
    const state = get();
    return state;
  },

  // Token management
  updateTokenFromUser: (user) => {
    const tokens: UserTokens = {};

    if (user.tokens) {
      for (const token of user.tokens) {
        switch (token.type) {
          case "kubeconfig":
            tokens.kubeconfig = token.value;
            break;
          case "region_token":
            tokens.regionToken = token.value;
            break;
          case "app_token":
            tokens.appToken = token.value;
            break;
          case "custom":
            tokens.customToken = token.value;
            break;
          default:
            break;
        }
      }
    }

    set({ tokens });
  },

  hasRequiredTokens: (type) => {
    const { tokens } = get();

    switch (type) {
      case "devbox": {
        const hasDevboxTokens = !!(tokens.kubeconfig && tokens.customToken);
        return hasDevboxTokens;
      }
      case "account": {
        const hasAccountTokens = !!tokens.regionToken;
        return hasAccountTokens;
      }
      default:
        return false;
    }
  },
}));
