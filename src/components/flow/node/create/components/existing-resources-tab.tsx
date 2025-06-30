import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import type { ExistingResource } from "@/hooks/use-resources";
import {
  resourceDisplayNames,
  resourceIcons,
  type UIResourceType,
} from "./constants";
import { ResourceCard } from "./resource-card";

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
  // Only allow devbox, cluster, and objectstoragebucket
  const allowedTypes: UIResourceType[] = [
    "devbox",
    "cluster",
    "objectstoragebucket",
  ];
  const filteredAllResources = allResources.filter((r) =>
    allowedTypes.includes(r.type as UIResourceType)
  );
  const resourceTypes = Array.from(
    new Set(filteredAllResources.map((r) => r.type as UIResourceType))
  );
  const tabs = [
    {
      title: "All",
      icon: resourceIcons[resourceTypes[0] || "devbox"] as LucideIcon,
    },
    ...resourceTypes.map((type) => ({
      title: resourceDisplayNames[type],
      icon: resourceIcons[type] as LucideIcon,
    })),
  ];
  const filteredResources =
    selectedTab === 0 || selectedTab === null
      ? filteredAllResources
      : filteredAllResources.filter(
          (r) => r.type === resourceTypes[selectedTab - 1]
        );

  if (isLoading) {
    return (
      <div className="rounded-xl bg-background py-8 text-center">
        <div className="text-muted-foreground">
          Loading existing resources...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-background p-2">
      <ExpandableTabs
        activeColor="text-primary"
        className="mb-2"
        onChange={setSelectedTab}
        tabs={tabs}
      />
      {filteredResources.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No resources found
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredResources.map((resource) => (
            <ResourceCard
              currentGraphName={currentGraphName}
              key={`${resource.type}-${resource.name}`}
              onRefetch={onRefetch}
              resource={resource}
            />
          ))}
        </div>
      )}
    </div>
  );
}
