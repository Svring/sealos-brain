"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AppLaunchpadColumn } from "./applaunchpad-table-schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play, Square, RotateCcw, Rocket, ExternalLink, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSealosStore } from "@/store/sealos-store";
import { 
  startAppMutation, 
  restartAppMutation, 
  pauseAppMutation, 
  delAppMutation 
} from "@/lib/sealos/applaunchpad/applaunchpad-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const appLaunchpadColumns: ColumnDef<AppLaunchpadColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-muted-foreground" />
          <div className="font-medium">{name}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      
      const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
          case "running":
            return "default";
          case "stopped":
            return "secondary";
          case "creating":
            return "outline";
          case "failed":
            return "destructive";
          default:
            return "secondary";
        }
      };

      const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
          case "running":
            return "text-green-600";
          case "stopped":
            return "text-gray-600";
          case "creating":
            return "text-blue-600";
          case "failed":
            return "text-red-600";
          default:
            return "text-gray-600";
        }
      };

      return (
        <Badge
          variant={getStatusVariant(status)}
          className={getStatusColor(status)}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "replicas",
    header: "Replicas",
    cell: ({ row }) => {
      const replicas = row.getValue("replicas") as string;
      return <div className="font-mono text-sm">{replicas}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      return <div className="text-sm text-muted-foreground">{createdAt}</div>;
    },
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) => {
      const cost = row.getValue("cost") as string;
      return <div className="font-mono text-sm">{cost}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const app = row.original;
      const { currentUser, regionUrl } = useSealosStore();
      const queryClient = useQueryClient();
      
      const isRunning = app.status.toLowerCase() === "running";
      const isStopped = app.status.toLowerCase() === "stopped";
      const isCreating = app.status.toLowerCase() === "creating";

      const startMutation = startAppMutation(currentUser, regionUrl);
      const restartMutation = restartAppMutation(currentUser, regionUrl);
      const pauseMutation = pauseAppMutation(currentUser, regionUrl);
      const deleteMutation = delAppMutation(currentUser, regionUrl);

      const handleStart = async () => {
        try {
          await startMutation.mutateAsync(app.name);
          toast.success(`Application "${app.name}" started successfully`);
          queryClient.invalidateQueries({ queryKey: ["applaunchpad", "list"] });
        } catch (error: any) {
          toast.error(`Failed to start application: ${error.message}`);
        }
      };

      const handlePause = async () => {
        try {
          await pauseMutation.mutateAsync(app.name);
          toast.success(`Application "${app.name}" paused successfully`);
          queryClient.invalidateQueries({ queryKey: ["applaunchpad", "list"] });
        } catch (error: any) {
          toast.error(`Failed to pause application: ${error.message}`);
        }
      };

      const handleRestart = async () => {
        try {
          await restartMutation.mutateAsync(app.name);
          toast.success(`Application "${app.name}" restarted successfully`);
          queryClient.invalidateQueries({ queryKey: ["applaunchpad", "list"] });
        } catch (error: any) {
          toast.error(`Failed to restart application: ${error.message}`);
        }
      };

      const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete application "${app.name}"? This action cannot be undone.`)) {
          return;
        }
        
        try {
          await deleteMutation.mutateAsync(app.name);
          toast.success(`Application "${app.name}" deleted successfully`);
          queryClient.invalidateQueries({ queryKey: ["applaunchpad", "list"] });
        } catch (error: any) {
          toast.error(`Failed to delete application: ${error.message}`);
        }
      };

      const isLoading = startMutation.isPending || restartMutation.isPending || 
                      pauseMutation.isPending || deleteMutation.isPending;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
              <span className="sr-only">Open menu</span>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(app.name)}
            >
              Copy name
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isRunning && (
              <DropdownMenuItem disabled>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open App
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {isStopped && (
              <DropdownMenuItem onClick={handleStart} disabled={isLoading}>
                <Play className="mr-2 h-4 w-4" />
                Start
              </DropdownMenuItem>
            )}
            {isRunning && (
              <>
                <DropdownMenuItem onClick={handlePause} disabled={isLoading}>
                  <Square className="mr-2 h-4 w-4" />
                  Pause
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRestart} disabled={isLoading}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restart
                </DropdownMenuItem>
              </>
            )}
            {!isCreating && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>View Logs</DropdownMenuItem>
                <DropdownMenuItem disabled>View Metrics</DropdownMenuItem>
                <DropdownMenuItem disabled>Edit Configuration</DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDelete} 
              disabled={isLoading}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
