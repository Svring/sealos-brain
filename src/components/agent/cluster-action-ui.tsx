import { useState } from "react";
import { Button } from "../ui/button";

interface DatabaseCluster {
  id?: string;
  name?: string;
  dbType?: string;
  status?: {
    label?: string;
    value?: string;
    color?: string;
    backgroundColor?: string;
    dotColor?: string;
  };
  createTime?: string;
  cpu?: number;
  memory?: number;
  totalCpu?: number;
  totalMemory?: number;
  storage?: number;
  totalStorage?: number;
  replicas?: number;
  conditions?: Array<{
    lastTransitionTime?: string;
    message?: string;
    observedGeneration?: number;
    reason?: string;
    status?: string;
    type?: string;
  }>;
  isDiskSpaceOverflow?: boolean;
  labels?: Record<string, string>;
  source?: {
    hasSource?: boolean;
    sourceName?: string;
    sourceType?: string;
  };
}

function getStatusBadgeStyle(status?: DatabaseCluster["status"]) {
  if (status?.backgroundColor && status?.color) {
    return {
      backgroundColor: status.backgroundColor,
      color: status.color,
    };
  }

  // Fallback based on status value
  const statusValue = status?.value || status?.label || "Unknown";
  if (statusValue === "Running") {
    return { backgroundColor: "#EDFBF3", color: "#039855" };
  }
  if (statusValue === "Stopped" || statusValue === "Paused") {
    return { backgroundColor: "#F2F1FB", color: "#8172D8" };
  }
  return { backgroundColor: "#FEF3C7", color: "#D97706" };
}

function renderDatabaseList(dbList: DatabaseCluster[]) {
  return (
    <div className="space-y-2">
      {dbList.map((db) => {
        const statusStyle = getStatusBadgeStyle(db.status);
        const statusLabel = db.status?.label || db.status?.value || "Unknown";

        return (
          <div
            className="rounded-lg border border-gray-200 bg-background p-4 shadow-sm"
            key={db.id || db.name}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground text-lg">
                    {db.name || "Unknown"}
                  </h3>
                  <span
                    className="inline-flex items-center rounded-full px-2 py-1 font-medium text-xs"
                    style={statusStyle}
                  >
                    {statusLabel}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-foreground">Type:</span>
                    <span className="ml-1 font-mono text-foreground">
                      {db.dbType || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground">Resources:</span>
                    <span className="ml-1 text-foreground">
                      {db.cpu ? `${db.cpu}m CPU` : "Unknown CPU"},{" "}
                      {db.memory ? `${db.memory}Mi` : "Unknown Memory"}
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground">Storage:</span>
                    <span className="ml-1 text-foreground">
                      {db.storage ? `${db.storage}Gi` : "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground">Replicas:</span>
                    <span className="ml-1 text-foreground">
                      {db.replicas || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground">Created:</span>
                    <span className="ml-1 text-foreground">
                      {db.createTime || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground">Disk Overflow:</span>
                    <span className="ml-1 text-foreground">
                      {db.isDiskSpaceOverflow ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function renderLoadingState(title: string, description: string) {
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-blue-600 text-lg">{title}</h2>
      <p className="text-foreground">{description}</p>
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-blue-600 border-b-2" />
        <span className="text-foreground text-sm">Please wait...</span>
      </div>
    </div>
  );
}

function renderCompleteClusterList(dbList: DatabaseCluster[]) {
  if (dbList.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-background p-4 text-center">
        <p className="text-foreground">No database clusters found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-foreground text-sm">
        Found {dbList.length} database cluster{dbList.length === 1 ? "" : "s"}
      </p>
      {renderDatabaseList(dbList)}
    </div>
  );
}

export function GetClusterListActionUI({
  status,
  result,
}: {
  status: "inProgress" | "executing" | "complete";
  result: unknown;
}) {
  if (status === "complete" && result) {
    try {
      const dbList = Array.isArray(result) ? (result as DatabaseCluster[]) : [];

      return (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground text-lg">
            Database Clusters
          </h2>
          {renderCompleteClusterList(dbList)}
        </div>
      );
    } catch {
      // Fallback to raw JSON if parsing fails
      return (
        <div className="space-y-2">
          <h2 className="font-semibold text-foreground text-lg">
            Database Clusters (Raw Data)
          </h2>
          <div className="max-h-96 overflow-auto rounded border bg-background p-3">
            <pre className="text-foreground text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      );
    }
  }

  if (status === "executing" || status === "inProgress") {
    return renderLoadingState(
      "Getting Database Clusters...",
      "Retrieving all database clusters"
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-foreground text-lg">
        Get Database Clusters Action
      </h2>
      <p className="text-foreground">
        Status: <strong>{status}</strong>
      </p>
    </div>
  );
}

function renderClusterActionProgress(
  isMultiple: boolean,
  actionName: string,
  progressName: string,
  color: string,
  dbList: string[],
  dbName: string | string[]
) {
  const dbCount = dbList.length;

  return (
    <div className="space-y-2">
      <h2 className={`font-semibold text-lg text-${color}-600`}>
        {isMultiple
          ? `${progressName} Database Clusters...`
          : `${progressName} Database Cluster...`}
      </h2>
      {isMultiple ? (
        <div>
          <p>
            {actionName} {dbCount} database clusters:
          </p>
          <ul className="mt-2 space-y-1">
            {dbList.map((name) => (
              <li className="flex items-center text-sm" key={name}>
                <span className={`mr-2 h-2 w-2 rounded-full bg-${color}-500`} />
                <strong>{name}</strong>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>
          {actionName} database cluster '<strong>{dbName}</strong>'
        </p>
      )}
      <div className="flex items-center gap-2">
        <div
          className={`h-4 w-4 animate-spin rounded-full border-${color}-600 border-b-2`}
        />
        <span className="text-gray-600 text-sm">Please wait...</span>
      </div>
    </div>
  );
}

export function StartClusterActionUI({
  dbName,
  status,
  result,
}: {
  dbName: string | string[];
  status: "inProgress" | "executing" | "complete";
  result: unknown;
}) {
  const isMultiple = Array.isArray(dbName);
  const dbList = Array.isArray(dbName) ? dbName : [dbName];

  if (status === "complete" && result) {
    return <div className="space-y-2">{result as string}</div>;
  }

  if (status === "executing" || status === "inProgress") {
    return renderClusterActionProgress(
      isMultiple,
      "Starting",
      "Starting",
      "green",
      dbList,
      dbName
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg">Start Database Cluster Action</h2>
      <p>
        Database Name{isMultiple ? "s" : ""}:{" "}
        <strong>{Array.isArray(dbName) ? dbName.join(", ") : dbName}</strong>
      </p>
      <p>
        Status: <strong>{status}</strong>
      </p>
    </div>
  );
}

export function PauseClusterActionUI({
  dbName,
  status,
  result,
}: {
  dbName: string | string[];
  status: "inProgress" | "executing" | "complete";
  result: unknown;
}) {
  const isMultiple = Array.isArray(dbName);
  const dbList = Array.isArray(dbName) ? dbName : [dbName];

  if (status === "complete" && result) {
    return <div className="space-y-2">{result as string}</div>;
  }

  if (status === "executing" || status === "inProgress") {
    return renderClusterActionProgress(
      isMultiple,
      "Pausing",
      "Pausing",
      "orange",
      dbList,
      dbName
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg">Pause Database Cluster Action</h2>
      <p>
        Database Name{isMultiple ? "s" : ""}:{" "}
        <strong>{Array.isArray(dbName) ? dbName.join(", ") : dbName}</strong>
      </p>
      <p>
        Status: <strong>{status}</strong>
      </p>
    </div>
  );
}

function DeleteClusterConfirmation({
  isMultiple,
  dbCount,
  dbList,
  dbName,
  handleApprove,
  handleReject,
}: {
  isMultiple: boolean;
  dbCount: number;
  dbList: string[];
  dbName: string | string[];
  handleApprove: () => void;
  handleReject: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg text-red-600">
        {isMultiple
          ? "Multiple Database Clusters Deletion Confirmation"
          : "Database Cluster Deletion Confirmation"}
      </h2>
      <div className="rounded-lg border border-red-200 bg-background p-4">
        {isMultiple ? (
          <div>
            <p className="text-red-800">
              <strong>Warning:</strong> Are you sure you want to delete{" "}
              <strong>{dbCount} database clusters</strong>?
            </p>
            <ul className="mt-2 space-y-1">
              {dbList.map((name) => (
                <li className="flex items-center" key={name}>
                  <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                  <strong>{name}</strong>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-red-800">
            <strong>Warning:</strong> Are you sure you want to delete database
            cluster '<strong>{dbName}</strong>'?
          </p>
        )}
        <p className="mt-2 text-red-600 text-sm">
          This action cannot be undone and will permanently remove all data
          associated with{" "}
          {isMultiple ? "these database clusters" : "this database cluster"}.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleApprove} variant="destructive">
          {isMultiple ? `Delete ${dbCount} Clusters` : "Delete Cluster"}
        </Button>
        <Button onClick={handleReject} variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  );
}

function DeleteClusterProgress({
  isMultiple,
  dbList,
  dbName,
}: {
  isMultiple: boolean;
  dbList: string[];
  dbName: string | string[];
}) {
  return renderClusterActionProgress(
    isMultiple,
    "Deleting",
    "Deleting",
    "red",
    dbList,
    dbName
  );
}

function handleDeleteClusterComplete(
  status: string,
  result: unknown,
  isMultiple: boolean,
  dbName: string | string[]
) {
  if (status === "complete" && result) {
    return <div className="space-y-2">{result as string}</div>;
  }

  if (status === "complete" && !result) {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-lg text-red-600">Deletion Failed</h2>
        <p>
          {isMultiple
            ? "Failed to delete database clusters"
            : `Failed to delete database cluster '${dbName}'`}
        </p>
      </div>
    );
  }

  return null;
}

export function DeleteClusterActionUI({
  dbName,
  onSelect,
  onReject,
  status,
  result,
}: {
  dbName: string | string[];
  onSelect: () => void;
  onReject: () => void;
  status: "complete" | "executing" | "inProgress";
  result: unknown;
}) {
  const [userChoice, setUserChoice] = useState<"approved" | "rejected" | null>(
    null
  );

  const handleApprove = () => {
    setUserChoice("approved");
    onSelect();
  };

  const handleReject = () => {
    setUserChoice("rejected");
    onReject();
  };

  const isMultiple = Array.isArray(dbName);
  const dbList = Array.isArray(dbName) ? dbName : [dbName];
  const dbCount = dbList.length;

  // Initial state - asking for confirmation
  if (userChoice === null) {
    return (
      <DeleteClusterConfirmation
        dbCount={dbCount}
        dbList={dbList}
        dbName={dbName}
        handleApprove={handleApprove}
        handleReject={handleReject}
        isMultiple={isMultiple}
      />
    );
  }

  // User rejected the action
  if (userChoice === "rejected") {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-green-600 text-lg">
          Deletion Cancelled
        </h2>
        <p>
          {isMultiple
            ? `Deletion of ${dbCount} database clusters was cancelled. All clusters remain intact.`
            : `Database cluster '${dbName}' deletion was cancelled. The cluster remains intact.`}
        </p>
      </div>
    );
  }

  // User approved - show status based on execution state
  if (userChoice === "approved") {
    // Action is in progress
    if (status === "executing" || status === "inProgress") {
      return (
        <DeleteClusterProgress
          dbList={dbList}
          dbName={dbName}
          isMultiple={isMultiple}
        />
      );
    }

    // Handle completion states
    const completeResult = handleDeleteClusterComplete(
      status,
      result,
      isMultiple,
      dbName
    );
    if (completeResult) {
      return completeResult;
    }
  }

  // Fallback for unknown state
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg">
        Database Cluster Deletion Action
      </h2>
      <p>
        Database Name{isMultiple ? "s" : ""}:{" "}
        <strong>{Array.isArray(dbName) ? dbName.join(", ") : dbName}</strong>
      </p>
      <p>
        Status: <strong>{status}</strong>
      </p>
      <p>
        User Choice: <strong>{userChoice || "pending"}</strong>
      </p>
    </div>
  );
}

function CreateClusterConfirmation({
  isMultiple,
  typeCount,
  typeList,
  dbType,
  handleApprove,
  handleReject,
}: {
  isMultiple: boolean;
  typeCount: number;
  typeList: string[];
  dbType: string | string[];
  handleApprove: () => void;
  handleReject: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">
        {isMultiple
          ? "Multiple Database Clusters Creation Confirmation"
          : "Database Cluster Creation Confirmation"}
      </h2>
      {isMultiple ? (
        <div>
          <p>
            Do you want to create <strong>{typeCount} database clusters</strong>{" "}
            with the following types?
          </p>
          <ul className="mt-2 space-y-1">
            {typeList.map((type) => (
              <li className="flex items-center" key={type}>
                <span className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                <strong>{type}</strong>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>
          Do you want to create a database cluster of type '
          <strong>{dbType}</strong>'?
        </p>
      )}
      <div className="flex gap-2">
        <Button onClick={handleApprove} variant="default">
          {isMultiple ? `Create ${typeCount} Clusters` : "Approve"}
        </Button>
        <Button onClick={handleReject} variant="outline">
          {isMultiple ? "Cancel" : "Reject"}
        </Button>
      </div>
    </div>
  );
}

function CreateClusterProgress({
  isMultiple,
  typeList,
  dbType,
}: {
  isMultiple: boolean;
  typeList: string[];
  dbType: string | string[];
}) {
  return renderClusterActionProgress(
    isMultiple,
    "Creating",
    "Creating",
    "blue",
    typeList,
    dbType
  );
}

function handleCreateClusterComplete(
  status: string,
  result: unknown,
  isMultiple: boolean,
  dbType: string | string[]
) {
  if (status === "complete" && result) {
    return <div className="space-y-2">{result as string}</div>;
  }

  if (status === "complete" && !result) {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-lg text-red-600">Creation Failed</h2>
        <p>
          {isMultiple
            ? "Failed to create database clusters"
            : `Failed to create database cluster of type '${dbType}'`}
        </p>
      </div>
    );
  }

  return null;
}

export function CreateClusterActionUI({
  dbType,
  onSelect,
  onReject,
  status,
  result,
}: {
  dbType: string | string[];
  onSelect: () => void;
  onReject: () => void;
  status: "complete" | "executing" | "inProgress";
  result: unknown;
}) {
  const [userChoice, setUserChoice] = useState<"approved" | "rejected" | null>(
    null
  );

  const handleApprove = () => {
    setUserChoice("approved");
    onSelect();
  };

  const handleReject = () => {
    setUserChoice("rejected");
    onReject();
  };

  const isMultiple = Array.isArray(dbType);
  const typeList = Array.isArray(dbType) ? dbType : [dbType];
  const typeCount = typeList.length;

  // Initial state - asking for confirmation
  if (userChoice === null) {
    return (
      <CreateClusterConfirmation
        dbType={dbType}
        handleApprove={handleApprove}
        handleReject={handleReject}
        isMultiple={isMultiple}
        typeCount={typeCount}
        typeList={typeList}
      />
    );
  }

  // User rejected the action
  if (userChoice === "rejected") {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-lg text-red-600">Action Rejected</h2>
        <p>
          {isMultiple
            ? `Creation of ${typeCount} database clusters was cancelled.`
            : `Database cluster creation of type '${dbType}' was cancelled.`}
        </p>
      </div>
    );
  }

  // User approved - show status based on execution state
  if (userChoice === "approved") {
    // Action is in progress
    if (status === "executing" || status === "inProgress") {
      return (
        <CreateClusterProgress
          dbType={dbType}
          isMultiple={isMultiple}
          typeList={typeList}
        />
      );
    }

    // Handle completion states
    const completeResult = handleCreateClusterComplete(
      status,
      result,
      isMultiple,
      dbType
    );
    if (completeResult) {
      return completeResult;
    }
  }

  // Fallback for unknown state
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg">Database Cluster Action</h2>
      <p>
        Type{isMultiple ? "s" : ""}:{" "}
        <strong>{Array.isArray(dbType) ? dbType.join(", ") : dbType}</strong>
      </p>
      <p>
        Status: <strong>{status}</strong>
      </p>
      <p>
        User Choice: <strong>{userChoice || "pending"}</strong>
      </p>
    </div>
  );
}
