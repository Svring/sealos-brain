"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Play, Plus, Square, Trash2 } from "lucide-react";
import React from "react";
import DevboxCreateView from "@/components/flow/node/devbox/create/view/devbox-create-view";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePanel } from "@/context/panel-provider";
import {
  deleteDevboxMutation,
  shutdownDevboxMutation,
  startDevboxMutation,
} from "@/lib/sealos/devbox/devbox-mutation";
import { devboxListOptions } from "@/lib/sealos/devbox/devbox-query";
import { transformDevboxListToTable } from "@/lib/sealos/devbox/devbox-transform";
import { useSealosStore } from "@/store/sealos-store";
import { DataTable } from "../../ui/data-table";
import { devboxColumns } from "./devbox-column";
import type { DevboxColumn } from "./devbox-table-schema";

export function DevboxTable() {
  const { currentUser, regionUrl } = useSealosStore();
  const [selectedRows, setSelectedRows] = React.useState<DevboxColumn[]>([]);
  const { openPanel } = usePanel();

  const {
    data: devboxData,
    isLoading,
    error,
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
      }
      return mutation.mutateAsync(devbox.name);
    });

    try {
      await Promise.all(promises);
    } catch (error: any) {
      console.error(`Failed to ${action} devbox(es):`, error);
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
                  disabled={!canStart || isActionLoading}
                  onClick={() =>
                    handleBulkAction(
                      startMutation,
                      selectedRows.filter(
                        (d) => d.status.toLowerCase() === "stopped"
                      ),
                      "start"
                    )
                  }
                  size="sm"
                  variant="outline"
                >
                  {isActionLoading && startMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Start
                </Button>
                <Button
                  disabled={!canStop || isActionLoading}
                  onClick={() =>
                    handleBulkAction(
                      shutdownMutation,
                      selectedRows.filter(
                        (d) => d.status.toLowerCase() === "running"
                      ),
                      "stop"
                    )
                  }
                  size="sm"
                  variant="outline"
                >
                  {isActionLoading && shutdownMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Square className="mr-2 h-4 w-4" />
                  )}
                  Stop
                </Button>
                <Button
                  disabled={!canDelete || isActionLoading}
                  onClick={() =>
                    handleBulkAction(deleteMutation, selectedRows, "delete")
                  }
                  size="sm"
                  variant="destructive"
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
              onClick={() => openPanel("create-devbox", <DevboxCreateView />)}
              size="icon"
              variant="outline"
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
