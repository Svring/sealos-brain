import { create } from "zustand";
import { User } from "@/payload-types";

// Types for tokens
interface UserTokens {
  kubeconfig?: string;
  regionToken?: string;
  appToken?: string;
  customToken?: string;
}

// Types for cached API responses
interface DevboxListData {
  data: any[];
  timestamp: number;
  regionUrl: string;
}

interface AccountData {
  amount?: any;
  authInfo?: any;
  timestamp: number;
  regionUrl: string;
}

interface SealosStore {
  // Region and user info
  regionUrl: string;
  currentUser: User | null;
  tokens: UserTokens;

  // Cached API responses
  devboxList: DevboxListData | null;
  accountData: AccountData | null;

  // Cache settings
  cacheTimeout: number; // in milliseconds

  // Actions for region and user
  setRegionUrl: (regionUrl: string) => void;
  setCurrentUser: (user: User | null) => void;
  setTokens: (tokens: UserTokens) => void;

  // Actions for devbox data
  setDevboxList: (data: any[], regionUrl: string) => void;
  getDevboxList: (regionUrl: string) => any[] | null;
  isDevboxListValid: (regionUrl: string) => boolean;
  clearDevboxList: () => void;

  // Actions for account data
  setAccountAmount: (data: any, regionUrl: string) => void;
  getAccountAmount: (regionUrl: string) => any | null;
  setAuthInfo: (data: any, regionUrl: string) => void;
  getAuthInfo: (regionUrl: string) => any | null;
  isAccountDataValid: (regionUrl: string) => boolean;
  clearAccountData: () => void;

  // Utility actions
  clearAllCache: () => void;
  isDataExpired: (timestamp: number) => boolean;

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
  devboxList: null,
  accountData: null,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes

  // Region and user actions
  setRegionUrl: (regionUrl) => set({ regionUrl }),

  setCurrentUser: (user) => {
    set({ currentUser: user });
    if (user) {
      get().updateTokenFromUser(user);
    }
  },

  setTokens: (tokens) => set({ tokens }),

  // Devbox data actions
  setDevboxList: (data, regionUrl) =>
    set({
      devboxList: {
        data,
        timestamp: Date.now(),
        regionUrl,
      },
    }),

  getDevboxList: (regionUrl) => {
    const { devboxList } = get();
    if (
      devboxList &&
      devboxList.regionUrl === regionUrl &&
      get().isDevboxListValid(regionUrl)
    ) {
      return devboxList.data;
    }
    return null;
  },

  isDevboxListValid: (regionUrl) => {
    const { devboxList } = get();
    if (!devboxList || devboxList.regionUrl !== regionUrl) {
      return false;
    }
    return !get().isDataExpired(devboxList.timestamp);
  },

  clearDevboxList: () => set({ devboxList: null }),

  // Account data actions
  setAccountAmount: (data, regionUrl) =>
    set((state) => ({
      accountData: {
        ...state.accountData,
        amount: data,
        timestamp: Date.now(),
        regionUrl,
      },
    })),

  getAccountAmount: (regionUrl) => {
    const { accountData } = get();
    if (
      accountData &&
      accountData.regionUrl === regionUrl &&
      get().isAccountDataValid(regionUrl)
    ) {
      return accountData.amount;
    }
    return null;
  },

  setAuthInfo: (data, regionUrl) =>
    set((state) => ({
      accountData: {
        ...state.accountData,
        authInfo: data,
        timestamp: Date.now(),
        regionUrl,
      },
    })),

  getAuthInfo: (regionUrl) => {
    const { accountData } = get();
    if (
      accountData &&
      accountData.regionUrl === regionUrl &&
      get().isAccountDataValid(regionUrl)
    ) {
      return accountData.authInfo;
    }
    return null;
  },

  isAccountDataValid: (regionUrl) => {
    const { accountData } = get();
    if (!accountData || accountData.regionUrl !== regionUrl) {
      return false;
    }
    return !get().isDataExpired(accountData.timestamp);
  },

  clearAccountData: () => set({ accountData: null }),

  // Utility actions
  clearAllCache: () =>
    set({
      devboxList: null,
      accountData: null,
    }),

  isDataExpired: (timestamp) => {
    const { cacheTimeout } = get();
    return Date.now() - timestamp > cacheTimeout;
  },

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
      devboxList: state.devboxList
        ? {
            dataLength: state.devboxList.data.length,
            timestamp: new Date(state.devboxList.timestamp).toISOString(),
            regionUrl: state.devboxList.regionUrl,
            isValid: !state.isDataExpired(state.devboxList.timestamp),
          }
        : null,
      accountData: state.accountData
        ? {
            hasAmount: !!state.accountData.amount,
            hasAuthInfo: !!state.accountData.authInfo,
            timestamp: new Date(state.accountData.timestamp).toISOString(),
            regionUrl: state.accountData.regionUrl,
            isValid: !state.isDataExpired(state.accountData.timestamp),
          }
        : null,
      cacheTimeout: state.cacheTimeout,
    });
    return state;
  },

  // Token management
  updateTokenFromUser: (user) => {
    const tokens: UserTokens = {};

    if (user.tokens) {
      user.tokens.forEach((token) => {
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

    set({ tokens });
  },

  hasRequiredTokens: (type) => {
    const { tokens } = get();

    switch (type) {
      case "devbox":
        return !!(tokens.kubeconfig && tokens.customToken);
      case "account":
        return !!tokens.regionToken;
      default:
        return false;
    }
  },
}));
