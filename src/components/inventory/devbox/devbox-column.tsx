"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DevboxColumn } from "./devbox-table-schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play, Square, RotateCcw, Loader2 } from "lucide-react";
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
  startDevboxMutation, 
  shutdownDevboxMutation, 
  restartDevboxMutation, 
  deleteDevboxMutation 
} from "@/lib/sealos/devbox/devbox-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const devboxColumns: ColumnDef<DevboxColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="font-medium">{name}</div>;
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
          default:
            return "destructive";
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
          default:
            return "text-red-600";
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
      const devbox = row.original;
      const { currentUser, regionUrl } = useSealosStore();
      const queryClient = useQueryClient();
      
      const isRunning = devbox.status.toLowerCase() === "running";
      const isStopped = devbox.status.toLowerCase() === "stopped";

      const startMutation = startDevboxMutation(currentUser, regionUrl);
      const shutdownMutation = shutdownDevboxMutation(currentUser, regionUrl);
      const restartMutation = restartDevboxMutation(currentUser, regionUrl);
      const deleteMutation = deleteDevboxMutation(currentUser, regionUrl);

      const handleStart = async () => {
        try {
          await startMutation.mutateAsync(devbox.name);
          toast.success(`Devbox "${devbox.name}" started successfully`);
          queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
        } catch (error: any) {
          toast.error(`Failed to start devbox: ${error.message}`);
        }
      };

      const handleStop = async () => {
        try {
          await shutdownMutation.mutateAsync({
            devboxName: devbox.name,
            shutdownMode: "Stopped"
          });
          toast.success(`Devbox "${devbox.name}" stopped successfully`);
          queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
        } catch (error: any) {
          toast.error(`Failed to stop devbox: ${error.message}`);
        }
      };

      const handleRestart = async () => {
        try {
          await restartMutation.mutateAsync(devbox.name);
          toast.success(`Devbox "${devbox.name}" restarted successfully`);
          queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
        } catch (error: any) {
          toast.error(`Failed to restart devbox: ${error.message}`);
        }
      };

      const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete devbox "${devbox.name}"? This action cannot be undone.`)) {
          return;
        }
        
        try {
          await deleteMutation.mutateAsync(devbox.name);
          toast.success(`Devbox "${devbox.name}" deleted successfully`);
          queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
        } catch (error: any) {
          toast.error(`Failed to delete devbox: ${error.message}`);
        }
      };

      const isLoading = startMutation.isPending || shutdownMutation.isPending || 
                      restartMutation.isPending || deleteMutation.isPending;

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
              onClick={() => navigator.clipboard.writeText(devbox.name)}
            >
              Copy name
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isStopped && (
              <DropdownMenuItem onClick={handleStart} disabled={isLoading}>
                <Play className="mr-2 h-4 w-4" />
                Start
              </DropdownMenuItem>
            )}
            {isRunning && (
              <>
                <DropdownMenuItem onClick={handleStop} disabled={isLoading}>
                  <Square className="mr-2 h-4 w-4" />
                  Stop
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRestart} disabled={isLoading}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restart
                </DropdownMenuItem>
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
