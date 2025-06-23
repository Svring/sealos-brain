"use client";

import { useQuery } from "@tanstack/react-query";
import { useSealosStore } from "@/store/sealos-store";
import { cronJobListOptions } from "@/lib/sealos/cronjob/cronjob-query";
import { transformCronJobsToTable } from "@/lib/sealos/cronjob/cronjob-transform";
import { DataTable } from "../../ui/data-table";
import { cronjobColumns } from "./cronjob-column";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export function CronJobTable() {
  const { currentUser, regionUrl } = useSealosStore();

  const {
    data: cronjobData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    cronJobListOptions(currentUser, regionUrl, transformCronJobsToTable)
  );

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CronJob Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load cronjob data: {error.message}
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
          <CardTitle>CronJob Resources</CardTitle>
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
              Create CronJob
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
          <DataTable columns={cronjobColumns} data={cronjobData || []} />
        )}
      </CardContent>
    </Card>
  );
} 