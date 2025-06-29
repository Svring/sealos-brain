"use client";

import { useRef } from "react";
import type { User } from "@/payload-types";
import { useSealosStore } from "@/store/sealos-store";

interface SealosStoreHydratorProps {
  user: User;
}

// Hydrates the Zustand store with the authenticated user *before* any child
// components read from the store. Because writing to an external store doesn't
// affect React's render cycle, it's safe to do this during render.
export function SealosStoreHydrator({ user }: SealosStoreHydratorProps) {
  const setCurrentUser = useSealosStore((state) => state.setCurrentUser);
  const isHydrated = useRef(false);

  // Set the user exactly once during the very first render on the client.
  if (!isHydrated.current) {
    setCurrentUser(user);
    isHydrated.current = true;
  }

  // This component doesn't render anything – it only performs the hydration.
  return null;
}
