import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type ExistingResource } from "@/hooks/use-resources";
import { useAddResourceToGraphMutation } from "@/lib/graph/graph-mutation";
import { useSealosStore } from "@/store/sealos-store";
import {
  resourceIcons,
  resourceColors,
  resourceDisplayNames,
} from "./constants";

interface ResourceCardProps {
  resource: ExistingResource;
  currentGraphName?: string;
  onRefetch?: () => void;
}

export function ResourceCard({
  resource,
  currentGraphName,
  onRefetch,
}: ResourceCardProps) {
  const { currentUser } = useSealosStore();
  const addResourceToGraphMutation = useAddResourceToGraphMutation();
  
  const Icon = resourceIcons[resource.type];
  const hasGraphAnnotation = resource.annotations?.graphName;
  const canQuickAdd = currentGraphName && !hasGraphAnnotation;

  const handleAddToGraph = async () => {
    if (!currentGraphName || !currentUser) {
      console.error("Missing currentGraphName or currentUser", {
        currentGraphName,
        currentUser: !!currentUser,
        resource: resource.name,
        resourceType: resource.type
      });
      return;
    }

    console.log("Adding resource to graph", {
      resourceName: resource.name,
      resourceType: resource.type,
      graphName: currentGraphName,
      currentAnnotations: resource.annotations
    });

    try {
      const result = await addResourceToGraphMutation.mutateAsync({
        currentUser,
        resourceType: resource.type,
        resourceName: resource.name,
        graphName: currentGraphName,
      });

      console.log("Successfully added resource to graph", {
        resourceName: resource.name,
        graphName: currentGraphName,
        result
      });

      // Trigger refetch if callback provided
      if (onRefetch) {
        onRefetch();
      }
    } catch (error) {
      console.error("Failed to add resource to graph", {
        resourceName: resource.name,
        graphName: currentGraphName,
        error
      });
    }
  };

  return (
    <Card
      className={`transition-all hover:shadow-md ${
        hasGraphAnnotation
          ? "border-green-200 bg-green-50/50"
          : "border-2 hover:border-primary/50"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-lg ${resourceColors[resource.type]} flex items-center justify-center text-white`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{resource.name}</h4>
              <Badge variant="secondary" className="text-xs">
                {resourceDisplayNames[resource.type]}
              </Badge>
              {hasGraphAnnotation && (
                <Badge variant="default" className="text-xs bg-green-500">
                  In Graph: {resource.annotations?.graphName}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Status: {resource.status}
            </p>
            <div className="flex gap-2">
              {canQuickAdd && (
                <Button
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToGraph();
                  }}
                  disabled={addResourceToGraphMutation.isPending}
                >
                  {addResourceToGraphMutation.isPending
                    ? "Adding..."
                    : `Add to ${currentGraphName || "Graph"}`}
                </Button>
              )}
              {!canQuickAdd && hasGraphAnnotation && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 px-3 text-xs"
                  disabled={true}
                >
                  Already in Graph
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
