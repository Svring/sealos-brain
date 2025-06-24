import { Card, CardContent } from "@/components/ui/card";
import { usePanel } from "@/context/panel-provider";
import { RESOURCES, type ResourceType } from "@/lib/sealos/k8s/k8s-utils";
import DevboxCreateView from "@/components/flow/node/devbox/create/view/devbox-create-view";
import {
  resourceIcons,
  resourceColors,
  resourceDisplayNames,
  resourceDescriptions,
} from "./constants";

export function CreateNewResourcesTab() {
  const { openPanel } = usePanel();

  return (
    <div className="grid grid-cols-1 gap-3">
      {(Object.keys(RESOURCES) as ResourceType[]).map((resourceType) => {
        const Icon = resourceIcons[resourceType];
        return (
          <Card
            key={resourceType}
            className="bg-background cursor-pointer border hover:border-primary/40 transition-shadow"
            onClick={() => {
              if (resourceType === "devbox") {
                openPanel(
                  "devbox-create",
                  <DevboxCreateView onComplete={() => {}} />
                );
              } else {
                // No-op or add logic if needed in the future
              }
            }}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${resourceColors[resourceType]} flex items-center justify-center text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-1">{resourceDisplayNames[resourceType]}</h3>
                <p className="text-xs text-muted-foreground">{resourceDescriptions[resourceType]}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 