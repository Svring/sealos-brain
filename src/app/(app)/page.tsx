"use client";

import { PromptInputBox } from "@/components/ai/ai-prompt-box";
import { MenuBar } from "@/components/ui/bottom-menu";
import { MessageSwiper } from "@/components/ui/message-swiper";
import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type OnConnect,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";

import { invokeAgentChat } from "@/lib/backbone/backbone-provider";
import { transformToNodeData } from "@/lib/devbox/devbox-utils";
import { runWake } from "@/lib/wake";
import { useSealosStore } from "@/store/sealos-store";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import nodeTypes from "@/components/node/node-types";
import edgeTypes from "@/components/edge/edge-types";
import {
  NodeViewProvider,
  useNodeView,
} from "@/components/node/node-view-provider";
import DevboxDetails from "@/components/node/devbox/detail/view/devbox-detail-view";
import { useSealosDevbox } from "@/hooks/use-sealos-devbox";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

function FlowContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { setCenter, getZoom, setViewport } = useReactFlow();
  const { showDetails, hideDetails, activeDetailsId } = useNodeView();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const messageContentRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);
  const [isInputExpanded, setIsInputExpanded] = useState(true);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const dataLoadedRef = useRef(false);
  const { fetchDevboxReadyStatus } = useSealosDevbox();

  // Sealos Store - only consume data, don't fetch
  const { devbox, regionUrl } = useSealosStore();

  // Get debug function from store
  const { debugPrintState } = useSealosStore();

  // Create debug menu items with access to component functions
  const debugMenuItems = [
    {
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          {...props}
        >
          <title>debug-store</title>
          <g
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <circle cx="9" cy="9" r="7.25" />
            <path d="M9 5.75v6.5" />
            <path d="M6.25 9h5.5" />
          </g>
        </svg>
      ),
      label: "Debug Store",
      onClick: () => {
        console.log("🔍 Debug: Printing store state");
        debugPrintState();
      },
    },
    {
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          {...props}
        >
          <title>refresh</title>
          <g
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path d="M2.75 9a6.25 6.25 0 0 1 10.61-4.39L15.25 2.75" />
            <path d="M15.25 6.25v-3.5h-3.5" />
            <path d="M15.25 9a6.25 6.25 0 0 1-10.61 4.39L2.75 15.25" />
            <path d="M2.75 11.75v3.5h3.5" />
          </g>
        </svg>
      ),
      label: "Refresh Data",
      onClick: () => {
        console.log("🔄 Debug: Refreshing devbox data");
        refreshDevboxData();
      },
    },
    {
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          {...props}
        >
          <title>check-nodes</title>
          <g
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <rect x="2.75" y="2.75" width="12.5" height="12.5" rx="2" />
            <path d="M6.25 9l2 2 3.5-4" />
          </g>
        </svg>
      ),
      label: "Check Nodes",
      onClick: () => {
        console.log("📊 Debug: Current nodes count:", nodes.length);
        console.log("📊 Debug: Current nodes:", nodes);
      },
    },
  ];

  // Combine base menu items with debug items
  const menuItems = [...debugMenuItems];

  // Combined effect for message handling and auto-expansion
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      setCurrentMessageIndex(messages.length - 1);
      setIsExpanded(true);
      const timer = setTimeout(() => setIsExpanded(false), 3000);
      prevMessagesLength.current = messages.length;
      return () => clearTimeout(timer);
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length]);

  // Combined effect for keyboard handling and input focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !e.repeat &&
        document.activeElement === document.body
      ) {
        setIsInputExpanded((prev) => !prev);
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Focus textarea when input is expanded
    if (isInputExpanded && promptTextareaRef.current) {
      promptTextareaRef.current.focus();
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInputExpanded]);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const refreshDevboxData = useCallback(() => {
    console.log("🔄 Refreshing devbox data from store");

    const devboxListData = devbox.getDevboxList?.data;
    if (!devboxListData || devboxListData.length === 0) {
      console.log("⚠️ No devbox data available in store");
      setNodes([]);
      return;
    }

    (async () => {
      try {
        // Fetch ready status for each devbox to get their public URL
        const readyDataMap = new Map<string, any>();
        await Promise.all(
          devboxListData.map(async (pair: any) => {
            const devboxItem = pair.find((item: any) => item.kind === "Devbox");
            if (devboxItem) {
              const name = devboxItem.metadata.name;
              try {
                const ready = await fetchDevboxReadyStatus(name);
                readyDataMap.set(name, ready);
              } catch (err) {
                console.error(`Error fetching ready status for ${name}:`, err);
              }
            }
          })
        );

        const nodeData = transformToNodeData(devboxListData, readyDataMap);
        console.log("📊 Processed lightweight nodeData with URLs:", nodeData);

        setNodes(nodeData);
        console.log("✅ Nodes updated from store data");
      } catch (error) {
        console.error("❌ Error processing devbox data from store:", error);
        setNodes([]);
      }
    })();
  }, [
    devbox.getDevboxList?.data,
    devbox.getDevboxList?.timestamp,
    fetchDevboxReadyStatus,
    setNodes,
  ]);

  const onMessageSend = useCallback(async (message: string, files?: File[]) => {
    setIsExpanded(true);
    setIsLoading(true);
    try {
      const response = await invokeAgentChat("1", message, files);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: response.response,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Data consumption effect - only consume data from store
  useEffect(() => {
    console.log("🔄 Data consumption effect triggered");
    console.log("📊 devbox.getDevboxList:", devbox.getDevboxList);

    const devboxListData = devbox.getDevboxList?.data;
    if (!devboxListData || devboxListData.length === 0) {
      console.log("⚠️ No devbox data available in store yet");
      return;
    }

    if (dataLoadedRef.current) {
      console.log("✅ Data already processed, skipping");
      return;
    }

    refreshDevboxData();
    dataLoadedRef.current = true;
  }, [
    devbox.getDevboxList?.data,
    devbox.getDevboxList?.timestamp,
    refreshDevboxData,
  ]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      // Create DevboxDetails component with devboxName from node data
      const devboxName = (node.data as any).devboxName;
      const detailsComponent = <DevboxDetails devboxName={devboxName} />;

      showDetails(node.id, detailsComponent);
      const screenWidth = window.innerWidth;
      const leftAreaCenter = screenWidth * 0.3;
      const finalZoom = Math.max(Math.min(getZoom(), 1.0), 0.6);
      setCenter(
        node.position.x + (node.width || 200) / 2,
        node.position.y + (node.height || 100) / 2,
        { zoom: finalZoom, duration: 800 }
      );
      setTimeout(() => {
        const viewport = {
          x:
            leftAreaCenter -
            (node.position.x + (node.width || 200) / 2) * finalZoom,
          y:
            window.innerHeight / 2 -
            (node.position.y + (node.height || 100) / 2) * finalZoom,
          zoom: finalZoom,
        };
        setViewport(viewport, { duration: 400 });
      }, 100);
    },
    [showDetails, getZoom, setCenter, setViewport]
  );

  return (
    <>
      <ReactFlow
        panOnScroll
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onPaneClick={hideDetails}
        onNodeClick={handleNodeClick}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
      <AnimatePresence>
        {isInputExpanded && (
          <motion.div
            key="input-box"
            className="fixed bottom-0 w-[35%] min-w-[400px] max-w-[600px] z-50 flex flex-col gap-0 bg-transparent p-4 rounded-lg"
            initial={{ y: 100, opacity: 0, x: "-50%", left: "50%" }}
            animate={{
              y: 0,
              opacity: 1,
              x: "-50%",
              left: activeDetailsId ? "30%" : "50%",
            }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {messages.length > 0 && (
              <motion.div
                className="overflow-hidden transform translate-y-3 relative z-0"
                initial={false}
                animate={{ height: isExpanded ? "auto" : 45 }}
              >
                <MessageSwiper
                  messages={messages}
                  currentIndex={currentMessageIndex}
                  onIndexChange={setCurrentMessageIndex}
                  isExpanded={isExpanded}
                />
              </motion.div>
            )}
            <motion.div className="relative z-10">
              <PromptInputBox
                textareaRef={promptTextareaRef}
                onSend={onMessageSend}
                isLoading={isLoading}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="fixed top-5 right-5 z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <MenuBar items={menuItems} />
      </motion.div>
    </>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <NodeViewProvider>
        <FlowContent />
      </NodeViewProvider>
    </ReactFlowProvider>
  );
}
