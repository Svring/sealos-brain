"use client";

import { useQuery } from "@tanstack/react-query";
import { useSealosStore } from "@/store/sealos-store";
import { appLaunchpadListOptions } from "@/lib/applaunchpad/applaunchpad-query";
import { transformAppLaunchpadListToTable } from "@/lib/applaunchpad/applaunchpad-transform";
import { DataTable } from "@/components/ui/data-table";
import { appLaunchpadColumns } from "./applaunchpad-column";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Rocket } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export function AppLaunchpadTable() {
  const { currentUser, regionUrl } = useSealosStore();

  const {
    data: appLaunchpadData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    appLaunchpadListOptions(currentUser, regionUrl, transformAppLaunchpadListToTable)
  );

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Launchpad Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load application data: {error.message}
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
            <Rocket className="h-5 w-5" />
            Launchpad Applications
          </CardTitle>
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
              Deploy App
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
          <DataTable columns={appLaunchpadColumns} data={appLaunchpadData || []} />
        )}
      </CardContent>
    </Card>
  );
}
