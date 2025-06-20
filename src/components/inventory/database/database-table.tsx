"use client";

import { useQuery } from "@tanstack/react-query";
import { useSealosStore } from "@/store/sealos-store";
import { dbProviderListOptions } from "@/lib/dbprovider/dbprovider-query";
import { transformDatabaseListToTable } from "@/lib/dbprovider/dbprovider-transform";
import { DataTable } from "@/components/ui/data-table";
import { databaseColumns } from "./database-column";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export function DatabaseTable() {
  const { currentUser, regionUrl } = useSealosStore();

  const {
    data: databaseData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    dbProviderListOptions(currentUser, regionUrl, transformDatabaseListToTable)
  );

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
              Create Database
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
          <DataTable columns={databaseColumns} data={databaseData || []} />
        )}
      </CardContent>
    </Card>
  );
} 