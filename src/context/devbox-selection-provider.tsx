"use client";

import { useQuery } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useState } from "react";
import { devboxByNameOptions } from "@/lib/sealos/devbox/devbox-query";
import { transformDevboxAddresses } from "@/lib/sealos/devbox/devbox-transform";
import { useSealosStore } from "@/store/sealos-store";

interface DevboxSelectionContextType {
  selectedDevbox: string;
  setSelectedDevbox: (devboxName: string) => void;
  previewUrl: string;
  devpodUrl: string;
  isLoading: boolean;
  error: string | null;
}

const DevboxSelectionContext = createContext<DevboxSelectionContextType | null>(
  null
);

interface DevboxSelectionProviderProps {
  children: ReactNode;
}

export function DevboxSelectionProvider({
  children,
}: DevboxSelectionProviderProps) {
  const { currentUser, regionUrl } = useSealosStore();
  const [selectedDevbox, setSelectedDevbox] = useState<string>("");

  // Query to get devbox addresses when a devbox is selected
  const devboxAddressesQuery = useQuery(
    devboxByNameOptions(
      currentUser,
      regionUrl,
      selectedDevbox,
      transformDevboxAddresses
    )
  );

  const contextValue: DevboxSelectionContextType = {
    selectedDevbox,
    setSelectedDevbox,
    previewUrl: devboxAddressesQuery.data?.preview_address || "",
    devpodUrl: devboxAddressesQuery.data?.devpod_address || "",
    isLoading: devboxAddressesQuery.isLoading,
    error: devboxAddressesQuery.data?.error || null,
  };

  return (
    <DevboxSelectionContext.Provider value={contextValue}>
      {children}
    </DevboxSelectionContext.Provider>
  );
}

export function useDevboxSelection() {
  const context = useContext(DevboxSelectionContext);
  if (!context) {
    throw new Error(
      "useDevboxSelection must be used within a DevboxSelectionProvider"
    );
  }
  return context;
}
