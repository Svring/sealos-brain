import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClusterActionUIProps {
  dbName: string[];
  status:
    | "awaiting_user_confirmation"
    | "success"
    | "error"
    | "inProgress"
    | "executing"
    | "complete";
  result: any;
  onSelect?: () => void;
  onReject?: () => void;
}

export function GetClusterListActionUI({
  status,
  result,
}: ClusterActionUIProps) {
  if (status === "success" && result) {
    const dbList = result;
    if (dbList.length === 0) {
      return (
        <div className="space-y-2">
          <h2 className="font-semibold text-lg">No Database Clusters Found</h2>
          <p>There are no database clusters in your account.</p>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-lg">Your Database Clusters</h2>
        <ScrollArea className="h-48 w-full rounded-md border p-4">
          <ul className="list-disc pl-5">
            {dbList.map((db: any) => (
              <li className="mb-1" key={db.name}>
                <strong>{db.name}</strong> ({db.dbType}) - Status: {db.status}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
    );
  }
  return null;
}

export function StartClusterActionUI({
  dbName,
  status,
  result,
}: ClusterActionUIProps) {
  if (status === "success" && result) {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-green-600 text-lg">
          <CheckCircleIcon className="mr-2 inline-block h-5 w-5" />
          Database Cluster Started
        </h2>
        <p>{result}</p>
      </div>
    );
  }
  if (status === "error" && result) {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-lg text-red-600">
          <XCircleIcon className="mr-2 inline-block h-5 w-5" />
          Failed to Start Database Cluster
        </h2>
        <p>{result}</p>
      </div>
    );
  }
  return null;
}

export function PauseClusterActionUI({
  dbName,
  status,
  result,
}: ClusterActionUIProps) {
  if (status === "success" && result) {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-green-600 text-lg">
          <CheckCircleIcon className="mr-2 inline-block h-5 w-5" />
          Database Cluster Paused
        </h2>
        <p>{result}</p>
      </div>
    );
  }
  if (status === "error" && result) {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-lg text-red-600">
          <XCircleIcon className="mr-2 inline-block h-5 w-5" />
          Failed to Pause Database Cluster
        </h2>
        <p>{result}</p>
      </div>
    );
  }
  return null;
}

export function DeleteClusterActionUI({
  dbName,
  status,
  result,
  onSelect,
  onReject,
}: ClusterActionUIProps) {
  const isMultiple = dbName.length > 1;
  const title = isMultiple
    ? "Confirm Deletion of Database Clusters"
    : "Confirm Deletion of Database Cluster";
  const description = isMultiple
    ? "Are you sure you want to delete the following database clusters? This action cannot be undone."
    : `Are you sure you want to delete database cluster '${dbName[0]}'? This action cannot be undone.`;

  if (status === "awaiting_user_confirmation") {
    return (
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <ul className="list-disc pl-5">
              {dbName.map((name) => (
                <li key={name}>
                  <strong>{name}</strong>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={onReject} variant="outline">
              Cancel
            </Button>
            <Button onClick={onSelect} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  if (status === "success" && result) {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-green-600 text-lg">
          <CheckCircleIcon className="mr-2 inline-block h-5 w-5" />
          Database Cluster(s) Deleted
        </h2>
        <p>{result}</p>
      </div>
    );
  }
  if (status === "error" && result) {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-lg text-red-600">
          <XCircleIcon className="mr-2 inline-block h-5 w-5" />
          Failed to Delete Database Cluster(s)
        </h2>
        <p>{result}</p>
      </div>
    );
  }
  return null;
}

export function CreateClusterActionUI({
  dbName,
  status,
  result,
  onSelect,
  onReject,
}: ClusterActionUIProps) {
  const isMultiple = dbName.length > 1;
  const dbCount = dbName.length;
  const title = isMultiple
    ? "Confirm Creation of Database Clusters"
    : "Confirm Creation of Database Cluster";
  const description = isMultiple
    ? `Are you sure you want to create ${dbCount} database clusters with the specified types?`
    : "Are you sure you want to create a database cluster with the specified type?";

  if (status === "awaiting_user_confirmation") {
    return (
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <ul className="list-disc pl-5">
              {dbName.map((name, index) => (
                <li key={index}>
                  <strong>{name}</strong>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={onReject} variant="outline">
              Cancel
            </Button>
            <Button onClick={onSelect} variant="default">
              Create {isMultiple ? `${dbCount} Clusters` : "Cluster"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  if (status === "success" && result) {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-green-600 text-lg">
          <CheckCircleIcon className="mr-2 inline-block h-5 w-5" />
          Database Cluster(s) Created
        </h2>
        <p>{result}</p>
      </div>
    );
  }
  if (status === "error" && result) {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-lg text-red-600">
          <XCircleIcon className="mr-2 inline-block h-5 w-5" />
          Failed to Create Database Cluster(s)
        </h2>
        <p>{result}</p>
      </div>
    );
  }
  return null;
}
