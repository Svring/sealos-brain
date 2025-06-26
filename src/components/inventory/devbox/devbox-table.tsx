"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSealosStore } from "@/store/sealos-store";
import { devboxListOptions } from "@/lib/sealos/devbox/devbox-query";
import { transformDevboxListToTable } from "@/lib/sealos/devbox/devbox-transform";
import { DataTable } from "../../ui/data-table";
import { devboxColumns } from "./devbox-column";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Play, Square, Trash2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { DevboxColumn } from "./devbox-table-schema";
import {
  startDevboxMutation,
  shutdownDevboxMutation,
  deleteDevboxMutation,
} from "@/lib/sealos/devbox/devbox-mutation";
import { toast } from "sonner";
import { usePanel } from "@/context/panel-provider";
import DevboxCreateView from "@/components/flow/node/devbox/create/view/devbox-create-view";

export function DevboxTable() {
  const { currentUser, regionUrl } = useSealosStore();
  const queryClient = useQueryClient();
  const [selectedRows, setSelectedRows] = React.useState<DevboxColumn[]>([]);
  const { openPanel } = usePanel();

  const {
    data: devboxData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    devboxListOptions(currentUser, regionUrl, transformDevboxListToTable)
  );

  const startMutation = startDevboxMutation(currentUser, regionUrl);
  const shutdownMutation = shutdownDevboxMutation(currentUser, regionUrl);
  const deleteMutation = deleteDevboxMutation(currentUser, regionUrl);

  const handleBulkAction = async (
    mutation: any,
    devboxes: DevboxColumn[],
    action: "start" | "stop" | "delete"
  ) => {
    const promises = devboxes.map((devbox) => {
      if (action === "stop") {
        return mutation.mutateAsync({
          devboxName: devbox.name,
          shutdownMode: "Stopped",
        });
      } else {
        return mutation.mutateAsync(devbox.name);
      }
    });

    try {
      await Promise.all(promises);
      toast.success(`Successfully ${action}ed ${devboxes.length} devbox(es)`);
      queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
    } catch (error: any) {
      toast.error(`Failed to ${action} devbox(es): ${error.message}`);
    }
  };

  const canStart = selectedRows.some(
    (d) => d.status.toLowerCase() === "stopped"
  );
  const canStop = selectedRows.some(
    (d) => d.status.toLowerCase() === "running"
  );
  const canDelete = selectedRows.length > 0;

  const isActionLoading =
    startMutation.isPending ||
    shutdownMutation.isPending ||
    deleteMutation.isPending;

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Devbox Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load devbox data: {error.message}
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
          <CardTitle>Devbox Resources</CardTitle>
          <div className="flex items-center gap-2">
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleBulkAction(
                      startMutation,
                      selectedRows.filter(
                        (d) => d.status.toLowerCase() === "stopped"
                      ),
                      "start"
                    )
                  }
                  disabled={!canStart || isActionLoading}
                >
                  {isActionLoading && startMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Start
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleBulkAction(
                      shutdownMutation,
                      selectedRows.filter(
                        (d) => d.status.toLowerCase() === "running"
                      ),
                      "stop"
                    )
                  }
                  disabled={!canStop || isActionLoading}
                >
                  {isActionLoading && shutdownMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Square className="mr-2 h-4 w-4" />
                  )}
                  Stop
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (
                      confirm(
                        `Are you sure you want to delete ${selectedRows.length} devbox(es)?`
                      )
                    ) {
                      handleBulkAction(deleteMutation, selectedRows, "delete");
                    }
                  }}
                  disabled={!canDelete || isActionLoading}
                >
                  {isActionLoading && deleteMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => openPanel("create-devbox", <DevboxCreateView />)}
            >
              <Plus className="h-4 w-4" />
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
            columns={devboxColumns}
            data={devboxData || []}
            onRowSelectionChange={setSelectedRows}
          />
        )}
      </CardContent>
    </Card>
  );
}
