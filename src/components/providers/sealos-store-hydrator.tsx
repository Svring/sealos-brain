"use client";

import { useEffect } from "react";
import { useSealosStore } from "@/store/sealos-store";
import { User } from "@/payload-types";

interface SealosStoreHydratorProps {
  user: User;
}

export function SealosStoreHydrator({ user }: SealosStoreHydratorProps) {
  const setCurrentUser = useSealosStore((state) => state.setCurrentUser);

  useEffect(() => {
    console.log("🔄 SealosStoreHydrator - Setting current user:", user);
    setCurrentUser(user);
  }, [user, setCurrentUser]);

  // This component doesn't render anything - it just hydrates the store
  return null;
} 