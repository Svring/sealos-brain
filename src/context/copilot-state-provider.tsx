"use client";

import { useCoAgent, CopilotKit } from "@copilotkit/react-core";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useMemo,
} from "react";
import { activateDevboxActions } from "@/lib/devbox/devbox-action";
import {
  copilotAgentConfig,
  CopilotAgentState,
} from "@/lib/agent/copilot-agent";
import { codeAgentConfig, CodeAgentState } from "@/lib/agent/code-agent";

// Type Definitions
type AgentState = CopilotAgentState | CodeAgentState;

interface CopilotConfig {
  runtimeUrl?: string;
  publicApiKey?: string;
  agent?: string;
}

interface CopilotStateContextType {
  state: AgentState | undefined;
  setState: (
    state: AgentState | ((prevState: AgentState | undefined) => AgentState)
  ) => void;
  systemPrompt: string;
  config: CopilotConfig;
  updateConfig: (newConfig: Partial<CopilotConfig>) => void;
}

// Context
const CopilotStateContext = createContext<CopilotStateContextType | undefined>(
  undefined
);

// Custom Hooks
export function useCopilotState() {
  const context = useContext(CopilotStateContext);
  if (!context) {
    throw new Error(
      "useCopilotState must be used within a CopilotStateProvider"
    );
  }
  return context;
}

export function useCopilotConfig() {
  const { config, updateConfig } = useCopilotState();
  return { config, updateConfig };
}

// Props
interface CopilotStateProviderProps {
  children: ReactNode;
  initialConfig?: CopilotConfig;
}

// Main Provider
export function CopilotStateProvider({
  children,
  initialConfig = {},
}: CopilotStateProviderProps) {
  const defaultConfig: CopilotConfig = {
    runtimeUrl: process.env.NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL,
    publicApiKey: process.env.NEXT_PUBLIC_COPILOT_API_KEY,
    agent: process.env.NEXT_PUBLIC_COPILOTKIT_AGENT_NAME,
    ...initialConfig,
  };

  const [config, setConfig] = useState<CopilotConfig>(defaultConfig);
  const updateConfig = useCallback(
    (newConfig: Partial<CopilotConfig>) =>
      setConfig((prev) => ({ ...prev, ...newConfig })),
    []
  );

  return (
    <CopilotKit
      runtimeUrl={config.runtimeUrl}
      publicApiKey={config.publicApiKey}
      agent={config.agent}
    >
      <InnerProvider config={config} updateConfig={updateConfig}>
        {children}
      </InnerProvider>
    </CopilotKit>
  );
}

// Inner Provider
interface InnerProviderProps {
  children: ReactNode;
  config: CopilotConfig;
  updateConfig: (newConfig: Partial<CopilotConfig>) => void;
}

function InnerProvider({ children, config, updateConfig }: InnerProviderProps) {
  const agentConfig = useMemo(
    () => (config.agent === "code" ? codeAgentConfig : copilotAgentConfig),
    [config.agent]
  );

  const { state, setState } = useCoAgent<AgentState>({
    name: agentConfig.name,
    initialState: {},
    config: { configurable: { system_prompt: agentConfig.systemPrompt } },
  });

  activateDevboxActions();

  return (
    <CopilotStateContext.Provider
      value={{
        state,
        setState,
        systemPrompt: agentConfig.systemPrompt,
        config,
        updateConfig,
      }}
    >
      {children}
    </CopilotStateContext.Provider>
  );
}

// Export Types
export type { CopilotConfig };
