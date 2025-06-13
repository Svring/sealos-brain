'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface NodeViewContextType {
  showDetails: (id: string, content: ReactNode) => void;
  hideDetails: () => void;
  activeDetailsId: string | null;
}

const NodeViewContext = createContext<NodeViewContextType | undefined>(undefined);

export const useNodeView = () => {
  const context = useContext(NodeViewContext);
  if (!context) {
    throw new Error('useNodeView must be used within a NodeViewProvider');
  }
  return context;
};

export const NodeViewProvider = ({ children }: { children: ReactNode }) => {
  const [detailsContent, setDetailsContent] = useState<ReactNode | null>(null);
  const [activeDetailsId, setActiveDetailsId] = useState<string | null>(null);

  const showDetails = (id: string, content: ReactNode) => {
    setActiveDetailsId(id);
    setDetailsContent(content);
  };

  const hideDetails = () => {
    setActiveDetailsId(null);
  };

  return (
    <NodeViewContext.Provider value={{ showDetails, hideDetails, activeDetailsId }}>
      {children}
      <AnimatePresence>
        {activeDetailsId && detailsContent && (
          <motion.div
            initial={{ opacity: 0, x: '-50%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-4 right-4 bottom-4 w-[40%] bg-card border border-border rounded-lg shadow-lg p-4 z-50 overflow-auto"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={hideDetails}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            {detailsContent}
          </motion.div>
        )}
      </AnimatePresence>
    </NodeViewContext.Provider>
  );
}; 