"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useSidebarVisibility } from "@/hooks/use-sidebar-visibility";

interface SidebarStateContextType {
  open: boolean;
  pinned: boolean;
  setOpen: (value: boolean) => void;
  enterHotZone: () => void;
  leaveSidebar: () => void;
  enterSidebar: () => void;
  togglePin: () => void;
}

const SidebarStateContext = createContext<SidebarStateContextType | undefined>(
  undefined
);

export function useSidebarState() {
  const context = useContext(SidebarStateContext);
  if (!context) {
    throw new Error(
      "useSidebarState must be used within a SidebarStateProvider"
    );
  }
  return context;
}

interface SidebarStateProviderProps {
  children: ReactNode;
}

export function SidebarStateProvider({ children }: SidebarStateProviderProps) {
  const sidebarState = useSidebarVisibility();

  return (
    <SidebarStateContext.Provider value={sidebarState}>
      {children}
    </SidebarStateContext.Provider>
  );
} 