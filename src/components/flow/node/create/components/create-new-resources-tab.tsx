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

interface CreateNewResourcesTabProps {
  onCreateNode: (nodeType: string) => void;
}

export function CreateNewResourcesTab({ onCreateNode }: CreateNewResourcesTabProps) {
  const { openPanel } = usePanel();

  return (
    <div className="grid grid-cols-1 gap-4">
      {(Object.keys(RESOURCES) as ResourceType[]).map((resourceType) => {
        const Icon = resourceIcons[resourceType];
        return (
          <Card
            key={resourceType}
            className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-2 hover:border-primary/50"
            onClick={() => {
              if (resourceType === "devbox") {
                openPanel(
                  "devbox-create",
                  <DevboxCreateView onComplete={() => {}} />
                );
              } else {
                onCreateNode(resourceType);
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-lg ${resourceColors[resourceType]} flex items-center justify-center text-white`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {resourceDisplayNames[resourceType]}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {resourceDescriptions[resourceType]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 