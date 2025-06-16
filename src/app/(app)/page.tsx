"use client";

import { useEffect, useState, useMemo } from "react";
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
import { transformDBProviderListIntoNode } from "@/lib/dbprovider/dbprovider-transform";
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
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSidebarControl } from "@/hooks/use-sidebar-control";
import { dbProviderListOptions } from "@/lib/dbprovider/dbprovider-query";
  
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

  const {
    data: dbproviderList,
    isLoading: dbproviderListLoading,
    error: dbproviderListError,
  } = useQuery(dbProviderListOptions(currentUser, regionUrl, transformDBProviderListIntoNode));

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

  // Transform both devbox and dbprovider list data into nodes and set them locally
  useEffect(() => {
    console.log("🔍 Query states:", {
      devbox: {
        loading: devboxListLoading,
        error: devboxListError,
        data: devboxList,
      },
      dbprovider: {
        loading: dbproviderListLoading,
        error: dbproviderListError,
        data: dbproviderList,
      },
      currentUser: currentUser?.id,
      regionUrl,
    });

    const allNodes: Node[] = [];

    // Process devbox nodes
    if (devboxList && devboxList.length > 0) {
      try {
        console.log("🔄 Transforming devbox list to nodes:", devboxList);
        const lightweightData = transformDevboxListIntoNode(devboxList);
        const devboxNodes = lightweightData.map((item, index) => ({
          id: item.id,
          type: "devbox",
          position: { x: 300 + index * 280, y: 200 },
          data: item,
        }));
        allNodes.push(...devboxNodes);
        console.log("✅ Generated devbox nodes:", devboxNodes);
      } catch (error) {
        console.error("❌ Error transforming devbox list to nodes:", error);
      }
    }

    // Process dbprovider nodes (data is already transformed)
    if (dbproviderList && dbproviderList.length > 0) {
      try {
        console.log("🔄 Creating dbprovider nodes from transformed data:", dbproviderList);
        const dbproviderNodes = dbproviderList.map((item: any, index: number) => ({
          id: item.id,
          type: "dbprovider",
          position: { x: 300 + index * 280, y: 400 }, // Position below devbox nodes
          data: item,
        }));
        allNodes.push(...dbproviderNodes);
        console.log("✅ Generated dbprovider nodes:", dbproviderNodes);
      } catch (error) {
        console.error("❌ Error creating dbprovider nodes:", error);
      }
    }

    // Set all nodes at once
    setNodes(allNodes);

    if (allNodes.length === 0) {
      console.log("📭 No nodes found, clearing flow");
    }
  }, [
    devboxList,
    dbproviderList,
    setNodes,
    devboxListLoading,
    dbproviderListLoading,
    devboxListError,
    dbproviderListError,
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
        {(devboxListLoading || dbproviderListLoading) && (
          <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 px-3 py-2 rounded-md shadow-md z-10">
            Loading {devboxListLoading && dbproviderListLoading ? "devboxes and databases" : devboxListLoading ? "devboxes" : "databases"}...
          </div>
        )}

        {/* Error indicator */}
        {(devboxListError || dbproviderListError) && (
          <div className="absolute top-4 left-4 bg-red-100 text-red-800 px-3 py-2 rounded-md shadow-md z-10">
            Error loading: {devboxListError?.message || dbproviderListError?.message}
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
              isLoading={isLoading}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
