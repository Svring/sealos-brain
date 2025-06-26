"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ObjectStorageColumn } from "./objectstorage-table-schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export const objectstorageColumns: ColumnDef<ObjectStorageColumn>[] = [
    {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
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
]; 