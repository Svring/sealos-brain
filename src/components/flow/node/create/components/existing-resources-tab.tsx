import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { type ExistingResource } from "@/hooks/use-resources";
import { type ResourceType } from "@/lib/sealos/k8s/k8s-utils";
import { ResourceCard } from "./resource-card";
import { resourceDisplayNames } from "./constants";

interface ExistingResourcesTabProps {
  allResources: ExistingResource[];
  isLoading: boolean;
  currentGraphName?: string;
  onRefetch?: () => void;
}

export function ExistingResourcesTab({
  allResources,
  isLoading,
  currentGraphName,
  onRefetch,
}: ExistingResourcesTabProps) {
  const [selectedTab, setSelectedTab] = React.useState("all");

  // Filter resources based on selected tab
  const filteredResources = React.useMemo(() => {
    if (selectedTab === "all") {
      return allResources;
    }
    return allResources.filter((resource) => resource.type === selectedTab);
  }, [allResources, selectedTab]);

  // Get unique resource types from existing resources
  const existingResourceTypes = React.useMemo(() => {
    const types = new Set(allResources.map((resource) => resource.type));
    return Array.from(types);
  }, [allResources]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          Loading existing resources...
        </div>
      </div>
    );
  }

  return (
    <>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-full grid-cols-1 h-auto flex-wrap gap-1">
          <TabsTrigger value="all" className="flex-shrink-0 text-xs">
            All ({allResources.length})
          </TabsTrigger>
          {existingResourceTypes.map((type) => {
            const count = allResources.filter((r) => r.type === type).length;
            return (
              <TabsTrigger
                key={type}
                value={type}
                className="flex-shrink-0 text-xs"
              >
                {resourceDisplayNames[type]} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedTab} className="mt-4">
          {filteredResources.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                No{" "}
                {selectedTab === "all"
                  ? ""
                  : resourceDisplayNames[selectedTab as ResourceType]}{" "}
                resources found
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={`${resource.type}-${resource.name}`}
                  resource={resource}
                  currentGraphName={currentGraphName}
                  onRefetch={onRefetch}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
} 