"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";
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
import type { AiproxyColumn } from "./aiproxy-table-schema";

export const aiproxyColumns: ColumnDef<AiproxyColumn>[] = [
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
          case "inactive":
            return "secondary";
          default:
            return "destructive";
        }
      };

      const getStatusColor = (statusValue: string) => {
        switch (statusValue.toLowerCase()) {
          case "active":
            return "text-green-600";
          case "inactive":
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
    accessorKey: "token",
    header: "Token",
    cell: ({ row }) => {
      const token = row.getValue("token") as string;
      return <div className="font-mono text-sm">{token}</div>;
    },
  },
  {
    accessorKey: "count",
    header: "Requests",
    cell: ({ row }) => {
      const count = row.getValue("count") as string;
      return <div className="text-sm">{count}</div>;
    },
  },
  {
    accessorKey: "charged",
    header: "Charged",
    cell: ({ row }) => {
      const charged = row.getValue("charged") as string;
      return <div className="font-mono text-sm">{charged}</div>;
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
      const token = row.original;

      const handleCopyToken = () => {
        navigator.clipboard.writeText(token.token);
        toast.success("Token copied to clipboard");
      };

      const handleDelete = () => {
        // TODO: Implement delete mutation
        toast.success(`Token "${token.name}" deleted successfully`);
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
            <DropdownMenuItem onClick={handleCopyToken}>
              <Copy className="mr-2 h-4 w-4" />
              Copy token
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(token.name)}
            >
              Copy name
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
