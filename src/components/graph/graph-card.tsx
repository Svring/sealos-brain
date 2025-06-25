import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GraphCardProps {
  graphName: string;
  resources: {
    [resourceKind: string]: string[];
  };
  onDelete?: (graphName: string) => Promise<void>;
  isDeleting?: boolean;
}

export function GraphCard({
  graphName,
  resources,
  onDelete,
  isDeleting,
}: GraphCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const totalResources = Object.values(resources).reduce(
    (acc, resourceList) => acc + resourceList.length,
    0
  );

  const resourceTypes = Object.keys(resources);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling

    if (onDelete) {
      const toastId = `delete-graph-${graphName}`;
      try {
        toast.loading(`Deleting graph "${graphName}"...`, { id: toastId });
        await onDelete(graphName);
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

  return (
    <Card className="group relative w-full cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
      <Link href={`/graph/${encodeURIComponent(graphName)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-semibold text-lg">{graphName}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{totalResources} resources</Badge>
              {onDelete && (
                <AlertDialog
                  onOpenChange={setShowDeleteDialog}
                  open={showDeleteDialog}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      className="h-8 w-8 p-0 opacity-0 transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
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
                        Are you sure you want to delete the graph "{graphName}"?
                        This will remove the graphName annotation from all{" "}
                        {totalResources} resources in this graph. The resources
                        themselves will not be deleted, but they will no longer
                        be grouped in this graph.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={isDeleting}
                        onClick={handleDelete}
                      >
                        {isDeleting ? "Deleting..." : "Delete Graph"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          <CardDescription>
            Graph containing {resourceTypes.length} resource type
            {resourceTypes.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {Object.entries(resources).map(([resourceKind, resourceList]) => (
              <div
                className="flex items-center justify-between rounded-md bg-muted/50 p-2"
                key={resourceKind}
              >
                <span className="font-medium capitalize">{resourceKind}</span>
                <div className="flex items-center gap-2">
                  <Badge className="text-xs" variant="outline">
                    {resourceList.length}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {resourceList.join(", ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
