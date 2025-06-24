import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface GraphCardProps {
  graphName: string;
  resources: {
    [resourceKind: string]: string[];
  };
  onDelete?: (graphName: string) => Promise<void>;
  isDeleting?: boolean;
}

export function GraphCard({ graphName, resources, onDelete, isDeleting }: GraphCardProps) {
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
        toast.success(`Graph "${graphName}" deleted successfully!`, { id: toastId });
      } catch (error: any) {
        console.error("Failed to delete graph:", error);
        toast.error(error?.message || `Failed to delete graph "${graphName}"`, { id: toastId });
      }
    }
  };

  return (
    <Card className="w-full cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] relative group">
      <Link href={`/graph/${encodeURIComponent(graphName)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{graphName}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {totalResources} resources
              </Badge>
              {onDelete && (
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowDeleteDialog(true);
                      }}
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Graph</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the graph "{graphName}"? This will remove the graphName annotation from all {totalResources} resources in this graph. The resources themselves will not be deleted, but they will no longer be grouped in this graph.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90"
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
            Graph containing {resourceTypes.length} resource type{resourceTypes.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {Object.entries(resources).map(([resourceKind, resourceList]) => (
              <div
                key={resourceKind}
                className="flex items-center justify-between p-2 rounded-md bg-muted/50"
              >
                <span className="font-medium capitalize">{resourceKind}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {resourceList.length}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {resourceList.join(', ')}
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
