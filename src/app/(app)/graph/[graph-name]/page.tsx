"use client";

import { useState, useMemo, useEffect } from "react";
import { ReactFlow, Background, BackgroundVariant } from "@xyflow/react";
import nodeTypes from "@/components/flow/node/node-types";
import { usePanel } from "@/context/panel-provider";
import NodeCreateView from "@/components/flow/node/create/node-create-view";
import edgeTypes from "@/components/flow/edge/edge-types";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSwiper } from "@/components/ui/message-swiper";
import { PromptInputBox } from "@/components/ai-chat/ai-prompt-box";

import { useCopilotChat } from "@copilotkit/react-core";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";
import { ChevronDown, Plus } from "lucide-react";
import { useGraphNode } from "@/hooks/use-graph-node";
import { CopilotStateProvider } from "@/context/copilot-state-provider";
import { MenuBar, type MenuBarItem } from "@/components/ui/menu-bar";
import { GraphBackMenu } from "@/components/graph/graph-back-menu";

interface GraphPageContentProps {
  graphName: string;
}

function GraphPageContent({ graphName }: GraphPageContentProps) {
  // Use the unified hook with specificGraphName parameter
  const { nodes, edges, onNodesChange, onEdgesChange, isLoading, error } =
    useGraphNode(graphName);

  const { closePanel, openPanel, Id: panelId } = usePanel();

  const {
    visibleMessages,
    appendMessage,
    isLoading: isChatLoading,
  } = useCopilotChat();

  // Add expand state for MessageSwiper
  const [isMessageSwiperExpanded, setIsMessageSwiperExpanded] = useState(false);

  // Track previous message count to detect new messages
  const [previousMessageCount, setPreviousMessageCount] = useState(0);

  // Check if this is a new/empty graph (for loading state only)
  const isNewGraph = graphName === "new-graph";

  // Define menu items for the MenuBar
  const menuItems: MenuBarItem[] = [
    {
      icon: Plus,
      label: "Add Node",
      onClick: () => openPanel("node-create", <NodeCreateView onCreateNode={() => {}} currentGraphName={graphName} />)
    }
  ];

  // Auto-expand MessageSwiper when new messages arrive
  useEffect(() => {
    const currentMessageCount = visibleMessages.length;
    if (
      currentMessageCount > previousMessageCount &&
      previousMessageCount > 0
    ) {
      setIsMessageSwiperExpanded(true);
    }
    setPreviousMessageCount(currentMessageCount);
  }, [visibleMessages.length, previousMessageCount]);

  // Simplified layout for the message / prompt box
  const boxAnimate = useMemo(() => {
    const panelOpen = Boolean(panelId);

    // When panel is open → center inside the left portion (accounting for panel)
    if (panelOpen) {
      return { left: "30%", x: "-50%", width: "60%" };
    }

    // Default → simple centered
    return { left: "50%", x: "-50%", width: "640px" };
  }, [panelId]);

  return (
    <div className="h-screen w-full relative">
      {/* Top navigation bar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
        <GraphBackMenu graphName={graphName} />
        <div className="flex items-center gap-2">
          <MenuBar items={menuItems} />
        </div>
      </div>

      <ReactFlow
        panOnScroll
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onPaneClick={closePanel}
      >
        <Background variant={BackgroundVariant.Dots} gap={60} size={1} />

        {/* Loading indicator */}
        {isLoading && !isNewGraph && (
          <div className="absolute top-20 left-4 bg-blue-100 text-blue-800 px-3 py-2 rounded-md shadow-md z-10">
            Loading {graphName} resources...
          </div>
        )}

        {/* Error indicator */}
        {error && (
          <div className="absolute top-20 left-4 bg-red-100 text-red-800 px-3 py-2 rounded-md shadow-md z-10">
            Error loading: {error}
          </div>
        )}


      </ReactFlow>

      <AnimatePresence>
        <motion.div
          className="absolute bottom-2 z-40 max-w-xl"
          initial={false}
          animate={boxAnimate}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <motion.div className="translate-y-3 relative z-0">
            <MessageSwiper
              messages={visibleMessages}
              isExpanded={isMessageSwiperExpanded}
            />
          </motion.div>

          <motion.div className="w-full relative z-10">
            <motion.button
              onClick={() => setIsMessageSwiperExpanded((prev) => !prev)}
              className="absolute left-1/2 -translate-x-1/2 -top-4 z-20 rounded-full p-2 cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{ rotate: isMessageSwiperExpanded ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.button>
            <PromptInputBox
              onSend={(content: string) => {
                appendMessage(
                  new TextMessage({ content, role: MessageRole.User })
                );
                console.log("🔍 Appended message:", content);
              }}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface GraphPageProps {
  params: Promise<{ "graph-name": string }>;
}

export default function GraphPage({ params }: GraphPageProps) {
  const [graphName, setGraphName] = useState<string>("");

  useEffect(() => {
    params.then((resolvedParams) => {
      setGraphName(decodeURIComponent(resolvedParams["graph-name"]));
    });
  }, [params]);

  if (!graphName) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading graph...</p>
        </div>
      </div>
    );
  }

  return (
    <CopilotStateProvider
      initialConfig={{
        runtimeUrl: "/api/agent/copilot",
        agent: "copilot",
      }}
    >
      <GraphPageContent graphName={graphName} />
    </CopilotStateProvider>
  );
}
