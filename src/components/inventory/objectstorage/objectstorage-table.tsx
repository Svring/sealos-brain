"use client";

import { useQuery } from "@tanstack/react-query";
import { useSealosStore } from "@/store/sealos-store";
import { objectStorageBucketListOptions } from "@/lib/sealos/objectstorage/objectstorage-query";
import { transformObjectStorageToTable } from "@/lib/sealos/objectstorage/objectstorage-transform";
import { DataTable } from "../../ui/data-table";
import { objectstorageColumns } from "./objectstorage-column";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export function ObjectStorageTable() {
  const { currentUser, regionUrl } = useSealosStore();

  const {
    data: objectstorageData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    objectStorageBucketListOptions(currentUser, regionUrl, transformObjectStorageToTable)
  );

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Object Storage Buckets</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load object storage data: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Object Storage Buckets</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Bucket
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <DataTable columns={objectstorageColumns} data={objectstorageData || []} />
        )}
      </CardContent>
    </Card>
  );
} 