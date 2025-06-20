"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DatabaseColumn } from "./database-table-schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play, Square, RotateCcw, Database } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      const isRunning = database.status.toLowerCase() === "running";
      const isStopped = database.status.toLowerCase() === "stopped" || database.status.toLowerCase() === "paused";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
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
              <DropdownMenuItem>
                <Play className="mr-2 h-4 w-4" />
                Start
              </DropdownMenuItem>
            )}
            {isRunning && (
              <>
                <DropdownMenuItem>
                  <Square className="mr-2 h-4 w-4" />
                  Stop
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restart
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>Connection Info</DropdownMenuItem>
            <DropdownMenuItem>Backup</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 