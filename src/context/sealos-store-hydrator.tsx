"use client";

import { useEffect, useState } from "react";
import { useSealosStore } from "@/store/sealos-store";
import { User } from "@/payload-types";

interface SealosStoreHydratorProps {
  user: User;
}

export function SealosStoreHydrator({ user }: SealosStoreHydratorProps) {
  const [isClient, setIsClient] = useState(false);
  const setCurrentUser = useSealosStore((state) => state.setCurrentUser);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      console.log("🔄 SealosStoreHydrator - Setting current user:", user);
      setCurrentUser(user);
    }
  }, [user, setCurrentUser, isClient]);

  // This component doesn't render anything - it just hydrates the store
  return null;
}
