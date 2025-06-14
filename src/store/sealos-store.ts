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
interface CachedData {
  data: any;
  timestamp: number;
  regionUrl: string;
}

interface DevboxEndpoints {
  getDevboxList: CachedData | null;
  checkReady: CachedData | null;
  getDevboxByName: CachedData | null;
  getSSHConnectionInfo: CachedData | null;
  createDevbox: CachedData | null;
  delDevbox: CachedData | null;
  delDevboxVersionByName: CachedData | null;
  editDevboxVersion: CachedData | null;
  execCommandInDevboxPod: CachedData | null;
  getAppsByDevboxId: CachedData | null;
  getDevboxPodsByDevboxName: CachedData | null;
  getDevboxVersionList: CachedData | null;
  getEnv: CachedData | null;
  releaseDevbox: CachedData | null;
  restartDevbox: CachedData | null;
  startDevbox: CachedData | null;
  shutdownDevbox: CachedData | null;
  updateDevbox: CachedData | null;
  getMonitorData: CachedData | null;
  templateRepositoryDelete: CachedData | null;
  templateRepositoryGet: CachedData | null;
  templateRepositoryList: CachedData | null;
  templateRepositoryListOfficial: CachedData | null;
  templateRepositoryListPrivate: CachedData | null;
  templateRepositoryTagList: CachedData | null;
  templateRepositoryTemplateDelete: CachedData | null;
  templateRepositoryTemplateGetConfig: CachedData | null;
  templateRepositoryTemplateList: CachedData | null;
  templateRepositoryUpdate: CachedData | null;
  templateRepositoryWithTemplateCreate: CachedData | null;
  templateRepositoryWithTemplateUpdate: CachedData | null;
}

interface AccountEndpoints {
  getAmount: CachedData | null;
}

interface AuthEndpoints {
  info: CachedData | null;
}

interface PlatformEndpoints {
  authCname: CachedData | null;
  getDebt: CachedData | null;
  getQuota: CachedData | null;
  resourcePrice: CachedData | null;
}

interface SealosStore {
  // Region and user info
  regionUrl: string;
  currentUser: User | null;
  tokens: UserTokens;

  // Cached API responses
  devbox: DevboxEndpoints;
  account: AccountEndpoints;
  auth: AuthEndpoints;
  platform: PlatformEndpoints;

  // Cache settings
  cacheTimeout: number; // in milliseconds

  // Actions for region and user
  setRegionUrl: (regionUrl: string) => void;
  setCurrentUser: (user: User | null) => void;
  setTokens: (tokens: UserTokens) => void;

  // Generic actions for API data
  setApiData: (
    apiGroup: "devbox" | "account" | "auth" | "platform",
    endpoint: string,
    data: any,
    regionUrl: string
  ) => void;
  getApiData: (
    apiGroup: "devbox" | "account" | "auth" | "platform",
    endpoint: string,
    regionUrl: string
  ) => any | null;
  isApiDataValid: (
    apiGroup: "devbox" | "account" | "auth" | "platform",
    endpoint: string,
    regionUrl: string
  ) => boolean;
  clearApiData: (
    apiGroup: "devbox" | "account" | "auth" | "platform",
    endpoint?: string
  ) => void;

  // Utility actions
  clearAllCache: () => void;
  isDataExpired: (timestamp: number) => boolean;

  // Debug function to print store state
  debugPrintState: () => void;

  // Token management
  updateTokenFromUser: (user: User) => void;
  hasRequiredTokens: (type: "devbox" | "account") => boolean;

  // Copilot aggregated data
  copilotData: {
    devbox_data: any[];
    account_data: any;
    auth_data: any;
    timestamp: number;
  };

  // Action to refresh copilotData based on current store
  updateCopilotData: () => void;

  // Data selectors for efficient access
  getDevboxByName: (devboxName: string) => any | null;
  getDevboxDataMap: () => Map<string, any> | null;
}

export const useSealosStore = create<SealosStore>((set, get) => ({
  // Initial state
  regionUrl: "bja.sealos.run", // Set default region URL
  currentUser: null,
  tokens: {},
  devbox: {
    getDevboxList: null,
    checkReady: null,
    getDevboxByName: null,
    getSSHConnectionInfo: null,
    createDevbox: null,
    delDevbox: null,
    delDevboxVersionByName: null,
    editDevboxVersion: null,
    execCommandInDevboxPod: null,
    getAppsByDevboxId: null,
    getDevboxPodsByDevboxName: null,
    getDevboxVersionList: null,
    getEnv: null,
    releaseDevbox: null,
    restartDevbox: null,
    startDevbox: null,
    shutdownDevbox: null,
    updateDevbox: null,
    getMonitorData: null,
    templateRepositoryDelete: null,
    templateRepositoryGet: null,
    templateRepositoryList: null,
    templateRepositoryListOfficial: null,
    templateRepositoryListPrivate: null,
    templateRepositoryTagList: null,
    templateRepositoryTemplateDelete: null,
    templateRepositoryTemplateGetConfig: null,
    templateRepositoryTemplateList: null,
    templateRepositoryUpdate: null,
    templateRepositoryWithTemplateCreate: null,
    templateRepositoryWithTemplateUpdate: null,
  },
  account: {
    getAmount: null,
  },
  auth: {
    info: null,
  },
  platform: {
    authCname: null,
    getDebt: null,
    getQuota: null,
    resourcePrice: null,
  },
  cacheTimeout: 5 * 60 * 1000, // 5 minutes

  // Aggregated data for Copilot. Initialized with empty values and timestamp 0.
  copilotData: {
    devbox_data: [],
    account_data: {},
    auth_data: {},
    timestamp: 0,
  },

  // Region and user actions
  setRegionUrl: (regionUrl) => set({ regionUrl }),

  setCurrentUser: (user) => {
    set({ currentUser: user });
    if (user) {
      get().updateTokenFromUser(user);
    }
  },

  setTokens: (tokens) => set({ tokens }),

  // Generic API data actions
  setApiData: (apiGroup, endpoint, data, regionUrl) => {
    set((state) => ({
      [apiGroup]: {
        ...state[apiGroup],
        [endpoint]: {
          data,
          timestamp: Date.now(),
          regionUrl,
        },
      },
    }));

    // Refresh aggregated Copilot data after setting API data
    get().updateCopilotData();
  },

  getApiData: (apiGroup, endpoint, regionUrl) => {
    const state = get();
    const apiData = (state[apiGroup] as any)[endpoint];
    if (
      apiData &&
      apiData.regionUrl === regionUrl &&
      get().isApiDataValid(apiGroup, endpoint, regionUrl)
    ) {
      return apiData.data;
    }
    return null;
  },

  isApiDataValid: (apiGroup, endpoint, regionUrl) => {
    const state = get();
    const apiData = (state[apiGroup] as any)[endpoint];
    if (!apiData || apiData.regionUrl !== regionUrl) {
      return false;
    }
    return !get().isDataExpired(apiData.timestamp);
  },

  clearApiData: (apiGroup, endpoint) => {
    if (endpoint) {
      set((state) => ({
        [apiGroup]: {
          ...state[apiGroup],
          [endpoint]: null,
        },
      }));
    } else {
      // Clear all endpoints for the API group
      const clearedGroup = Object.keys(get()[apiGroup]).reduce((acc, key) => {
        acc[key] = null;
        return acc;
      }, {} as any);
      set((state) => ({
        [apiGroup]: clearedGroup,
      }));
    }

    // Keep Copilot data in sync
    get().updateCopilotData();
  },

  // Utility actions
  clearAllCache: () =>
    set({
      devbox: {
        getDevboxList: null,
        checkReady: null,
        getDevboxByName: null,
        getSSHConnectionInfo: null,
        createDevbox: null,
        delDevbox: null,
        delDevboxVersionByName: null,
        editDevboxVersion: null,
        execCommandInDevboxPod: null,
        getAppsByDevboxId: null,
        getDevboxPodsByDevboxName: null,
        getDevboxVersionList: null,
        getEnv: null,
        releaseDevbox: null,
        restartDevbox: null,
        startDevbox: null,
        shutdownDevbox: null,
        updateDevbox: null,
        getMonitorData: null,
        templateRepositoryDelete: null,
        templateRepositoryGet: null,
        templateRepositoryList: null,
        templateRepositoryListOfficial: null,
        templateRepositoryListPrivate: null,
        templateRepositoryTagList: null,
        templateRepositoryTemplateDelete: null,
        templateRepositoryTemplateGetConfig: null,
        templateRepositoryTemplateList: null,
        templateRepositoryUpdate: null,
        templateRepositoryWithTemplateCreate: null,
        templateRepositoryWithTemplateUpdate: null,
      },
      account: {
        getAmount: null,
      },
      auth: {
        info: null,
      },
      platform: {
        authCname: null,
        getDebt: null,
        getQuota: null,
        resourcePrice: null,
      },
      copilotData: {
        devbox_data: [],
        account_data: {},
        auth_data: {},
        timestamp: Date.now(),
      },
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
      devbox: state.devbox,
      account: state.account,
      auth: state.auth,
      cacheTimeout: state.cacheTimeout,
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

  // Implementation of updateCopilotData
  updateCopilotData: () => {
    const { devbox, account, auth } = get();

    set({
      copilotData: {
        devbox_data: devbox.getDevboxList?.data || [],
        account_data: account.getAmount?.data || {},
        auth_data: auth.info?.data || {},
        timestamp: Date.now(),
      },
    });
  },

  // Data selectors for efficient access
  getDevboxByName: (devboxName: string) => {
    const { devbox, regionUrl } = get();
    const devboxListData = devbox.getDevboxList?.data;

    if (!devboxListData || devboxListData.length === 0) {
      return null;
    }

    // Find the devbox by name in the parsed data
    for (const pair of devboxListData) {
      const devboxItem = pair.find((item: any) => item.kind === "Devbox");
      if (devboxItem && devboxItem.metadata.name === devboxName) {
        const templateInfo = pair.find(
          (item: any) => "templateRepository" in item
        );
        return {
          devbox: devboxItem,
          templateInfo,
          // Note: readyData would need to be fetched separately if needed
        };
      }
    }

    return null;
  },

  getDevboxDataMap: () => {
    const { devbox } = get();
    const devboxListData = devbox.getDevboxList?.data;

    if (!devboxListData || devboxListData.length === 0) {
      return null;
    }

    const dataMap = new Map();

    devboxListData.forEach((pair: any) => {
      const devboxItem = pair.find((item: any) => item.kind === "Devbox");
      const templateInfo = pair.find(
        (item: any) => "templateRepository" in item
      );

      if (devboxItem) {
        dataMap.set(devboxItem.metadata.name, {
          devbox: devboxItem,
          templateInfo,
        });
      }
    });

    return dataMap;
  },
}));
