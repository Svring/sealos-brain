"use client";

import { CopilotKit, useCoAgent } from "@copilotkit/react-core";
import type { ReactNode } from "react";
import { useActivateClusterActions } from "@/lib/agent/actions/cluster-action";
import { useActivateDevboxActions } from "@/lib/agent/actions/devbox-action";
import { useActivateGraphActions } from "@/lib/agent/actions/graph-action";
import { useActivateObjectStorageActions } from "@/lib/agent/actions/objectstorage-action";
import {
  type CodeAgentState,
  codeAgentConfig,
  createCodeAgentConfigurable,
} from "@/lib/agent/code-agent";
import {
  createSealosBrainConfigurable,
  type SealosBrainAgentState,
  sealosBrainConfig,
} from "@/lib/agent/sealos-brain";
import { useSealosStore } from "@/store/sealos-store";

interface CopilotConfig {
  runtimeUrl?: string;
  agent?: string;
}

// Hook for Sealos Brain Agent
export function useSealosBrainAgent() {
  const { currentUser } = useSealosStore();

  const agentConfig = createSealosBrainConfigurable(
    currentUser?.tokens?.find((t) => t.type === "api_key")?.value || "",
    currentUser?.tokens?.find((t) => t.type === "base_url")?.value || ""
  );

  const { state } = useCoAgent<SealosBrainAgentState>({
    name: sealosBrainConfig.name,
    config: agentConfig,
  });

  // Activate Sealos-specific actions
  useActivateDevboxActions();
  useActivateClusterActions();
  useActivateObjectStorageActions();
  useActivateGraphActions();

  return {
    state,
  };
}

// Hook for Code Agent
export function useCodeAgent(projectAddress?: string, token?: string) {
  const agentConfig = createCodeAgentConfigurable(projectAddress, token);

  const { state } = useCoAgent<CodeAgentState>({
    name: codeAgentConfig.name,
    config: agentConfig,
  });

  return {
    state,
  };
}

// Props
interface CopilotStateProviderProps {
  children: ReactNode;
  providerConfig?: CopilotConfig;
}

// Main Provider - Now only handles CopilotKit configuration
export function CopilotStateProvider({
  children,
  providerConfig = {},
}: CopilotStateProviderProps) {
  return (
    <CopilotKit
      agent={providerConfig.agent}
      runtimeUrl={providerConfig.runtimeUrl}
    >
      {children}
    </CopilotKit>
  );
}

export type { CodeAgentState } from "@/lib/agent/code-agent";
export type { SealosBrainAgentState } from "@/lib/agent/sealos-brain";
