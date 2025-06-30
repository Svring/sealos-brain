import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GraphCardProps {
  graphName: string;
  resources: {
    [resourceKind: string]: string[];
  };
  onDeleteGraph?: (graphName: string) => Promise<void>;
  onDeleteAllResources?: (graphName: string) => Promise<void>;
  isDeletingGraph?: boolean;
  isDeletingAllResources?: boolean;
}

export function GraphCard({
  graphName,
  resources,
  onDeleteGraph,
  onDeleteAllResources,
  isDeletingGraph,
  isDeletingAllResources,
}: GraphCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const totalResources = Object.values(resources).reduce(
    (acc, resourceList) => acc + resourceList.length,
    0
  );

  const isDeleting = isDeletingGraph || isDeletingAllResources;

  const handleDeleteGraph = async () => {
    if (onDeleteGraph) {
      const toastId = `delete-graph-${graphName}`;
      try {
        toast.loading(`Deleting graph "${graphName}"...`, { id: toastId });
        await onDeleteGraph(graphName);
        setShowDeleteDialog(false);
        toast.success(`Graph "${graphName}" deleted successfully!`, {
          id: toastId,
        });
      } catch (error: unknown) {
        toast.error(
          error instanceof Error
            ? error.message
            : `Failed to delete graph "${graphName}"`,
          {
            id: toastId,
          }
        );
      }
    }
  };

  const handleDeleteAllResources = async () => {
    if (onDeleteAllResources) {
      const toastId = `delete-all-resources-${graphName}`;
      try {
        toast.loading(`Deleting all resources in graph "${graphName}"...`, {
          id: toastId,
        });
        await onDeleteAllResources(graphName);
        setShowDeleteDialog(false);
        toast.success(
          `All resources in graph "${graphName}" deleted successfully!`,
          {
            id: toastId,
          }
        );
      } catch (error: unknown) {
        toast.error(
          error instanceof Error
            ? error.message
            : `Failed to delete resources in graph "${graphName}"`,
          {
            id: toastId,
          }
        );
      }
    }
  };

  return (
    <Card className="group relative w-full max-w-sm overflow-hidden transition-all hover:shadow-lg">
      {(onDeleteGraph || onDeleteAllResources) && (
        <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
          <AlertDialogTrigger asChild>
            <Button
              className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 transition-opacity group-hover:opacity-100"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              size="sm"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Graph</AlertDialogTitle>
              <AlertDialogDescription>
                Choose how you want to delete the graph "{graphName}" with{" "}
                {totalResources} resource{totalResources === 1 ? "" : "s"}:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3 py-4">
              {onDeleteGraph && (
                <Button
                  className="w-full justify-start text-left"
                  disabled={isDeleting}
                  onClick={handleDeleteGraph}
                  variant="outline"
                >
                  <div>
                    <div className="font-medium">Delete Graph Only</div>
                    <div className="text-muted-foreground text-sm">
                      Remove graph grouping but keep all resources
                    </div>
                  </div>
                </Button>
              )}
              {onDeleteAllResources && (
                <Button
                  className="w-full justify-start bg-destructive text-left text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                  onClick={handleDeleteAllResources}
                  variant="destructive"
                >
                  <div>
                    <div className="font-medium">Delete All Resources</div>
                    <div className="text-sm opacity-90">
                      Permanently delete all {totalResources} resource
                      {totalResources === 1 ? "" : "s"} in this graph
                    </div>
                  </div>
                </Button>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <Link
        className="flex h-full flex-col"
        href={`/graph/${encodeURIComponent(graphName)}`}
      >
        <CardHeader>
          <CardTitle className="text-xl tracking-tight">{graphName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {Object.entries(resources).map(([resourceKind, resourceList]) => (
              <div
                className="flex items-center justify-between text-xs"
                key={resourceKind}
              >
                <span className="font-medium text-muted-foreground capitalize">
                  {resourceKind}
                </span>
                <Badge className="font-mono text-xs" variant="secondary">
                  {resourceList.length}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
