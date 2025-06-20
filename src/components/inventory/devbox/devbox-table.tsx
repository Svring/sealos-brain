"use client";

import { useQuery } from "@tanstack/react-query";
import { useSealosStore } from "@/store/sealos-store";
import { devboxListOptions } from "@/lib/sealos/devbox/devbox-query";
import { transformDevboxListToTable } from "@/lib/sealos/devbox/devbox-transform";
import { DataTable } from "../../ui/data-table";
import { devboxColumns } from "./devbox-column";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export function DevboxTable() {
  const { currentUser, regionUrl } = useSealosStore();

  const {
    data: devboxData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    devboxListOptions(currentUser, regionUrl, transformDevboxListToTable)
  );

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
              Create Devbox
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
          <DataTable columns={devboxColumns} data={devboxData || []} />
        )}
      </CardContent>
    </Card>
  );
} 