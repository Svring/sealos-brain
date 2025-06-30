import { Database, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  isDeletingGraph = false,
  isDeletingAllResources = false,
}: GraphCardProps) {
  const [showDeleteGraphDialog, setShowDeleteGraphDialog] = useState(false);
  const [showDeleteResourcesDialog, setShowDeleteResourcesDialog] =
    useState(false);

  const totalResources = Object.values(resources).reduce(
    (acc, resourceList) => acc + resourceList.length,
    0
  );

  const handleDeleteGraph = async () => {
    if (onDeleteGraph) {
      await onDeleteGraph(graphName);
    }
    setShowDeleteGraphDialog(false);
  };

  const handleDeleteAllResources = async () => {
    if (onDeleteAllResources) {
      await onDeleteAllResources(graphName);
    }
    setShowDeleteResourcesDialog(false);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleShowDeleteGraph = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteGraphDialog(true);
  };

  const handleShowDeleteResources = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteResourcesDialog(true);
  };

  return (
    <>
      <Card className="group hover:-translate-y-1 relative w-full max-w-sm border-0 bg-card shadow-sm transition-all duration-200 hover:shadow-lg">
        {/* Delete Dropdown Button */}
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={handleDropdownClick}
                size="sm"
                variant="ghost"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="text-orange-600 focus:text-orange-600"
                disabled={isDeletingGraph || isDeletingAllResources}
                onClick={handleShowDeleteGraph}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeletingGraph ? "Deleting..." : "Delete Graph Only"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                disabled={isDeletingGraph || isDeletingAllResources}
                onClick={handleShowDeleteResources}
              >
                <Database className="mr-2 h-4 w-4" />
                {isDeletingAllResources
                  ? "Deleting..."
                  : "Delete All Resources"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Card Content */}
        <Link
          className="flex h-32 flex-col justify-between px-6"
          href={`/graph/${encodeURIComponent(graphName)}`}
        >
          <CardHeader className="p-0">
            <CardTitle className="truncate pr-8 font-semibold text-foreground text-lg tracking-tight transition-colors duration-200">
              {graphName}
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-auto p-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground text-sm">
                {totalResources}{" "}
                {totalResources === 1 ? "resource" : "resources"}
              </span>
            </div>
          </CardContent>
        </Link>
      </Card>

      {/* Delete Graph Only Confirmation Dialog */}
      <AlertDialog
        onOpenChange={setShowDeleteGraphDialog}
        open={showDeleteGraphDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Graph Only?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the graph structure but keep all {totalResources}{" "}
              resources intact. The resources will no longer be grouped under "
              {graphName}" but will remain running in your cluster.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-orange-600 hover:bg-orange-700"
              disabled={isDeletingGraph}
              onClick={handleDeleteGraph}
            >
              {isDeletingGraph ? "Deleting..." : "Delete Graph Only"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Resources Confirmation Dialog */}
      <AlertDialog
        onOpenChange={setShowDeleteResourcesDialog}
        open={showDeleteResourcesDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Resources?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {totalResources} resources in "
              {graphName}" from your cluster. This action cannot be undone and
              will destroy all data and applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeletingAllResources}
              onClick={handleDeleteAllResources}
            >
              {isDeletingAllResources ? "Deleting..." : "Delete All Resources"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
