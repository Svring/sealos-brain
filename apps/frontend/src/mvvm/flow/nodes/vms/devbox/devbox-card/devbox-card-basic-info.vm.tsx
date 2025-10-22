"use client";

import type React from "react";

export const DevboxCardBasicInfo: React.FC = () => {
  // Dummy data
  const runtime = "ghcr.io/labring/sealos-devbox-runtime-node:latest";
  const createdAt = "2025-10-15 14:30:25";

  return (
    <div className="p-2 border rounded-lg w-full min-w-0">
      <div className="flex gap-4 min-w-0">
        {/* Runtime */}
        <div className="flex-1 flex flex-col min-w-0">
          <span className="font-medium text-sm">Runtime</span>
          <span className="text-xs text-muted-foreground truncate">
            {runtime}
          </span>
        </div>

        {/* Created At */}
        <div className="flex-1 flex flex-col">
          <span className="font-medium text-sm">Created</span>
          <span className="text-xs text-muted-foreground truncate">
            {createdAt}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DevboxCardBasicInfo;

