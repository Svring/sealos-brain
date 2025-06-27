"use client";

import {
  useCoAgent,
  CopilotKit,
  useCopilotReadable,
  useCopilotAction,
} from "@copilotkit/react-core";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  sealosBrainAgentConfig,
  SealosBrainAgentState,
  createSealosBrainConfigurable,
  sealosBrainSystemPrompt,
} from "@/lib/agent/sealos-brain";
import {
  codeAgentConfig,
  CodeAgentState,
  codeSystemPrompt,
  createCodeAgentConfigurable,
} from "@/lib/agent/code-agent";
import { useActivateDevboxActions } from "@/lib/agent/actions/devbox-action";
import { useActivateObjectStorageActions } from "@/lib/agent/actions/objectstorage-action";
import { useActivateGraphActions } from "@/lib/agent/actions/graph-action";
import { useActivateClusterActions } from "@/lib/agent/actions/cluster-action";

// Type Definitions
type AgentState = SealosBrainAgentState | CodeAgentState;

interface CopilotConfig {
  runtimeUrl?: string;
  publicApiKey?: string;
  agent?: string;
  project_address?: string;
  token?: string;
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

// AgentActionsProvider - Component to handle agent actions activation
const AgentComponent = ({ agent }: { agent?: string }) => {
  // Only activate agent actions when the agent is sealos_brain
  if (agent === "sealos_brain") {
    // These are now hooks and will be called in the provider's body
  }
  return null;
};

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
      <InnerProvider
        key={
          config.agent === "code"
            ? `${config.agent}-${config.project_address}`
            : config.agent
        }
        config={config}
        updateConfig={updateConfig}
      >
        <AgentComponent agent={config.agent} />
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
  // Get agent configuration and system prompt
  const agentConfig =
    config.agent === "code" ? codeAgentConfig : sealosBrainAgentConfig;

  // Create configurable object based on agent type
  const configurableConfig =
    config.agent === "code"
      ? createCodeAgentConfigurable(config.project_address, config.token)
      : createSealosBrainConfigurable();

  const { state, setState } = useCoAgent<AgentState>({
    name: agentConfig.name,
    initialState: {},
    config: { configurable: configurableConfig },
  });

  // Activate actions
  useActivateDevboxActions();
  useActivateClusterActions();
  useActivateObjectStorageActions();
  useActivateGraphActions();

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
