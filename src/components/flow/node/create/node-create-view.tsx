import { Plus, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResources } from "@/hooks/use-resources";
import { useSealosStore } from "@/store/sealos-store";
import { CreateNewResourcesTab } from "./components/create-new-resources-tab";
import { ExistingResourcesTab } from "./components/existing-resources-tab";

interface NodeCreateViewProps {
  currentGraphName?: string;
}

export default function NodeCreateView({
  currentGraphName,
}: NodeCreateViewProps) {
  const { currentUser } = useSealosStore();
  const { allResources, isLoading } = useResources(currentUser!);

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 rounded-xl bg-background p-6">
      <div className="text-center">
        <h2 className="font-bold text-2xl">Manage Graph Nodes</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          {currentGraphName
            ? `Create new resources or add existing ones to "${currentGraphName}"`
            : "Create new resources or add existing ones to your graph"}
        </p>
      </div>
      <Tabs className="w-full" defaultValue="create">
        <TabsList className="mb-2 grid w-full grid-cols-2">
          <TabsTrigger className="flex items-center gap-2" value="create">
            <Plus className="h-4 w-4" /> Create New
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="existing">
            <Search className="h-4 w-4" /> Add Existing
          </TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <CreateNewResourcesTab />
        </TabsContent>
        <TabsContent value="existing">
          <ExistingResourcesTab
            allResources={allResources}
            currentGraphName={currentGraphName}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
      <div className="border-t pt-4 text-center">
        <p className="text-muted-foreground text-xs">
          {currentGraphName
            ? `Resources will be added to "${currentGraphName}" • Resources already in graphs cannot be moved`
            : "Resources with graph annotations are already part of a graph"}
        </p>
      </div>
    </div>
  );
}
