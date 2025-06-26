"use client";

import { useSealosStore } from "@/store/sealos-store";
import { createDBMutation } from "@/lib/sealos/dbprovider/dbprovider-mutation";
import { usePanel } from "@/context/panel-provider";
import { toast } from "sonner";
import { DB_TYPE_LIST } from "@/lib/sealos/dbprovider/schema/dbprovider-schema";
import { generateDBFormFromType } from "@/lib/sealos/dbprovider/dbprovider-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DatabaseCreateView() {
  const { currentUser, regionUrl } = useSealosStore();
  const { closePanel } = usePanel();
  const { mutate: createDatabase, isPending } = createDBMutation(
    currentUser,
    regionUrl
  );

  const handleCreate = (dbType: string) => {
    const toastId = `create-db-${dbType}`;
    toast.loading(`Creating ${dbType} database...`, { id: toastId });

    const dbFormData = generateDBFormFromType(dbType);

    createDatabase(dbFormData, {
      onSuccess: () => {
        toast.success(`${dbType} database created successfully!`, {
          id: toastId,
        });
        closePanel();
      },
      onError: (error: any) => {
        toast.error(
          error?.message || `Failed to create ${dbType} database`,
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
        </p>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {DB_TYPE_LIST.map((db) => (
              <Button
                key={db.id}
                variant="outline"
                className="h-20 text-base"
                disabled={isPending}
                onClick={() => handleCreate(db.id)}
              >
                {isPending ? (
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
