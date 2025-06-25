"use client";

import {
  Background,
  BackgroundVariant,
  type NodeChange,
  ReactFlow,
} from "@xyflow/react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Plus, Spline } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PromptInputBox } from "@/components/ai-chat/ai-prompt-box";
import edgeTypes from "@/components/flow/edge/edge-types";
import NodeCreateView from "@/components/flow/node/create/node-create-view";
import nodeTypes from "@/components/flow/node/node-types";
import { GraphBackMenu } from "@/components/graph/graph-back-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MenuBar, type MenuBarItem } from "@/components/ui/menu-bar";
import { MessageSwiper } from "@/components/ui/message-swiper";
import { CopilotStateProvider } from "@/context/copilot-state-provider";
import { usePanel } from "@/context/panel-provider";
import { useGraph } from "@/hooks/use-graph";
import {
  MessageRole,
  TextMessage,
  useGraphCopilotChat,
} from "@/hooks/use-graph-copilot-chat";

function GraphPageContent({ graphName }: { graphName: string }) {
  const {
    onNodesChange,
    isLoading,
    error,
    editMode,
    setEditMode,
    selectedNodes,
    selectedEdges,
    pendingEdges,
    pendingEdgeDeletions,
    parsedEdges,
    handleApplyConnections,
    handleQuitEditMode,
    enhancedNodes,
    isApplyingConnections,
    handleApplyLayout,
  } = useGraph(graphName);

  const { closePanel, openPanel, Id: panelId } = usePanel();

  const {
    visibleMessages,
    appendMessage,
    isLoading: isChatLoading,
    isMessageSwiperExpanded,
    setIsMessageSwiperExpanded,
  } = useGraphCopilotChat();

  // Add refreshKey state
  const [refreshKey, setRefreshKey] = useState(0);

  // Automatically apply BT layout when nodes are unpositioned (e.g., on data refresh)
  useEffect(() => {
    if (enhancedNodes.length === 0 || isLoading) return;

    // Detect if any node still needs layout (position remains at origin)
    const needsLayout = enhancedNodes.some(
      (n) => n.position.x === 0 && n.position.y === 0
    );

    if (needsLayout) {
      handleApplyLayout("BT");
    }
  }, [enhancedNodes, isLoading, handleApplyLayout]);

  const handleNodesChange = (changes: NodeChange[]) => {
    if (editMode) {
      const selectionChanges = changes.filter(
        (change) => change.type === "select"
      );
      if (selectionChanges.length > 0) {
        return;
      }
    }
    onNodesChange(changes);
  };

  // Wrap handleApplyConnections to increment refreshKey after applying
  const handleApplyConnectionsWithRefresh = async () => {
    await handleApplyConnections();
    setRefreshKey((k) => k + 1);
  };

  // Handle edge clicks in edit mode
  const handleEdgeClickEvent = useCallback(
    (
      clickEvent: React.MouseEvent,
      edge: { data?: { onClick?: (event: React.MouseEvent) => void } }
    ) => {
      if (editMode && edge.data?.onClick) {
        edge.data.onClick(clickEvent);
      }
    },
    [editMode]
  );

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
    {
      icon: Spline,
      label: "Edit Mode",
      isToggle: true,
      pressed: editMode,
      onPressedChange: (pressed) => {
        if (pressed) {
          setEditMode(true);
        } else {
          handleQuitEditMode();
        }
      },
    },
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
      <AnimatePresence>
        {editMode && (
          <motion.div
            animate={{ y: 0, opacity: 1 }}
            className="pointer-events-none absolute top-0 left-0 z-[100] flex w-full justify-center"
            exit={{ y: "-100%", opacity: 0 }}
            initial={{ y: "-100%", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.2,
            }}
          >
            <div className="pointer-events-auto mx-auto mt-4 w-full max-w-4xl">
              <Alert variant="default">
                <AlertDescription>
                  <div className="flex items-center gap-2 text-foreground text-sm">
                    <span>
                      Click nodes to connect them • Click edges to delete them
                      {selectedNodes.length > 0 &&
                        ` • Nodes: ${selectedNodes.length}/2`}
                      {selectedEdges.length > 0 &&
                        ` • Edges: ${selectedEdges.length}`}
                    </span>
                    <div className="flex flex-col gap-1 text-muted-foreground text-xs">
                      {pendingEdges.length > 0 && (
                        <span>
                          New:{" "}
                          {pendingEdges
                            .map((edge) => `${edge.source} → ${edge.target}`)
                            .join(", ")}
                        </span>
                      )}
                      {pendingEdgeDeletions.length > 0 && (
                        <span>
                          Deleting:{" "}
                          {pendingEdgeDeletions
                            .map(
                              (edge) =>
                                `${edge.sourceResourceType}-${edge.sourceResourceName} → ${edge.targetResourceType}-${edge.targetResourceName}`
                            )
                            .join(", ")}
                        </span>
                      )}
                    </div>
                    <Button
                      className="ml-2 h-6 px-2 py-0 text-xs"
                      onClick={handleQuitEditMode}
                      size="sm"
                      variant="outline"
                    >
                      Quit
                    </Button>
                    <Button
                      className="h-6 px-2 py-0 text-xs"
                      disabled={
                        (pendingEdges.length === 0 &&
                          pendingEdgeDeletions.length === 0) ||
                        isApplyingConnections
                      }
                      onClick={handleApplyConnectionsWithRefresh}
                      size="sm"
                    >
                      {isApplyingConnections
                        ? "Applying..."
                        : `Apply (${pendingEdges.length + pendingEdgeDeletions.length})`}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute top-4 right-4 left-4 z-50 flex items-center justify-between">
        <GraphBackMenu graphName={graphName} />
        <MenuBar items={menuItems} />
      </div>

      <ReactFlow
        edges={parsedEdges}
        edgeTypes={edgeTypes}
        fitView
        key={refreshKey}
        nodes={enhancedNodes}
        nodeTypes={nodeTypes}
        onEdgeClick={handleEdgeClickEvent}
        onNodesChange={handleNodesChange}
        onPaneClick={closePanel}
        panOnScroll
      >
        <Background gap={60} size={1} variant={BackgroundVariant.Dots} />
        {isLoading && (
          <div className="absolute top-20 left-4 z-10 rounded-md bg-blue-100 px-3 py-2 text-blue-800 shadow-md">
            Loading {graphName}...
          </div>
        )}
        {error && (
          <div className="absolute top-20 left-4 z-10 rounded-md bg-red-100 px-3 py-2 text-red-800 shadow-md">
            Error: {error}
          </div>
        )}
      </ReactFlow>

      <AnimatePresence>
        <motion.div
          animate={boxAnimate}
          className="absolute bottom-2 z-40 max-w-xl"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <AnimatePresence>
            {!editMode && (
              <motion.div
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                initial={{ y: "100%", opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: 0.2,
                }}
              >
                <motion.div className="translate-y-3">
                  <MessageSwiper
                    isExpanded={isMessageSwiperExpanded}
                    messages={visibleMessages}
                  />
                </motion.div>
                <motion.div className="relative w-full">
                  <motion.button
                    animate={{ rotate: isMessageSwiperExpanded ? 0 : 180 }}
                    className="-top-4 -translate-x-1/2 absolute left-1/2 cursor-pointer rounded-full p-2"
                    onClick={() =>
                      setIsMessageSwiperExpanded(!isMessageSwiperExpanded)
                    }
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.button>
                  <PromptInputBox
                    isLoading={isChatLoading}
                    onSend={(content: string) =>
                      appendMessage(
                        new TextMessage({ content, role: MessageRole.User })
                      )
                    }
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
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
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-gray-900 border-b-2" />
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
