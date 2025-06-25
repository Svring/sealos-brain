import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAddResourceToGraphMutation } from "@/lib/graph/graph-mutation";
import {
  GRAPH_ANNOTATION_KEY,
  type ResourceType,
} from "@/lib/sealos/k8s/k8s-utils";
import { useSealosStore } from "@/store/sealos-store";
import { resourceIcons } from "./constants";

// Types
export interface ExistingResource {
  type: ResourceType;
  name: string;
  annotations?: Record<string, string>;
}

interface ResourceCardProps {
  resource: ExistingResource;
  currentGraphName?: string;
  onRefetch?: () => void;
}

// Component
export function ResourceCard({
  resource,
  currentGraphName,
  onRefetch,
}: ResourceCardProps) {
  // Hooks
  const { currentUser } = useSealosStore();
  const addResourceToGraphMutation = useAddResourceToGraphMutation();

  // Constants
  const Icon = resourceIcons[resource.type];
  const hasGraphAnnotation = Boolean(
    resource.annotations?.[GRAPH_ANNOTATION_KEY]
  );
  const canQuickAdd = Boolean(currentGraphName && !hasGraphAnnotation);

  // Handlers
  const handleAddToGraph = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!(currentGraphName && currentUser)) {
      return;
    }

    try {
      await addResourceToGraphMutation.mutateAsync({
        currentUser,
        resourceType: resource.type,
        resourceName: resource.name,
        graphName: currentGraphName,
      });
      onRefetch?.();
    } catch {
      // Error handling could be expanded here
      // console.error("Failed to add resource to graph:", error);
    }
  };

  let buttonLabel = "Add to Graph";
  if (hasGraphAnnotation) {
    buttonLabel = "Already in Graph";
  } else if (addResourceToGraphMutation.isPending) {
    buttonLabel = "Adding...";
  }

  // Render
  return (
    <Card className="border bg-background p-0">
      <CardContent className="flex min-h-12 items-center justify-between px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </span>
          <span className="truncate font-medium text-sm">{resource.name}</span>
        </div>
        <Button
          className="ml-4"
          disabled={!canQuickAdd || addResourceToGraphMutation.isPending}
          onClick={handleAddToGraph}
          size="sm"
        >
          {buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
