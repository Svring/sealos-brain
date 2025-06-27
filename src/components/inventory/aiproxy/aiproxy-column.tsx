"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AiproxyColumn } from "./aiproxy-table-schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Copy, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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

      const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
          case "active":
            return "default";
          case "inactive":
            return "secondary";
          default:
            return "destructive";
        }
      };

      const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
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
          variant={getStatusVariant(status)}
          className={getStatusColor(status)}
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
      return <div className="text-sm text-muted-foreground">{createdAt}</div>;
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
            <Button variant="ghost" className="h-8 w-8 p-0">
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
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
