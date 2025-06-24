import React, { useState } from "react";
import { type ExistingResource } from "@/hooks/use-resources";
import { type ResourceType } from "@/lib/sealos/k8s/k8s-utils";
import { ResourceCard } from "./resource-card";
import { resourceDisplayNames, resourceIcons } from "./constants";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { LucideIcon } from "lucide-react";

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
  const [selectedTab, setSelectedTab] = useState<number | null>(0);
  const resourceTypes = Array.from(new Set(allResources.map(r => r.type)));
  const tabs = [
    {
      title: "All",
      icon: (resourceIcons[resourceTypes[0] || "devbox"] as LucideIcon),
    },
    ...resourceTypes.map(type => ({
      title: resourceDisplayNames[type],
      icon: resourceIcons[type] as LucideIcon,
    })),
  ];
  const filteredResources =
    selectedTab === 0 || selectedTab === null
      ? allResources
      : allResources.filter(r => r.type === resourceTypes[selectedTab - 1]);

  if (isLoading) {
    return (
      <div className="text-center py-8 bg-background rounded-xl">
        <div className="text-muted-foreground">Loading existing resources...</div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-xl p-2">
      <ExpandableTabs
        tabs={tabs}
        className="mb-2"
        onChange={setSelectedTab}
        activeColor="text-primary"
      />
      {filteredResources.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No resources found</div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredResources.map(resource => (
            <ResourceCard
              key={`${resource.type}-${resource.name}`}
              resource={resource}
              currentGraphName={currentGraphName}
              onRefetch={onRefetch}
            />
          ))}
        </div>
      )}
    </div>
  );
} 