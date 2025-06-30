"use client";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePanel } from "@/context/panel-provider";
import { useAddResourceToGraphMutation } from "@/lib/graph/graph-mutation";
import { createDBMutation } from "@/lib/sealos/dbprovider/dbprovider-mutation";
import { generateDBFormFromType } from "@/lib/sealos/dbprovider/dbprovider-utils";
import { DB_TYPE_LIST } from "@/lib/sealos/dbprovider/schema/dbprovider-schema";
import { useSealosStore } from "@/store/sealos-store";

export default function DatabaseCreateView() {
  const { currentUser, regionUrl, currentGraphName } = useSealosStore();
  const { closePanel } = usePanel();
  const { mutate: createDatabase, isPending } = createDBMutation(
    currentUser,
    regionUrl
  );
  const addToGraphMutation = useAddResourceToGraphMutation();

  const handleCreate = (dbType: string) => {
    const toastId = `create-db-${dbType}`;
    toast.loading(`Creating ${dbType} database...`, { id: toastId });

    const dbFormData = generateDBFormFromType(dbType);

    createDatabase(dbFormData, {
      onSuccess: async (data: unknown) => {
        // First show success for database creation
        toast.success(`${data.dbType} database created successfully!`, {
          id: toastId,
        });

        // If there's a current graph, add the database to it
        if (
          currentGraphName &&
          currentUser &&
          data &&
          typeof data === "object" &&
          "dbName" in data
        ) {
          try {
            await addToGraphMutation.mutateAsync({
              currentUser,
              resourceType: "cluster",
              resourceName: (data as { dbName: string }).dbName,
              graphName: currentGraphName,
            });
            toast.success(`Database added to graph "${currentGraphName}"!`);
          } catch (error) {
            toast.error(
              `Failed to add database to graph: ${error instanceof Error ? error.message : "Unknown error"}`
            );
          }
        }

        closePanel();
      },
      onError: (error: unknown) => {
        toast.error(
          (error instanceof Error ? error.message : undefined) ||
            `Failed to create ${dbType} database`,
          {
            id: toastId,
          }
        );
      },
    });
  };

  return (
    <div className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Create a New Database</CardTitle>
        <p className="text-muted-foreground">
          Select a database type to get started.
          {currentGraphName && (
            <span className="mt-1 block text-blue-600 text-sm">
              Will be added to graph: "{currentGraphName}"
            </span>
          )}
        </p>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {DB_TYPE_LIST.map((db) => (
              <Button
                className="h-20 text-base"
                disabled={isPending || addToGraphMutation.isPending}
                key={db.id}
                onClick={() => handleCreate(db.id)}
                variant="outline"
              >
                {isPending || addToGraphMutation.isPending ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  db.label
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </ScrollArea>
    </div>
  );
}
