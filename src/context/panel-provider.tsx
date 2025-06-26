"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NodeViewContextType {
  openPanel: (id: string, content: ReactNode, onClose?: () => void) => void;
  closePanel: () => void;
  Id: string | null;
}

const PanelContext = createContext<NodeViewContextType | undefined>(undefined);

export const usePanel = () => {
  const context = useContext(PanelContext);
  if (!context) {
    throw new Error("usePanel must be used within a PanelProvider");
  }
  return context;
};

export const PanelProvider = ({ children }: { children: ReactNode }) => {
  const [Content, setContent] = useState<ReactNode | null>(null);
  const [Id, setId] = useState<string | null>(null);
  const [onCloseHandler, setOnCloseHandler] = useState<(() => void) | null>(
    null
  );

  const openPanel = (id: string, content: ReactNode, onClose?: () => void) => {
    setId(id);
    setContent(content);
    setOnCloseHandler(onClose ? () => onClose : null);
  };

  const closePanel = () => {
    if (onCloseHandler) {
      onCloseHandler();
      setOnCloseHandler(null);
    }
    setId(null);
  };

  return (
    <PanelContext.Provider value={{ openPanel, closePanel, Id }}>
      {children}
      <AnimatePresence>
        {Id && Content && (
          <motion.div
            initial={{ opacity: 0, x: "30%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.2 }}
            className="fixed top-2 right-2 bottom-2 w-[40%] bg-background border border-border rounded-lg shadow-lg z-50"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 z-10"
              onClick={closePanel}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close panel</span>
            </Button>
            <div className="h-full w-full overflow-auto p-4">{Content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </PanelContext.Provider>
  );
};
