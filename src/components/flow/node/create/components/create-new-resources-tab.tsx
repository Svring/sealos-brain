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

  return (
    <div className="grid grid-cols-1 gap-3">
      {(Object.keys(RESOURCES) as ResourceType[]).map((resourceType) => {
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
