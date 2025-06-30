import { Store } from "lucide-react";
import DatabaseCreateView from "@/components/flow/node/dbprovider/create/database-create-view";
import DevboxCreateView from "@/components/flow/node/devbox/create/view/devbox-create-view";
import { Card, CardContent } from "@/components/ui/card";
import { usePanel } from "@/context/panel-provider";
import { RESOURCES, type ResourceType } from "@/lib/sealos/k8s/k8s-constant";
import {
  resourceColors,
  resourceDescriptions,
  resourceDisplayNames,
  resourceIcons,
} from "./constants";

export function CreateNewResourcesTab() {
  const { openPanel } = usePanel();

  // Build the list of resource types, inserting 'appstore' after 'cluster'
  const resourceTypes = Object.keys(RESOURCES) as ResourceType[];
  const unifiedList: (ResourceType | "appstore")[] = [];
  for (const type of resourceTypes) {
    unifiedList.push(type);
    if (type === "cluster") {
      unifiedList.push("appstore");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {unifiedList.map((item) => {
        if (item === "appstore") {
          return (
            <Card
              className="cursor-pointer border bg-background transition-shadow hover:border-primary/40"
              key="appstore"
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-violet-500 text-white">
                  <Store className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-base">Browse Apps</h3>
                  <p className="text-muted-foreground text-xs">
                    Discover and deploy pre-built applications
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        }
        // Normal resource card
        const resourceType = item as ResourceType;
        const Icon = resourceIcons[resourceType];
        return (
          <Card
            className="cursor-pointer border bg-background transition-shadow hover:border-primary/40"
            key={resourceType}
            onClick={() => {
              if (resourceType === "devbox") {
                openPanel("devbox-create", <DevboxCreateView />);
              } else if (resourceType === "cluster") {
                openPanel("database-create", <DatabaseCreateView />);
              } else {
                // No-op or add logic if needed in the future
              }
            }}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={`h-12 w-12 rounded-lg ${resourceColors[resourceType]} flex items-center justify-center text-white`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-base">
                  {resourceDisplayNames[resourceType]}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {resourceDescriptions[resourceType]}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
