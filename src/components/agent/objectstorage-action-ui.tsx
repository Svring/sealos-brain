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

interface ObjectStorageActionUIProps {
  bucketName: string[];
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

export function GetObjectStorageListActionUI({
  status,
  result,
}: ObjectStorageActionUIProps) {
  if (status === "success" && result) {
    const bucketList = result;
    if (bucketList.length === 0) {
      return (
        <div className="space-y-2">
          <h2 className="font-semibold text-lg">
            No Object Storage Buckets Found
          </h2>
          <p>There are no object storage buckets in your account.</p>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-lg">Your Object Storage Buckets</h2>
        <ScrollArea className="h-48 w-full rounded-md border p-4">
          <ul className="list-disc pl-5">
            {bucketList.map((bucket: any) => (
              <li className="mb-1" key={bucket.name}>
                <strong>{bucket.name}</strong> - Status: {bucket.status}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
    );
  }
  return null;
}

export function CreateObjectStorageActionUI({
  bucketName,
  status,
  result,
  onSelect,
  onReject,
}: ObjectStorageActionUIProps) {
  const isMultiple = bucketName.length > 1;
  const bucketCount = bucketName.length;
  const title = isMultiple
    ? "Confirm Creation of Object Storage Buckets"
    : "Confirm Creation of Object Storage Bucket";
  const description = isMultiple
    ? `Are you sure you want to create ${bucketCount} object storage buckets? Bucket names will be auto-generated.`
    : "Are you sure you want to create an object storage bucket? The bucket name will be auto-generated.";

  if (status === "awaiting_user_confirmation") {
    return (
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {isMultiple && (
            <div className="space-y-2">
              <p>
                Number of buckets to create: <strong>{bucketCount}</strong>
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={onReject} variant="outline">
              Cancel
            </Button>
            <Button onClick={onSelect} variant="default">
              Create {isMultiple ? `${bucketCount} Buckets` : "Bucket"}
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
          Object Storage Bucket(s) Created
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
          Failed to Create Object Storage Bucket(s)
        </h2>
        <p>{result}</p>
      </div>
    );
  }
  return null;
}

export function DeleteObjectStorageActionUI({
  bucketName,
  status,
  result,
  onSelect,
  onReject,
}: ObjectStorageActionUIProps) {
  const isMultiple = bucketName.length > 1;
  const title = isMultiple
    ? "Confirm Deletion of Object Storage Buckets"
    : "Confirm Deletion of Object Storage Bucket";
  const description = isMultiple
    ? "Are you sure you want to delete the following object storage buckets? This action cannot be undone."
    : `Are you sure you want to delete object storage bucket '${bucketName[0]}'? This action cannot be undone.`;

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
              {bucketName.map((name) => (
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
          Object Storage Bucket(s) Deleted
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
          Failed to Delete Object Storage Bucket(s)
        </h2>
        <p>{result}</p>
      </div>
    );
  }
  return null;
}
