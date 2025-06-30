"use client";

// Force dynamic rendering since the layout uses headers()
export const dynamic = "force-dynamic";

import { useQueryClient } from "@tanstack/react-query";
import {
  Background,
  BackgroundVariant,
  type NodeChange,
  ReactFlow,
} from "@xyflow/react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Eye, Logs, Plus, RefreshCw, Spline } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PromptInputBox } from "@/components/ai-chat/ai-prompt-box";
import edgeTypes from "@/components/flow/edge/edge-types";
import NodeCreateView from "@/components/flow/node/create/node-create-view";
import nodeTypes from "@/components/flow/node/node-types";
import { GraphBackMenu } from "@/components/graph/graph-back-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { MenuBar, type MenuBarItem } from "@/components/ui/menu-bar";
import { MessageSwiper } from "@/components/ui/message-swiper";
import { CopilotStateProvider } from "@/context/copilot-state-provider";
import { usePanel } from "@/context/panel-provider";
import {
  MessageRole,
  TextMessage,
  useGraphCopilotChat,
} from "@/hooks/use-graph-copilot-chat";
import { useGraphSpecific } from "@/hooks/use-graph-specific";
import { useActivateGraphActions } from "@/lib/agent/actions/graph-action";
import { sealosBrainConfig } from "@/lib/agent/sealos-brain";
import { useSealosStore } from "@/store/sealos-store";

// Debug utility (no-op in production, can be toggled for dev)
const debugLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug(...args);
  }
};

function Hydrated({
  children,
  graphName,
}: {
  children: React.ReactNode;
  graphName: string;
}) {
  const { enhancedNodes, parsedEdges, isLoading } = useGraphSpecific(graphName);
  const { setCurrentGraphName } = useSealosStore();

  // Set the current graph name in the store
  useEffect(() => {
    setCurrentGraphName(graphName);
    console.log("🔍 Setting current graph name:", graphName);
    return () => {
      // Clear the graph name when component unmounts
      setCurrentGraphName(null);
    };
  }, [graphName, setCurrentGraphName]);

  debugLog(
    "[Hydrated] graphName:",
    graphName,
    "isLoading:",
    isLoading,
    "enhancedNodes:",
    enhancedNodes,
    "parsedEdges:",
    parsedEdges
  );

  // Wait for data to be loaded and nodes/edges to be available
  if (isLoading || (enhancedNodes.length === 0 && parsedEdges.length === 0)) {
    debugLog(
      "[Hydrated] Still loading or no data available, showing loading state"
    );
    return <Loading fullPage text={`Loading ${graphName}...`} />;
  }

  debugLog("[Hydrated] Data ready, rendering children");
  return <>{children}</>;
}

function GraphPageContent({ graphName }: { graphName: string }) {
  const {
    onNodesChange,
    isLoading,
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
    renameGraph,
  } = useGraphSpecific(graphName);

  useActivateGraphActions();

  // Debug: Log graphName and initial states
  debugLog("[GraphPageContent] graphName:", graphName);
  debugLog("[GraphPageContent] enhancedNodes (init):", enhancedNodes);
  debugLog("[GraphPageContent] parsedEdges (init):", parsedEdges);

  const { closePanel, openPanel, Id: panelId } = usePanel();

  const queryClient = useQueryClient();

  const {
    visibleMessages,
    appendMessage,
    isLoading: isChatLoading,
    isMessageSwiperExpanded,
    setIsMessageSwiperExpanded,
  } = useGraphCopilotChat();

  // Add refreshKey state
  const [refreshKey, setRefreshKey] = useState(0);

  // Add refresh handler that invalidates all graph-related queries
  const handleRefresh = useCallback(() => {
    debugLog("[handleRefresh] Called");
    queryClient.invalidateQueries({ queryKey: ["k8s", "direct"] });
    queryClient.invalidateQueries({ queryKey: ["graphs"] });
    queryClient.invalidateQueries({ queryKey: ["graph"] });
    handleApplyLayout("BT");
    setRefreshKey((k) => k + 1);
  }, [queryClient, handleApplyLayout]);

  // Ref to track if we've already applied layout to prevent infinite loops
  const layoutAppliedRef = useRef(false);

  // Automatically apply BT layout when nodes are unpositioned (e.g., on data refresh)
  useEffect(() => {
    debugLog(
      "[useEffect:layout] enhancedNodes:",
      enhancedNodes,
      "isLoading:",
      isLoading
    );
    if (enhancedNodes.length === 0 || isLoading) {
      return;
    }

    // Only apply automatic layout if there are edges
    // If no edges exist, preserve the manual grid positioning
    const hasEdges = parsedEdges.length > 0;
    if (!hasEdges) {
      debugLog("[useEffect:layout] No edges exist, skipping automatic layout");
      return;
    }

    // Detect if any node still needs layout (position remains at origin)
    const needsLayout = enhancedNodes.some(
      (node) => node.position.x === 0 && node.position.y === 0
    );

    debugLog(
      "[useEffect:layout] needsLayout:",
      needsLayout,
      "layoutAppliedRef:",
      layoutAppliedRef.current
    );

    // Only apply layout if needed and not already applied
    if (needsLayout && !layoutAppliedRef.current) {
      layoutAppliedRef.current = true;
      debugLog("[useEffect:layout] Applying layout (BT)");
      handleApplyLayout("BT");
    } else if (!needsLayout) {
      // Reset the flag when nodes are properly positioned
      layoutAppliedRef.current = false;
    }
  }, [enhancedNodes, isLoading, handleApplyLayout, parsedEdges]);

  const handleNodesChange = (changes: NodeChange[]) => {
    debugLog("[handleNodesChange] changes:", changes, "editMode:", editMode);
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
    debugLog("[handleApplyConnectionsWithRefresh] Called");
    await handleApplyConnections();
    // Recalculate layout after applying new edges
    handleApplyLayout("BT");
    setRefreshKey((k) => k + 1);
  };

  // Handle edge clicks in edit mode
  const handleEdgeClickEvent = useCallback(
    (
      clickEvent: React.MouseEvent,
      edge: { data?: { onClick?: (event: React.MouseEvent) => void } }
    ) => {
      debugLog("[handleEdgeClickEvent] editMode:", editMode, "edge:", edge);
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
      icon: RefreshCw,
      label: "Refresh",
      onClick: handleRefresh,
    },
    {
      icon: Eye,
      label: "Observability",
      onClick: () => {
        // TODO: Implement observability functionality
        debugLog("Observability clicked");
      },
    },
    {
      icon: Logs,
      label: "Logs",
      onClick: () => {
        // TODO: Implement logs functionality
        debugLog("Logs clicked");
      },
    },
    // {
    //   icon: Spline,
    //   label: "Edit Mode",
    //   isToggle: true,
    //   pressed: editMode,
    //   onPressedChange: (pressed) => {
    //     if (pressed) {
    //       setEditMode(true);
    //     } else {
    //       handleQuitEditMode();
    //     }
    //   },
    // },
  ];

  const boxAnimate = useMemo(() => {
    debugLog("[boxAnimate] panelId:", panelId);
    return {
      left: panelId ? "30%" : "50%",
      x: "-50%",
      width: panelId ? "60%" : "640px",
    };
  }, [panelId]);

  // Debug: Log on every render
  debugLog(
    "[GraphPageContent:render] enhancedNodes:",
    enhancedNodes,
    "parsedEdges:",
    parsedEdges,
    "isLoading:",
    isLoading
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
            <div className="pointer-events-auto mx-auto mt-4 w-full max-w-2xl">
              <Alert variant="default">
                <AlertDescription>
                  <div className="flex items-center gap-2 text-foreground text-sm">
                    <span>
                      Click nodes to connect them, click edges to delete them
                      {selectedNodes.length > 0 &&
                        `, Nodes: ${selectedNodes.length}/2`}
                      {selectedEdges.length > 0 &&
                        `, Edges: ${selectedEdges.length}`}
                    </span>
                    <div className="flex flex-col gap-1 text-muted-foreground text-xs">
                      {pendingEdges.length > 0 && (
                        <span>
                          New:{" "}
                          {pendingEdges
                            .map(
                              (edge: { source: string; target: string }) =>
                                `${edge.source} → ${edge.target}`
                            )
                            .join(", ")}
                        </span>
                      )}
                      {pendingEdgeDeletions.length > 0 && (
                        <span>
                          Deleting:{" "}
                          {pendingEdgeDeletions
                            .map(
                              (edge: {
                                sourceResourceType: string;
                                sourceResourceName: string;
                                targetResourceType: string;
                                targetResourceName: string;
                              }) =>
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
        <GraphBackMenu graphName={graphName} onRename={renameGraph} />
        <MenuBar items={menuItems} />
      </div>

      <ReactFlow
        edges={parsedEdges}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{
          padding: 0.1,
          includeHiddenNodes: false,
          minZoom: 0.1,
          maxZoom: 1.0,
        }}
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
    params.then(({ "graph-name": name }) => {
      const decoded = decodeURIComponent(name);
      debugLog("[GraphPage] params resolved, graphName:", decoded);
      setGraphName(decoded);
    });
  }, [params]);

  // Debug: Log graphName state
  debugLog("[GraphPage:render] graphName:", graphName);

  if (!graphName) {
    debugLog("[GraphPage] graphName not set, loading...");
    return <Loading fullPage text="Loading graph..." />;
  }

  return (
    <CopilotStateProvider
      providerConfig={{
        runtimeUrl: sealosBrainConfig.providerConfig.runtimeUrl,
        agent: sealosBrainConfig.providerConfig.agent,
      }}
    >
      <Hydrated graphName={graphName}>
        <GraphPageContent graphName={graphName} />
      </Hydrated>
    </CopilotStateProvider>
  );
}
