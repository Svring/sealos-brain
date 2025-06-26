"use client";

import { useQuery } from "@tanstack/react-query";
import { useSealosStore } from "@/store/sealos-store";
import { aiProxyTokenListOptions } from "@/lib/sealos/aiproxy/aiproxy-query";
import { transformAIProxyTokensToTable } from "@/lib/sealos/aiproxy/aiproxy-transform";
import { DataTable } from "../../ui/data-table";
import { aiproxyColumns } from "./aiproxy-column";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export function AIProxyTable() {
  const { currentUser, regionUrl } = useSealosStore();

  const {
    data: aiproxyData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    aiProxyTokenListOptions(currentUser, regionUrl, 1, 10, transformAIProxyTokensToTable)
  );

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Proxy Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load AI proxy data: {error.message}
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
          <CardTitle>AI Proxy Tokens</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
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
          <DataTable columns={aiproxyColumns} data={aiproxyData || []} />
        )}
      </CardContent>
    </Card>
  );
} 