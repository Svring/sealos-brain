"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Play,
  Rocket,
  RotateCcw,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  delAppMutation,
  pauseAppMutation,
  restartAppMutation,
  startAppMutation,
} from "@/lib/sealos/applaunchpad/applaunchpad-mutation";
import { useSealosStore } from "@/store/sealos-store";
import type { AppLaunchpadColumn } from "./applaunchpad-table-schema";

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

      const getStatusVariant = (statusValue: string) => {
        switch (statusValue.toLowerCase()) {
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

      const getStatusColor = (statusValue: string) => {
        switch (statusValue.toLowerCase()) {
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
          className={getStatusColor(status)}
          variant={getStatusVariant(status)}
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
      return <div className="text-muted-foreground text-sm">{createdAt}</div>;
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
    accessorKey: "graph",
    header: "Graph",
    cell: ({ row }) => {
      const graph = row.getValue("graph") as string;
      return (
        <Badge variant={graph === "none" ? "secondary" : "outline"}>
          {graph}
        </Badge>
      );
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
        try {
          await deleteMutation.mutateAsync(app.name);
          toast.success(`Application "${app.name}" deleted successfully`);
          queryClient.invalidateQueries({ queryKey: ["applaunchpad", "list"] });
        } catch (error: any) {
          toast.error(`Failed to delete application: ${error.message}`);
        }
      };

      const isLoading =
        startMutation.isPending ||
        restartMutation.isPending ||
        pauseMutation.isPending ||
        deleteMutation.isPending;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="h-8 w-8 p-0"
              disabled={isLoading}
              variant="ghost"
            >
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
              <DropdownMenuItem disabled={isLoading} onClick={handleStart}>
                <Play className="mr-2 h-4 w-4" />
                Start
              </DropdownMenuItem>
            )}
            {isRunning && (
              <>
                <DropdownMenuItem disabled={isLoading} onClick={handlePause}>
                  <Square className="mr-2 h-4 w-4" />
                  Pause
                </DropdownMenuItem>
                <DropdownMenuItem disabled={isLoading} onClick={handleRestart}>
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
              className="text-red-600"
              disabled={isLoading}
              onClick={handleDelete}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
