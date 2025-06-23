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
import { ChevronDown, Plus, ArrowLeft } from "lucide-react";
import { useGraphNode } from "@/hooks/use-graph-node";
import { CopilotStateProvider } from "@/context/copilot-state-provider";

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

  /* ---------------- Layout Calculation Helpers ---------------- */
  const [windowWidth, setWindowWidth] = useState(0);

  // Track window width for responsive calculations
  useEffect(() => {
    const updateWidth = () => setWindowWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Simplified layout for the message / prompt box
  const boxAnimate = useMemo(() => {
    const panelOpen = Boolean(panelId);

    // When panel is open → center inside the left 60%
    if (panelOpen) {
      return { left: "30vw", x: "-50%", width: "60vw" };
    }

    // Default → simple centered
    return { left: "50%", x: "-50%", width: 640 };
  }, [panelId]);

  return (
    <div className="h-screen w-screen">
      {/* Top-right button to open node-create view */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="default"
          className="rounded-xl"
          onClick={() =>
            openPanel("node-create", <NodeCreateView onCreateNode={() => {}} />)
          }
        >
          <Plus className="w-4 h-4" />
        </Button>
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
        {isLoading && (
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
          className="fixed bottom-2 z-40 max-w-xl"
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
