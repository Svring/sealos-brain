"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  ReactFlowProvider,
} from "@xyflow/react";
import { useQuery } from "@tanstack/react-query";
import { devboxListOptions } from "@/hooks/use-sealos-devbox";
import { useSealosStore } from "@/store/sealos-store";
import { transformDevboxListIntoNode } from "@/lib/devbox/devbox-utils";
import nodeTypes from "@/components/node/node-types";
// import DevboxDetails from "@/components/node/devbox/detail/view/devbox-detail-view";
// import DevboxCreateView from "@/components/node/devbox/create/view/devbox-create-view";
// import NodeCreateView from "@/components/node/create/node-create-view";
// import edgeTypes from "@/components/edge/edge-types";
// import { PromptInputBox } from "@/components/ai/ai-prompt-box";
// import { MenuBar } from "@/components/ui/bottom-menu";
// import { MessageSwiper } from "@/components/ui/message-swiper";
// import { motion, AnimatePresence } from "framer-motion";

const initialNodes: any[] = [];
const initialEdges: any[] = [];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const messageContentRef = useRef<any>(null);
  const prevMessagesLength = useRef(messages.length);
  const [isInputExpanded, setIsInputExpanded] = useState(true);
  const promptTextareaRef = useRef<any>(null);
  const { regionUrl, currentUser } = useSealosStore();

  // Fetch devbox list using the new query
  const {
    data: devboxList,
    isLoading: devboxListLoading,
    error: devboxListError,
  } = useQuery(devboxListOptions(currentUser, regionUrl));

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
      <ReactFlow
        panOnScroll
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        // edgeTypes={edgeTypes} // Uncomment if edgeTypes is available
        // onPaneClick={hideDetails} // Uncomment if hideDetails is available
        // onNodeClick={handleNodeClick} // Uncomment if handleNodeClick is available
      >
        <Background variant={BackgroundVariant.Dots} gap={60} size={1} />
        <Controls />

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

        {/* No data indicator */}
        {!devboxListLoading &&
          !devboxListError &&
          devboxList &&
          devboxList.length === 0 && (
            <div className="absolute top-4 left-4 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md shadow-md z-10">
              No devboxes found
            </div>
          )}
      </ReactFlow>
      {/*
      <AnimatePresence>
        {isInputExpanded && (
          <motion.div>
            {messages.length > 0 && (
              <motion.div>
                <MessageSwiper
                  messages={messages}
                  currentIndex={currentMessageIndex}
                  onIndexChange={setCurrentMessageIndex}
                  isExpanded={isExpanded}
                />
              </motion.div>
            )}
            <motion.div>
              <PromptInputBox
                textareaRef={promptTextareaRef}
                onSend={onMessageSend}
                isLoading={isLoading}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div>
        <MenuBar items={menuItems} />
      </motion.div>
      */}
    </div>
  );
}
