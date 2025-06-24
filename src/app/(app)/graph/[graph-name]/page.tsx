"use client";

import { useState, useMemo, useEffect } from "react";
import { ReactFlow, Background, BackgroundVariant } from "@xyflow/react";
import { usePanel } from "@/context/panel-provider";
import NodeCreateView from "@/components/flow/node/create/node-create-view";
import {
  useGraphCopilotChat,
  MessageRole,
  TextMessage,
} from "@/hooks/use-graph-copilot-chat";
import { ChevronDown, Plus, Spline } from "lucide-react";
import { useGraphNode } from "@/hooks/use-graph-node";
import { CopilotStateProvider } from "@/context/copilot-state-provider";
import { MenuBar, type MenuBarItem } from "@/components/ui/menu-bar";
import { GraphBackMenu } from "@/components/graph/graph-back-menu";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSwiper } from "@/components/ui/message-swiper";
import { PromptInputBox } from "@/components/ai-chat/ai-prompt-box";
import nodeTypes from "@/components/flow/node/node-types";
import edgeTypes from "@/components/flow/edge/edge-types";

interface GraphPageContentProps {
  graphName: string;
}

function GraphPageContent({ graphName }: GraphPageContentProps) {
  const { nodes, onNodesChange, isLoading, error } = useGraphNode(graphName);
  const { closePanel, openPanel, Id: panelId } = usePanel();
  
  const {
    visibleMessages,
    appendMessage,
    isLoading: isChatLoading,
    isMessageSwiperExpanded,
    setIsMessageSwiperExpanded,
  } = useGraphCopilotChat();

  const menuItems: MenuBarItem[] = [
    {
      icon: Plus,
      label: "Add Node",
      onClick: () =>
        openPanel(
          "node-create",
          <NodeCreateView currentGraphName={graphName} />
        ),
    },
    { icon: Spline, label: "Edge Mode", onClick: () => {} },
  ];

  const boxAnimate = useMemo(
    () => ({
      left: panelId ? "30%" : "50%",
      x: "-50%",
      width: panelId ? "60%" : "640px",
    }),
    [panelId]
  );

  return (
    <div className="relative h-screen w-full">
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
        <GraphBackMenu graphName={graphName} />
        <MenuBar items={menuItems} />
      </div>

      <ReactFlow
        panOnScroll
        nodes={nodes}
        edges={[]}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onPaneClick={closePanel}
      >
        <Background variant={BackgroundVariant.Dots} gap={60} size={1} />
        {isLoading && (
          <div className="absolute top-20 left-4 bg-blue-100 text-blue-800 px-3 py-2 rounded-md shadow-md z-10">
            Loading {graphName}...
          </div>
        )}
        {error && (
          <div className="absolute top-20 left-4 bg-red-100 text-red-800 px-3 py-2 rounded-md shadow-md z-10">
            Error: {error}
          </div>
        )}
      </ReactFlow>

      <AnimatePresence>
        <motion.div
          className="absolute bottom-2 z-40 max-w-xl"
          animate={boxAnimate}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <motion.div className="translate-y-3">
            <MessageSwiper
              messages={visibleMessages}
              isExpanded={isMessageSwiperExpanded}
            />
          </motion.div>
          <motion.div className="relative w-full">
            <motion.button
              onClick={() =>
                setIsMessageSwiperExpanded(!isMessageSwiperExpanded)
              }
              className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full p-2 cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{ rotate: isMessageSwiperExpanded ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.button>
            <PromptInputBox
              onSend={(content: string) =>
                appendMessage(
                  new TextMessage({ content, role: MessageRole.User })
                )
              }
              isLoading={isChatLoading}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function GraphPage({
  params,
}: {
  params: Promise<{ "graph-name": string }>;
}) {
  const [graphName, setGraphName] = useState<string>("");

  useEffect(() => {
    params.then(({ "graph-name": name }) =>
      setGraphName(decodeURIComponent(name))
    );
  }, [params]);

  if (!graphName) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading graph...</p>
        </div>
      </div>
    );
  }

  return (
    <CopilotStateProvider
      initialConfig={{ runtimeUrl: "/api/agent/copilot", agent: "copilot" }}
    >
      <GraphPageContent graphName={graphName} />
    </CopilotStateProvider>
  );
}
