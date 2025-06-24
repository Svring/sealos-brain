import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type ExistingResource } from "@/hooks/use-resources";
import { useAddResourceToGraphMutation } from "@/lib/graph/graph-mutation";
import { useSealosStore } from "@/store/sealos-store";
import { resourceIcons, resourceDisplayNames } from "./constants";

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
  const hasGraphAnnotation = Boolean(resource.annotations?.graphName);
  const canQuickAdd = currentGraphName && !hasGraphAnnotation;

  const handleAddToGraph = async () => {
    if (!currentGraphName || !currentUser) return;
    try {
      await addResourceToGraphMutation.mutateAsync({
        currentUser,
        resourceType: resource.type,
        resourceName: resource.name,
        graphName: currentGraphName,
      });
      if (onRefetch) onRefetch();
    } catch {}
  };

  return (
    <Card className="bg-background border p-0">
      <CardContent className="flex items-center justify-between px-4 py-2 min-h-12">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center justify-center w-8 h-8 rounded bg-muted">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </span>
          <span className="truncate font-medium text-sm">{resource.name}</span>
        </div>
        <Button
          size="sm"
          className="ml-4"
          onClick={e => {
            e.stopPropagation();
            handleAddToGraph();
          }}
          disabled={!canQuickAdd || addResourceToGraphMutation.isPending}
        >
          {hasGraphAnnotation
            ? "Already in Graph"
            : addResourceToGraphMutation.isPending
            ? "Adding..."
            : `Add to Graph`}
        </Button>
      </CardContent>
    </Card>
  );
}
