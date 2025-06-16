"use client";

import { useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Node,
  Edge,
} from "@xyflow/react";
import { useQuery } from "@tanstack/react-query";
import { devboxListOptions } from "@/lib/devbox/devbox-query";
import { useSealosStore } from "@/store/sealos-store";
import { transformDevboxListIntoNode } from "@/lib/devbox/devbox-transform";
import nodeTypes from "@/components/node/node-types";
import { usePanel } from "@/components/providers/panel-provider";
import NodeCreateView from "@/components/node/create/node-create-view";
import edgeTypes from "@/components/edge/edge-types";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSwiper } from "@/components/ui/message-swiper";
import { PromptInputBox } from "@/components/ai/ai-prompt-box";

import { useCopilotChat } from "@copilotkit/react-core";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";
import { ChevronDown, ChevronUp, MessageSquareMore } from "lucide-react";
import { useSidebarControl } from "@/hooks/use-sidebar-control";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { regionUrl, currentUser } = useSealosStore();
  const { closePanel, openPanel, Id: panelId } = usePanel();
  const { open: sidebarOpen, width: sidebarWidth } = useSidebarControl();

  const { visibleMessages, appendMessage, isLoading } = useCopilotChat();

  // Add expand state for MessageSwiper
  const [isMessageSwiperExpanded, setIsMessageSwiperExpanded] = useState(false);

  // Fetch devbox list using the new query
  const {
    data: devboxList,
    isLoading: devboxListLoading,
    error: devboxListError,
  } = useQuery(devboxListOptions(currentUser, regionUrl));

  // Responsive window width for layout calculation
  const [windowWidth, setWindowWidth] = useState(0);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Panel width (fixed as 40vw)
  const panelWidth = panelId ? windowWidth * 0.4 : 0;
  // Sidebar width (from state, or fallback to 280px)
  const sidebarW = sidebarOpen ? sidebarWidth || 280 : 0;
  // Available space between sidebar and panel
  const availableSpace = windowWidth - sidebarW - panelWidth;
  // Max width for the box
  const maxBoxWidth = Math.min(availableSpace, 640); // 640px = max-w-xl
  // Center position for the box when both sidebar and panel are open
  const centerLeft = sidebarW + (windowWidth - panelWidth - sidebarW) / 2;

  // Animate props for Framer Motion
  const boxAnimate = (sidebarOpen && panelId)
    ? { left: centerLeft, x: '-51%', width: Math.min(availableSpace - 48, 640) } // 32px for padding
    : panelId
      ? { left: '30vw', x: '-50%', width: '60vw' }
      : sidebarOpen
        ? { left: sidebarW + (windowWidth - sidebarW) / 2, x: '-50%', width: Math.min(windowWidth - sidebarW, 640) }
        : { left: '50%', x: '-50%', width: maxBoxWidth };

  // Transform devbox list data into nodes and set them locally
  useEffect(() => {
    console.log("🔍 Devbox list query state:", {
      loading: devboxListLoading,
      error: devboxListError,
      data: devboxList,
      currentUser: currentUser?.id,
      regionUrl,
    });

    if (devboxList && devboxList.length > 0) {
      try {
        console.log("🔄 Transforming devbox list to nodes:", devboxList);
        const lightweightData = transformDevboxListIntoNode(devboxList);
        const nodeData = lightweightData.map((item, index) => ({
          id: item.id,
          type: "devbox",
          position: { x: 300 + index * 280, y: 200 },
          data: item,
        }));
        console.log("✅ Generated nodes:", nodeData);
        setNodes(nodeData);
      } catch (error) {
        console.error("❌ Error transforming devbox list to nodes:", error);
        setNodes([]);
      }
    } else if (devboxList && devboxList.length === 0) {
      // Clear nodes if no devboxes
      console.log("📭 No devboxes found, clearing nodes");
      setNodes([]);
    }
  }, [
    devboxList,
    setNodes,
    devboxListLoading,
    devboxListError,
    currentUser,
    regionUrl,
  ]);

  return (
    <div className="h-screen w-screen">
      {/* Top-right button to open node-create view */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="default"
          onClick={() =>
            openPanel("node-create", <NodeCreateView onCreateNode={() => {}} />)
          }
        >
          +
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
        {devboxListLoading && (
          <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 px-3 py-2 rounded-md shadow-md z-10">
            Loading devboxes...
          </div>
        )}

        {/* Error indicator */}
        {devboxListError && (
          <div className="absolute top-4 left-4 bg-red-100 text-red-800 px-3 py-2 rounded-md shadow-md z-10">
            Error loading devboxes: {devboxListError.message}
          </div>
        )}
      </ReactFlow>

      <AnimatePresence>
        <motion.div
          className="fixed bottom-2 w-full z-40"
          initial={false}
          animate={boxAnimate}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
              isLoading={isLoading}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
