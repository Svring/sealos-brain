"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ObjectstorageColumn } from "./objectstorage-table-schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Settings, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const objectstorageColumns: ColumnDef<ObjectstorageColumn>[] = [
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
          case "ready":
            return "default";
          case "pending":
            return "outline";
          default:
            return "destructive";
        }
      };

      const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
          case "ready":
            return "text-green-600";
          case "pending":
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
    accessorKey: "type",
    header: "Policy",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      
      const getPolicyColor = (policy: string) => {
        switch (policy.toLowerCase()) {
          case "publicreadwrite":
            return "text-orange-600";
          case "publicread":
            return "text-blue-600";
          case "private":
            return "text-gray-600";
          default:
            return "text-gray-600";
        }
      };

      const formatPolicy = (policy: string) => {
        switch (policy.toLowerCase()) {
          case "publicreadwrite":
            return "Public Read/Write";
          case "publicread":
            return "Public Read";
          case "private":
            return "Private";
          default:
            return policy;
        }
      };

      return (
        <div className={`text-sm font-medium ${getPolicyColor(type)}`}>
          {formatPolicy(type)}
        </div>
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
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const bucket = row.original;

      const handleConfigure = () => {
        // TODO: Implement bucket configuration
        toast.success(`Configuring bucket "${bucket.name}"`);
      };

      const handleDelete = () => {
        if (confirm(`Are you sure you want to delete bucket "${bucket.name}"?`)) {
          // TODO: Implement delete mutation
          toast.success(`Bucket "${bucket.name}" deleted successfully`);
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
              onClick={() => navigator.clipboard.writeText(bucket.name)}
            >
              Copy name
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleConfigure}>
              <Settings className="mr-2 h-4 w-4" />
              Configure
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