"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Database,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Square,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { usePanel } from "@/context/panel-provider";
import {
  delDBByNameMutation,
  pauseDBByNameMutation,
  startDBByNameMutation,
} from "@/lib/sealos/dbprovider/dbprovider-mutation";
import { dbProviderListOptions } from "@/lib/sealos/dbprovider/dbprovider-query";
import { transformDatabaseListToTable } from "@/lib/sealos/dbprovider/dbprovider-transform";
import { useSealosStore } from "@/store/sealos-store";
import DatabaseCreateView from "../../flow/node/dbprovider/create/database-create-view";
import { databaseColumns } from "./database-column";
import type { DatabaseColumn } from "./database-table-schema";

export function DatabaseTable() {
  const { currentUser, regionUrl } = useSealosStore();
  const queryClient = useQueryClient();
  const [selectedRows, setSelectedRows] = React.useState<DatabaseColumn[]>([]);
  const { openPanel } = usePanel();

  const {
    data: databaseData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    dbProviderListOptions(currentUser, regionUrl, transformDatabaseListToTable)
  );

  const startMutation = startDBByNameMutation(currentUser, regionUrl);
  const pauseMutation = pauseDBByNameMutation(currentUser, regionUrl);
  const deleteMutation = delDBByNameMutation(currentUser, regionUrl);

  const handleBulkAction = async (
    mutation: any,
    databases: DatabaseColumn[],
    action: "start" | "pause" | "delete"
  ) => {
    const promises = databases.map((db) => mutation.mutateAsync(db.name));

    try {
      await Promise.all(promises);
    } catch (error: any) {
      console.error(`Failed to ${action} database(s):`, error);
    }
  };

  const canStart = selectedRows.some(
    (d) => d.status.toLowerCase() === "paused"
  );
  const canPause = selectedRows.some(
    (d) => d.status.toLowerCase() === "running"
  );
  const canDelete = selectedRows.length > 0;

  const isActionLoading =
    startMutation.isPending ||
    pauseMutation.isPending ||
    deleteMutation.isPending;

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load database data: {error.message}
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
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Resources
          </CardTitle>
          <div className="flex items-center gap-2">
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  disabled={!canStart || isActionLoading}
                  onClick={() =>
                    handleBulkAction(
                      startMutation,
                      selectedRows.filter(
                        (d) => d.status.toLowerCase() === "paused"
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
                  disabled={!canPause || isActionLoading}
                  onClick={() =>
                    handleBulkAction(
                      pauseMutation,
                      selectedRows.filter(
                        (d) => d.status.toLowerCase() === "running"
                      ),
                      "pause"
                    )
                  }
                  size="sm"
                  variant="outline"
                >
                  {isActionLoading && pauseMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Square className="mr-2 h-4 w-4" />
                  )}
                  Pause
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
              onClick={() =>
                openPanel("create-database", <DatabaseCreateView />)
              }
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
            columns={databaseColumns}
            data={databaseData || []}
            onRowSelectionChange={setSelectedRows}
          />
        )}
      </CardContent>
    </Card>
  );
}
