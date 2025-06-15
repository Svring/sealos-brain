"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useControlStore } from "@/store/control-store";

interface NodeViewContextType {
  showDetails: (id: string, content: ReactNode, onClose?: () => void) => void;
  hideDetails: () => void;
  activeDetailsId: string | null;
}

const NodeViewContext = createContext<NodeViewContextType | undefined>(
  undefined
);

export const useNodeView = () => {
  const context = useContext(NodeViewContext);
  if (!context) {
    throw new Error("useNodeView must be used within a NodeViewProvider");
  }
  return context;
};

export const NodeViewProvider = ({ children }: { children: ReactNode }) => {
  const [detailsContent, setDetailsContent] = useState<ReactNode | null>(null);
  const [activeDetailsId, setActiveDetailsId] = useState<string | null>(null);
  const [onCloseHandler, setOnCloseHandler] = useState<(() => void) | null>(
    null
  );
  
  const { syncWithNodeView, closePanel } = useControlStore();

  // Sync with control store whenever activeDetailsId changes
  useEffect(() => {
    syncWithNodeView(activeDetailsId, detailsContent);
  }, [activeDetailsId, detailsContent, syncWithNodeView]);

  const showDetails = (
    id: string,
    content: ReactNode,
    onClose?: () => void
  ) => {
    setActiveDetailsId(id);
    setDetailsContent(content);
    setOnCloseHandler(onClose ? () => onClose : null);
  };

  const hideDetails = () => {
    if (onCloseHandler) {
      onCloseHandler();
      setOnCloseHandler(null);
    }
    setActiveDetailsId(null);
    closePanel(); // Also update control store
  };

  return (
    <NodeViewContext.Provider
      value={{ showDetails, hideDetails, activeDetailsId }}
    >
      {children}
      <AnimatePresence>
        {activeDetailsId && detailsContent && (
          <motion.div
            initial={{ opacity: 0, x: "-50%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-4 right-4 bottom-4 w-[40%] bg-card border border-border rounded-lg shadow-lg p-4 z-50 overflow-auto"
          >
            {detailsContent}
          </motion.div>
        )}
      </AnimatePresence>
    </NodeViewContext.Provider>
  );
};
