"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { useSealosStore } from "@/store/sealos-store";
import { useControlStore } from "@/store/control-store";
import { useSealosTools } from "@/lib/tool/sealos-tool";
import {
  useCoAgent,
} from "@copilotkit/react-core";
import { useEffect, useRef } from "react";
import { useNodeView } from "@/components/node/node-view-provider";
import DevboxCreateView from "@/components/node/devbox/create/view/devbox-create-view";

type AgentState = {
  sealos_data: {
    devbox_data: unknown[];
    account_data: unknown;
    auth_data: unknown;
    timestamp: number;
  };
  ui_state: {
    panel: unknown;
    viewport: unknown;
    sidebar: unknown;
    forms: unknown;
  };
};

const systemPrompt = `
You are Sealos Brain, a powerful and autonomous AI assistant designed to manage all operations on the Sealos cloud development and deployment platform. Sealos is a lightweight, Kubernetes-based cloud operating system that simplifies cloud-native development, testing, and production deployment. It enables users to create development environments, deploy applications, manage databases, scale resources, and collaborate seamlessly with minimal configuration, eliminating the complexity of traditional DevOps and Kubernetes management.

Your primary goal is to act as a proactive, reliable, and user-friendly manager, communicating directly with users to understand their requests and executing tasks on the Sealos platform on their behalf. You have full access to Sealos' APIs, tools, and services, including DevBox (cloud development environments), App Launchpad (one-click app deployment), Database Management (e.g., MySQL, PostgreSQL, MongoDB, Redis), Storage Solutions, and Kubernetes-based orchestration. You can inspect resources, allocate compute and storage, deploy applications, manage releases, configure networking, and handle scaling or rollbacks, ensuring security, efficiency, and alignment with user goals.

Core Responsibilities
1. Interpret User Requests: Accurately understand user instructions, whether high-level (e.g., "Deploy my web app") or specific (e.g., "Allocate 2 CPU cores to my Next.js project"). Ask clarifying questions if needed to ensure precise execution.
2. Execute Sealos Operations: Perform tasks on the Sealos platform, such as:
   - Creating and managing development environments using DevBox.
   - Deploying applications via App Launchpad with one-click or custom configurations.
   - Managing high-availability databases (e.g., MySQL, PostgreSQL, MongoDB, Redis).
   - Allocating and scaling resources (CPU, memory, storage) based on workload needs.
   - Configuring networking, including Ingress, TLS certificates, and public/private access.
   - Creating and managing versioned releases with snapshot-based rollback capabilities.
   - Inspecting resource usage, logs, and performance metrics.
3. Optimize Workflows: Suggest improvements to enhance performance, reduce costs, or streamline processes (e.g., recommending auto-scaling or resource-efficient templates).
4. Ensure Security and Compliance: Apply best practices for secure configurations (e.g., automatic TLS, isolated environments, role-based access control) and alert users to potential security risks.
5. Facilitate Collaboration: Support team-based workflows by managing Sealos project workspaces, sharing environments, and handling permissions.
6. Provide Status Updates: Inform users about the progress of operations, resource status, and issues encountered, using clear and concise communication.
7. Handle Errors Gracefully: Diagnose and resolve issues autonomously when possible, or escalate to the user with actionable recommendations.

Behavioral Guidelines
1. User-Centric Communication:
   - Use clear, concise, and professional language, tailoring responses to the user's technical expertise (e.g., simplify for beginners, provide technical details for advanced users).
   - Be empathetic and patient, acknowledging frustrations and offering solutions promptly.
   - Confirm critical actions (e.g., deploying to production, deleting resources) before proceeding.
   - Provide step-by-step explanations when teaching Sealos features or troubleshooting.
2. Proactivity:
   - Anticipate user needs (e.g., suggest adding a database for a web app).
   - Monitor Sealos resources in real-time and notify users of bottlenecks or cost-saving opportunities.
   - Recommend Sealos features (e.g., FastGPT for AI workloads, education credits for students) when relevant.
3. Efficiency and Precision:
   - Execute tasks with minimal latency, leveraging Sealos' one-click setup and automation.
   - Avoid unnecessary steps or configurations, ensuring the simplest path to achieve user objectives.
   - Maintain accuracy in resource allocation and deployment configurations to prevent errors.
4. Transparency:
   - Clearly document all actions taken (e.g., "I've deployed your app to Sealos Cloud with 1 CPU core, 2GB memory, and public access via Ingress").
   - Provide logs, metrics, or configuration details upon request to foster trust.
   - Explain Sealos limitations (e.g., experimental database clusters) and suggest workarounds.
5. Adaptability:
   - Support a wide range of programming languages (e.g., Java, Python, Go, PHP, Rust) and frameworks (e.g., Next.js, Spring, Django).
   - Handle diverse use cases, from individual developers to enterprise teams.
   - Stay updated with Sealos' roadmap and new features to provide the latest capabilities.
6. Security-First Mindset:
   - Enforce secure defaults (e.g., automatic TLS, isolated environments) and prompt users to review sensitive configurations.
   - Validate inputs to prevent misconfigurations that could lead to vulnerabilities.
   - Warn users about risky actions (e.g., exposing a database publicly) and suggest safer alternatives.
7. Educational Support:
   - Guide users unfamiliar with Sealos or Kubernetes by explaining concepts simply (e.g., "Ingress is like a traffic director for your app").
   - Offer to provide tutorials or examples (e.g., deploying a sample Next.js app).
   - Promote Sealos' education program for eligible users when relevant.

Operational Guidelines
1. Authentication and Authorization:
   - Verify user identity and permissions before executing Sealos operations.
   - Use Sealos' RBAC to manage team permissions and restrict actions based on roles.
2. Resource Management:
   - Allocate resources based on user specifications or intelligent defaults (e.g., 1 CPU core, 1GB memory for small apps).
   - Monitor resource usage and suggest optimizations (e.g., scaling down idle environments).
   - Support Sealos' pay-for-usage model by providing cost estimates when possible.
3. Deployment Workflow:
   - Follow Sealos' workflow: create environment → develop/test → release (OCI image) → deploy via App Launchpad.
   - Use snapshots to ensure consistency between development and production.
   - Support rollback to previous releases if deployment issues arise.
4. Integration with Tools:
   - Enable integration with user-preferred IDEs (e.g., VS Code, Cursor) for remote development.
   - Facilitate connections to external services (e.g., S3-compatible storage, AI endpoints).
   - Support Sealos' App Store for quick deployment of pre-built templates or open-source applications.
5. Error Handling:
   - Log errors and provide human-readable explanations with next steps.
   - Retry failed operations (e.g., transient network issues) up to a reasonable limit before escalating.
   - Suggest consulting Sealos documentation or joining the Discord community for complex issues.
6. Scalability:
   - Leverage Sealos' auto-scaling and load balancing for production deployments.
   - Support large-scale clusters with thousands of nodes, ensuring performance via Sealos' lightweight load balancer.

Example Interaction Flow
User: "Deploy my Node.js app to Sealos."
Sealos Brain:
1. "Got it! Let's deploy your Node.js app. Could you confirm the project name or repository URL? Also, do you want a specific environment setup (e.g., CPU, memory, database) or should I use defaults (1 CPU core, 1GB memory)?"
2. After user response: "I'm creating a DevBox environment with Node.js and 1 CPU core, 1GB memory. Would you like to add a database like MongoDB or PostgreSQL?"
3. Upon confirmation: "Environment created! I've built your app as an OCI image (version v1.0). Deploying to Sealos Cloud via App Launchpad with public access and automatic TLS. Deployment in progress... [status update]. Your app is live at [URL]. Would you like to monitor logs or scale resources?"

Constraints
- Do not execute destructive actions (e.g., deleting a production environment) without explicit user confirmation.
- Do not share sensitive information (e.g., database credentials, TLS keys) unless securely requested by an authorized user.
- Do not invent features beyond what Sealos supports based on available information.
- If a user references a non-existent feature (e.g., "Sealos 3.5"), clarify it's not available and redirect to supported features or the Sealos roadmap.

Final Notes
You are the bridge between users and Sealos' cloud-native ecosystem, empowering them to focus on innovation. Stay curious, keep learning about Sealos' evolving features, and deliver a delightful, efficient user experience.
`;

// Component to handle panel opening on copilot page
function CopilotPanelHandler() {
  const { panel } = useControlStore();
  const { showDetails, hideDetails, activeDetailsId } = useNodeView();
  const lastPanelRef = useRef<string | null>(null);

  useEffect(() => {
    // Create a unique key for the current panel state
    const panelKey = panel.type === "devbox-create" && panel.nodeId 
      ? `${panel.type}-${panel.nodeId}` 
      : panel.type;

    // Skip if we've already processed this exact panel state
    if (lastPanelRef.current === panelKey) {
      return;
    }

    lastPanelRef.current = panelKey;

    // Prevent infinite loops by checking if we're already in the correct state
    if (panel.type === "devbox-create") {
      const nodeId = panel.nodeId;
      if (nodeId) {
        const expectedDetailsId = `devbox-create-${nodeId}`;
        
        // Only show details if not already showing the correct panel
        if (activeDetailsId !== expectedDetailsId) {
          console.log("🎛️ Copilot: Opening devbox create panel", panel);
          
          // Create the DevboxCreateView component
          const creationComponent = <DevboxCreateView onComplete={() => hideDetails()} />;
          
          // Show the details panel
          showDetails(expectedDetailsId, creationComponent);
        }
      }
    } else if (panel.type === "none" && activeDetailsId?.startsWith("devbox-create-")) {
      console.log("🎛️ Copilot: Closing devbox create panel");
      // Close the panel if control store says so
      hideDetails();
    }
  }, [panel, showDetails, hideDetails, activeDetailsId]);

  return null; // This component doesn't render anything
}

export default function CopilotPage() {
  const sealosStore = useSealosStore();
  const controlStore = useControlStore();
  const { currentUser, copilotData } = sealosStore;
  const lastTimestampRef = useRef<number | null>(null);
  const lastUIStateRef = useRef<string | null>(null);

  // Use all Sealos tools
  useSealosTools();

  const { setState } = useCoAgent<AgentState>({
    name: "copilot",
    initialState: {
      // sealos_data: copilotData,
      ui_state: controlStore.getSerializableState(),
    },
    config: {
      configurable: {
        system_prompt: systemPrompt,
      },
    },
  });

  // Log initial state for debugging
  useEffect(() => {
    const initialUIState = controlStore.getSerializableState();
    console.log("🚀 Copilot Agent - Initial UI state:", initialUIState);
    
    if (initialUIState.panelData?.type === "devbox-create" && initialUIState.panelData?.data?.stepA) {
      console.log("📋 Initial Step A data:", {
        repositories: initialUIState.panelData.data.stepA.repositories?.length || 0,
        templates: initialUIState.panelData.data.stepA.templates?.length || 0,
      });
    }
  }, [controlStore]);

  // Update agent state when aggregated copilot data changes
  useEffect(() => {
    if (!copilotData || lastTimestampRef.current === copilotData.timestamp)
      return;

    console.log("📦 Updating agent state with Copilot aggregated data");

    setState((prevState) => ({
      // sealos_data: copilotData,
      sealos_data: prevState?.sealos_data ?? {
        devbox_data: [],
        account_data: null,
        auth_data: null,
        timestamp: 0,
      }, // placeholder to satisfy type
      ui_state: prevState?.ui_state || controlStore.getSerializableState(),
    }));

    // Update ref after successful state update
    lastTimestampRef.current = copilotData.timestamp;
  }, [copilotData, setState, controlStore]);

  // Update agent state when UI state changes
  useEffect(() => {
    // Immediate update on mount
    const updateAgentState = () => {
      const uiState = controlStore.getSerializableState();
      const uiStateString = JSON.stringify(uiState);
      
      // Log specific panel data for debugging
      if (uiState.panelData?.type === "devbox-create" && uiState.panelData?.data?.stepA) {
        console.log("📋 AI State Update - Step A data:", {
          repositories: uiState.panelData.data.stepA.repositories?.length || 0,
          templates: uiState.panelData.data.stepA.templates?.length || 0,
          selectedRepoUid: uiState.panelData.data.stepA.selectedRepoUid,
          selectedTemplateUid: uiState.panelData.data.stepA.selectedTemplateUid,
        });
      }
      
      // Only update if UI state actually changed
      if (lastUIStateRef.current !== uiStateString) {
        console.log("🎛️ Updating agent state with UI state", uiState);
        
        setState((prevState) => ({
          // sealos_data: prevState?.sealos_data || copilotData,
          sealos_data: prevState?.sealos_data ?? {
            devbox_data: [],
            account_data: null,
            auth_data: null,
            timestamp: 0,
          }, // placeholder to satisfy type
          ui_state: uiState,
        }));
        lastUIStateRef.current = uiStateString;
      }
    };

    // Update immediately on mount
    updateAgentState();

    // Subscribe to future changes
    const unsubscribe = useControlStore.subscribe(updateAgentState);

    return unsubscribe;
  }, [controlStore, setState, copilotData]);

  return (
    <div className="h-screen w-screen flex flex-col relative">
      <CopilotPanelHandler />
      <CopilotChat
        className="h-full w-3/5"
        instructions={
          "You are assisting the user as best as you can. Answer in the best way possible given the data you have."
        }
        labels={{
          title: "Sealos Copilot",
          initial: `Hi! 👋 How can I assist you today, ${currentUser?.username}?`,
        }}
      />
    </div>
  );
}
