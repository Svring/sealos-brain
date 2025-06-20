"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DatabaseColumn } from "./database-table-schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play, Square, RotateCcw, Database, Loader2 } from "lucide-react";
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
  startDBByNameMutation, 
  pauseDBByNameMutation, 
  delDBByNameMutation 
} from "@/lib/dbprovider/dbprovider-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const databaseColumns: ColumnDef<DatabaseColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <div className="font-medium">{name}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return <div className="font-medium">{type}</div>;
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
          case "paused":
            return "secondary";
          case "creating":
          case "starting":
            return "outline";
          case "failed":
          case "error":
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
          case "paused":
            return "text-gray-600";
          case "creating":
          case "starting":
            return "text-blue-600";
          case "failed":
          case "error":
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
      const database = row.original;
      const { currentUser, regionUrl } = useSealosStore();
      const queryClient = useQueryClient();
      
      const isRunning = database.status.toLowerCase() === "running";
      const isStopped = database.status.toLowerCase() === "stopped" || database.status.toLowerCase() === "paused";

      const startMutation = startDBByNameMutation(currentUser, regionUrl);
      const pauseMutation = pauseDBByNameMutation(currentUser, regionUrl);
      const deleteMutation = delDBByNameMutation(currentUser, regionUrl);

      const handleStart = async () => {
        try {
          await startMutation.mutateAsync(database.name);
          toast.success(`Database "${database.name}" started successfully`);
          queryClient.invalidateQueries({ queryKey: ["dbprovider", "list"] });
        } catch (error: any) {
          toast.error(`Failed to start database: ${error.message}`);
        }
      };

      const handlePause = async () => {
        try {
          await pauseMutation.mutateAsync(database.name);
          toast.success(`Database "${database.name}" paused successfully`);
          queryClient.invalidateQueries({ queryKey: ["dbprovider", "list"] });
        } catch (error: any) {
          toast.error(`Failed to pause database: ${error.message}`);
        }
      };

      const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete database "${database.name}"? This action cannot be undone.`)) {
          return;
        }
        
        try {
          await deleteMutation.mutateAsync(database.name);
          toast.success(`Database "${database.name}" deleted successfully`);
          queryClient.invalidateQueries({ queryKey: ["dbprovider", "list"] });
        } catch (error: any) {
          toast.error(`Failed to delete database: ${error.message}`);
        }
      };

      const isLoading = startMutation.isPending || pauseMutation.isPending || deleteMutation.isPending;

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
              onClick={() => navigator.clipboard.writeText(database.name)}
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
                <DropdownMenuItem onClick={handlePause} disabled={isLoading}>
                  <Square className="mr-2 h-4 w-4" />
                  Pause
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restart
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Connection Info</DropdownMenuItem>
            <DropdownMenuItem disabled>Backup</DropdownMenuItem>
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