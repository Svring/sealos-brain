import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
import { useSealosStore } from "@/store/sealos-store";
import { useAddResourceToGraphMutation } from "@/lib/graph/graph-mutation";
import { useResources, type ExistingResource } from "@/hooks/use-resources";
import { CreateNewResourcesTab } from "./components/create-new-resources-tab";
import { ExistingResourcesTab } from "./components/existing-resources-tab";

interface NodeCreateViewProps {
  onCreateNode: (nodeType: string) => void;
  currentGraphName?: string;
}

export default function NodeCreateView({
  onCreateNode,
  currentGraphName,
}: NodeCreateViewProps) {
  const { currentUser } = useSealosStore();

  // Use the resources hook
  const { allResources, isLoading, refetchAll } = useResources(currentUser);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Manage Graph Nodes
        </h2>
        <p className="text-muted-foreground mt-2">
          {currentGraphName
            ? `Create new resources or add existing ones to "${currentGraphName}"`
            : "Create new resources or add existing ones to your graph"}
        </p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New
          </TabsTrigger>
          <TabsTrigger value="existing" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Add Existing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <CreateNewResourcesTab onCreateNode={onCreateNode} />
        </TabsContent>

        <TabsContent value="existing" className="space-y-4">
          <ExistingResourcesTab
            allResources={allResources}
            isLoading={isLoading}
            currentGraphName={currentGraphName}
            onRefetch={refetchAll}
          />
        </TabsContent>
      </Tabs>

      <div className="text-center pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          {currentGraphName
            ? `Resources will be added to "${currentGraphName}" • Resources already in graphs cannot be moved`
            : "Resources with graph annotations are already part of a graph"}
        </p>
      </div>
    </div>
  );
}
