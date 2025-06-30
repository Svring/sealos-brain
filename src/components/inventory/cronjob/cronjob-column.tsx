"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pause, Play, Trash2 } from "lucide-react";
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
import type { CronjobColumn } from "./cronjob-table-schema";

export const cronjobColumns: ColumnDef<CronjobColumn>[] = [
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

      const getStatusVariant = (statusValue: string) => {
        switch (statusValue.toLowerCase()) {
          case "active":
            return "default";
          case "suspended":
            return "secondary";
          default:
            return "destructive";
        }
      };

      const getStatusColor = (statusValue: string) => {
        switch (statusValue.toLowerCase()) {
          case "active":
            return "text-green-600";
          case "suspended":
            return "text-gray-600";
          default:
            return "text-red-600";
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
    accessorKey: "schedule",
    header: "Schedule",
    cell: ({ row }) => {
      const schedule = row.getValue("schedule") as string;
      return <div className="font-mono text-sm">{schedule}</div>;
    },
  },
  {
    accessorKey: "nextRun",
    header: "Next Run",
    cell: ({ row }) => {
      const nextRun = row.getValue("nextRun") as string;
      return <div className="text-sm">{nextRun}</div>;
    },
  },
  {
    accessorKey: "lastRun",
    header: "Last Run",
    cell: ({ row }) => {
      const lastRun = row.getValue("lastRun") as string;
      return <div className="text-sm">{lastRun}</div>;
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
      const cronjob = row.original;
      const isActive = cronjob.status.toLowerCase() === "active";

      const handleToggle = () => {
        const action = isActive ? "suspend" : "resume";
        // TODO: Implement suspend/resume mutation
        toast.success(`CronJob "${cronjob.name}" ${action}d successfully`);
      };

      const handleDelete = () => {
        // TODO: Implement delete mutation
        toast.success(`CronJob "${cronjob.name}" deleted successfully`);
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0" variant="ghost">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(cronjob.name)}
            >
              Copy name
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleToggle}>
              {isActive ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Suspend
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
