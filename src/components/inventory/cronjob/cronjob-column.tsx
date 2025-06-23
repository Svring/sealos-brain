"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CronjobColumn } from "./cronjob-table-schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play, Pause, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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

      const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
          case "active":
            return "default";
          case "suspended":
            return "secondary";
          default:
            return "destructive";
        }
      };

      const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
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
          variant={getStatusVariant(status)}
          className={getStatusColor(status)}
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
      return <div className="text-sm text-muted-foreground">{createdAt}</div>;
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
        if (confirm(`Are you sure you want to delete cronjob "${cronjob.name}"?`)) {
          // TODO: Implement delete mutation
          toast.success(`CronJob "${cronjob.name}" deleted successfully`);
        }
      };

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
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 