"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSealosStore } from "@/store/sealos-store";
import { objectStorageBucketListOptions } from "@/lib/sealos/objectstorage/objectstorage-query";
import { transformObjectStorageToTable } from "@/lib/sealos/objectstorage/objectstorage-transform";
import { DataTable } from "../../ui/data-table";
import { objectstorageColumns } from "./objectstorage-column";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ObjectStorageColumn } from "./objectstorage-table-schema";
import {
  createObjectStorageBucketMutation,
  deleteObjectStorageBucketMutation,
} from "@/lib/sealos/objectstorage/objectstorage-mutation";

export function ObjectStorageTable() {
  const { currentUser, regionUrl } = useSealosStore();
  const queryClient = useQueryClient();
  const [selectedRows, setSelectedRows] = React.useState<ObjectStorageColumn[]>(
    []
  );

  const {
    data: objectstorageData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    objectStorageBucketListOptions(
      currentUser,
      regionUrl,
      transformObjectStorageToTable
    )
  );

  const deleteMutation = deleteObjectStorageBucketMutation(
    currentUser,
    regionUrl
  );
  const createMutation = createObjectStorageBucketMutation(
    currentUser,
    regionUrl
  );

  const handleBulkDelete = async (buckets: ObjectStorageColumn[]) => {
    const promises = buckets.map((bucket) =>
      deleteMutation.mutateAsync(bucket.name)
    );

    try {
      await Promise.all(promises);
    } catch (error: any) {
      console.error("Failed to delete bucket(s):", error);
    }
  };

  const canDelete = selectedRows.length > 0;
  const isActionLoading = deleteMutation.isPending;

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
            {selectedRows.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkDelete(selectedRows)}
                disabled={!canDelete || isActionLoading}
              >
                {isActionLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
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
          <DataTable
            columns={objectstorageColumns}
            data={objectstorageData || []}
            onRowSelectionChange={setSelectedRows}
          />
        )}
      </CardContent>
    </Card>
  );
}
