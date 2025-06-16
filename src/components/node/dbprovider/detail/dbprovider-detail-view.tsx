import React from "react";

interface DBProviderDetailsProps {
  dbName: string;
}

export default function DBProviderDetails({ dbName }: DBProviderDetailsProps) {
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Database Details</h3>
      <div className="space-y-2">
        <div>
          <span className="font-medium">Database Name:</span> {dbName}
        </div>
        <div className="text-sm text-muted-foreground">
          Detailed database information and management options will be available here.
        </div>
      </div>
    </div>
  );
} 