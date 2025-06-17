"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  useEdgesState,
  BackgroundVariant,
  Edge,
} from "@xyflow/react";
import nodeTypes from "@/components/node/node-types";
import { usePanel } from "@/context/panel-provider";
import NodeCreateView from "@/components/node/create/node-create-view";
import edgeTypes from "@/components/edge/edge-types";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSwiper } from "@/components/ui/message-swiper";
import { PromptInputBox } from "@/components/ai/ai-prompt-box";

import { useCopilotChat } from "@copilotkit/react-core";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";
import { ChevronDown, Plus } from "lucide-react";
import { useSidebarControl } from "@/hooks/use-sidebar-control";
import { useGraphNode } from "@/hooks/use-graph-node";

const initialEdges: Edge[] = [];

export default function App() {
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Use the new hook for node management
  const { nodes, onNodesChange, isLoading, error } = useGraphNode();

  const { closePanel, openPanel, Id: panelId } = usePanel();
  const { open: sidebarOpen, width: sidebarWidth } = useSidebarControl();

  const {
    visibleMessages,
    appendMessage,
    isLoading: isChatLoading,
  } = useCopilotChat();

  // Add expand state for MessageSwiper
  const [isMessageSwiperExpanded, setIsMessageSwiperExpanded] = useState(false);

  /* ---------------- Layout Calculation Helpers ---------------- */
  const [windowWidth, setWindowWidth] = useState(0);

  // Track window width for responsive calculations
  useEffect(() => {
    const updateWidth = () => setWindowWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Memoized layout for the message / prompt box
  const boxAnimate = useMemo(() => {
    const panelOpen = Boolean(panelId);

    // Helpers
    const sidebarW = sidebarOpen ? sidebarWidth || 280 : 0;
    const panelW = panelOpen ? windowWidth * 0.4 : 0; // Panel is 40vw when open

    // When both sidebar & panel are open → center between them
    if (sidebarOpen && panelOpen) {
      const freeW = windowWidth - sidebarW - panelW;
      return {
        left: sidebarW + freeW / 2,
        x: "-51%",
        width: Math.min(freeW, 640 - 48),
      };
    }

    // When only panel is open → center inside the left 60% (fixed behaviour)
    if (panelOpen) {
      return { left: "30vw", x: "-50%", width: "60vw" };
    }

    // When only sidebar is open → center in remaining space on the right
    if (sidebarOpen) {
      const freeW = windowWidth - sidebarW;
      return {
        left: sidebarW + freeW / 2,
        x: "-50%",
        width: Math.min(freeW, 640),
      };
    }

    // Neither open → simple centered max-w-xl
    return { left: "50%", x: "-50%", width: 640 };
  }, [panelId, sidebarOpen, sidebarWidth, windowWidth]);

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
          <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 px-3 py-2 rounded-md shadow-md z-10">
            Loading resources...
          </div>
        )}

        {/* Error indicator */}
        {error && (
          <div className="absolute top-4 left-4 bg-red-100 text-red-800 px-3 py-2 rounded-md shadow-md z-10">
            Error loading: {error}
          </div>
        )}
      </ReactFlow>

      <AnimatePresence>
        <motion.div
          className="fixed bottom-2 w-full z-40"
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
