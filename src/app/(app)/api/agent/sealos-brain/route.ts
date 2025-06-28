import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  ExperimentalEmptyAdapter,
  langGraphPlatformEndpoint,
} from "@copilotkit/runtime";
import type { NextRequest } from "next/server";

const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  remoteEndpoints: [
    langGraphPlatformEndpoint({
      deploymentUrl: process.env.LANGGRAPH_DEPLOYMENT_URL || "",
      langsmithApiKey: process.env.LANGSMITH_API_KEY || "", // only used in LangGraph Platform deployments
      agents: [
        {
          name: "sealos_brain",
          description:
            process.env.NEXT_PUBLIC_COPILOTKIT_AGENT_DESCRIPTION ||
            "A helpful LLM agent.",
        },
      ],
    }),
  ],
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/agent/sealos-brain",
  });

  return handleRequest(req);
};
