import { create } from "zustand";
import { User } from "@/payload-types";

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

  // Actions for region and user
  setRegionUrl: (regionUrl: string) => void;
  setCurrentUser: (user: User | null) => void;
  setTokens: (tokens: UserTokens) => void;

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

  // Region and user actions
  setRegionUrl: (regionUrl) => set({ regionUrl }),

  setCurrentUser: (user) => {
    set({ currentUser: user });
    if (user) {
      get().updateTokenFromUser(user);
    }
  },

  setTokens: (tokens) => set({ tokens }),

  // Debug function to print store state
  debugPrintState: () => {
    const state = get();
    console.log("🔍 Sealos Store State:", {
      regionUrl: state.regionUrl,
      currentUser: state.currentUser
        ? {
            id: state.currentUser.id,
            email: state.currentUser.email,
            username: state.currentUser.username,
            tokensCount: state.currentUser.tokens?.length || 0,
          }
        : null,
      tokens: state.tokens,
    });
    return state;
  },

  // Token management
  updateTokenFromUser: (user) => {
    const tokens: UserTokens = {};

    if (user.tokens) {
      user.tokens.forEach((token) => {
        console.log(
          `🔑 Processing token: ${token.type} = ${token.value ? "present" : "missing"}`
        );
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
        }
      });
    }

    console.log("🔑 Final tokens object:", {
      kubeconfig: tokens.kubeconfig ? "present" : "missing",
      regionToken: tokens.regionToken ? "present" : "missing",
      appToken: tokens.appToken ? "present" : "missing",
      customToken: tokens.customToken ? "present" : "missing",
    });

    set({ tokens });
  },

  hasRequiredTokens: (type) => {
    const { tokens } = get();

    console.log(`🔍 Checking required tokens for ${type}:`, {
      kubeconfig: tokens.kubeconfig ? "present" : "missing",
      customToken: tokens.customToken ? "present" : "missing",
      regionToken: tokens.regionToken ? "present" : "missing",
    });

    switch (type) {
      case "devbox":
        const hasDevboxTokens = !!(tokens.kubeconfig && tokens.customToken);
        console.log(`✅ Has devbox tokens: ${hasDevboxTokens}`);
        return hasDevboxTokens;
      case "account":
        const hasAccountTokens = !!tokens.regionToken;
        console.log(`✅ Has account tokens: ${hasAccountTokens}`);
        return hasAccountTokens;
      default:
        return false;
    }
  },
}));
