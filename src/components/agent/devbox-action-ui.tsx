import { useState } from "react";
import {
  type DevboxList,
  extractDevboxListSummaries,
} from "@/lib/sealos/devbox/schemas/devbox-list-schema";
import { Button } from "../ui/button";

export function CreateDevboxActionUI({
  template,
  onSelect,
  onReject,
  status,
  result,
}: {
  template: string | string[];
  onSelect: () => void;
  onReject: () => void;
  status: "complete" | "executing" | "inProgress";
  result: any;
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

  const isMultiple = Array.isArray(template);
  const templateList = Array.isArray(template) ? template : [template];
  const templateCount = templateList.length;

  // Initial state - asking for confirmation
  if (userChoice === null) {
    return (
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">
          {isMultiple
            ? "Multiple Devboxes Creation Confirmation"
            : "Devbox Creation Confirmation"}
        </h2>
        {isMultiple ? (
          <div>
            <p>
              Do you want to create <strong>{templateCount} devboxes</strong>{" "}
              from the following templates?
            </p>
            <ul className="mt-2 space-y-1">
              {templateList.map((t, index) => (
                <li className="flex items-center" key={index}>
                  <span className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                  <strong>{t}</strong>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>
            Do you want to create a devbox from template '
            <strong>{template}</strong>'?
          </p>
        )}
        <div className="flex gap-2">
          <Button onClick={handleApprove} variant="default">
            {isMultiple ? `Create ${templateCount} Devboxes` : "Approve"}
          </Button>
          <Button onClick={handleReject} variant="outline">
            {isMultiple ? "Cancel" : "Reject"}
          </Button>
        </div>
      </div>
    );
  }

  // User rejected the action
  if (userChoice === "rejected") {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-lg text-red-600">Action Rejected</h2>
        <p>
          {isMultiple
            ? `Creation of ${templateCount} devboxes was cancelled.`
            : `Devbox creation from template '${template}' was cancelled.`}
        </p>
      </div>
    );
  }

  // User approved - show status based on execution state
  if (userChoice === "approved") {
    // Action completed successfully
    if (status === "complete" && result) {
      return <div className="space-y-2">{result}</div>;
    }

    // Action is in progress
    if (status === "executing" || status === "inProgress") {
      return (
        <div className="space-y-2">
          <h2 className="font-semibold text-blue-600 text-lg">
            {isMultiple ? "Creating Devboxes..." : "Creating Devbox..."}
          </h2>
          {isMultiple ? (
            <div>
              <p>Creating {templateCount} devboxes from templates:</p>
              <ul className="mt-2 space-y-1">
                {templateList.map((t, index) => (
                  <li className="flex items-center text-sm" key={index}>
                    <span className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                    <strong>{t}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>
              Creating devbox from template '<strong>{template}</strong>'
            </p>
          )}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-blue-600 border-b-2" />
            <span className="text-gray-600 text-sm">Please wait...</span>
          </div>
        </div>
      );
    }

    // Action completed but no result (error case)
    if (status === "complete" && !result) {
      return (
        <div className="space-y-2">
          <h2 className="font-semibold text-lg text-red-600">
            Creation Failed
          </h2>
          <p>
            {isMultiple
              ? "Failed to create devboxes from templates"
              : `Failed to create devbox from template '${template}'`}
          </p>
        </div>
      );
    }
  }

  // Fallback for unknown state
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg">Devbox Action</h2>
      <p>
        Template{isMultiple ? "s" : ""}:{" "}
        <strong>
          {Array.isArray(template) ? template.join(", ") : template}
        </strong>
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

export function DeleteDevboxActionUI({
  devboxName,
  onSelect,
  onReject,
  status,
  result,
}: {
  devboxName: string | string[];
  onSelect: () => void;
  onReject: () => void;
  status: "complete" | "executing" | "inProgress";
  result: any;
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

  const isMultiple = Array.isArray(devboxName);
  const devboxList = Array.isArray(devboxName) ? devboxName : [devboxName];
  const devboxCount = devboxList.length;

  // Initial state - asking for confirmation
  if (userChoice === null) {
    return (
      <div className="space-y-4">
        <h2 className="font-semibold text-lg text-red-600">
          {isMultiple
            ? "Multiple Devboxes Deletion Confirmation"
            : "Devbox Deletion Confirmation"}
        </h2>
        <div className="rounded-lg border border-red-200 bg-background p-4">
          {isMultiple ? (
            <div>
              <p className="text-red-800">
                <strong>Warning:</strong> Are you sure you want to delete{" "}
                <strong>{devboxCount} devboxes</strong>?
              </p>
              <ul className="mt-2 space-y-1">
                {devboxList.map((name, index) => (
                  <li className="flex items-center" key={index}>
                    <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                    <strong>{name}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-red-800">
              <strong>Warning:</strong> Are you sure you want to delete devbox '
              <strong>{devboxName}</strong>'?
            </p>
          )}
          <p className="mt-2 text-red-600 text-sm">
            This action cannot be undone and will permanently remove all data
            associated with {isMultiple ? "these devboxes" : "this devbox"}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleApprove} variant="destructive">
            {isMultiple ? `Delete ${devboxCount} Devboxes` : "Delete Devbox"}
          </Button>
          <Button onClick={handleReject} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
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
            ? `Deletion of ${devboxCount} devboxes was cancelled. All devboxes remain intact.`
            : `Devbox '${devboxName}' deletion was cancelled. The devbox remains intact.`}
        </p>
      </div>
    );
  }

  // User approved - show status based on execution state
  if (userChoice === "approved") {
    // Action completed successfully
    if (status === "complete" && result) {
      return <div className="space-y-2">{result}</div>;
    }

    // Action is in progress
    if (status === "executing" || status === "inProgress") {
      return (
        <div className="space-y-2">
          <h2 className="font-semibold text-lg text-red-600">
            {isMultiple ? "Deleting Devboxes..." : "Deleting Devbox..."}
          </h2>
          {isMultiple ? (
            <div>
              <p>Deleting {devboxCount} devboxes:</p>
              <ul className="mt-2 space-y-1">
                {devboxList.map((name, index) => (
                  <li className="flex items-center text-sm" key={index}>
                    <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                    <strong>{name}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>
              Deleting devbox '<strong>{devboxName}</strong>'
            </p>
          )}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-red-600 border-b-2" />
            <span className="text-gray-600 text-sm">Please wait...</span>
          </div>
        </div>
      );
    }

    // Action completed but no result (error case)
    if (status === "complete" && !result) {
      return (
        <div className="space-y-2">
          <h2 className="font-semibold text-lg text-red-600">
            Deletion Failed
          </h2>
          <p>
            {isMultiple
              ? "Failed to delete devboxes"
              : `Failed to delete devbox '${devboxName}'`}
          </p>
        </div>
      );
    }
  }

  // Fallback for unknown state
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg">Devbox Deletion Action</h2>
      <p>
        Devbox Name{isMultiple ? "s" : ""}:{" "}
        <strong>
          {Array.isArray(devboxName) ? devboxName.join(", ") : devboxName}
        </strong>
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

export function StartDevboxActionUI({
  devboxName,
  status,
  result,
}: {
  devboxName: string | string[];
  status: "inProgress" | "executing" | "complete";
  result: any;
}) {
  const isMultiple = Array.isArray(devboxName);
  const devboxList = Array.isArray(devboxName) ? devboxName : [devboxName];
  const devboxCount = devboxList.length;

  if (status === "complete" && result) {
    return <div className="space-y-2">{result}</div>;
  }

  if (status === "executing" || status === "inProgress") {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-green-600 text-lg">
          {isMultiple ? "Starting Devboxes..." : "Starting Devbox..."}
        </h2>
        {isMultiple ? (
          <div>
            <p>Starting {devboxCount} devboxes:</p>
            <ul className="mt-2 space-y-1">
              {devboxList.map((name, index) => (
                <li className="flex items-center text-sm" key={index}>
                  <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                  <strong>{name}</strong>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>
            Starting devbox '<strong>{devboxName}</strong>'
          </p>
        )}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-green-600 border-b-2" />
          <span className="text-gray-600 text-sm">Please wait...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg">Start Devbox Action</h2>
      <p>
        Devbox Name{isMultiple ? "s" : ""}:{" "}
        <strong>
          {Array.isArray(devboxName) ? devboxName.join(", ") : devboxName}
        </strong>
      </p>
      <p>
        Status: <strong>{status}</strong>
      </p>
    </div>
  );
}

export function ShutdownDevboxActionUI({
  devboxName,
  status,
  result,
}: {
  devboxName: string | string[];
  status: "inProgress" | "executing" | "complete";
  result: any;
}) {
  const isMultiple = Array.isArray(devboxName);
  const devboxList = Array.isArray(devboxName) ? devboxName : [devboxName];
  const devboxCount = devboxList.length;

  if (status === "complete" && result) {
    return <div className="space-y-2">{result}</div>;
  }

  if (status === "executing" || status === "inProgress") {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-lg text-orange-600">
          {isMultiple ? "Shutting Down Devboxes..." : "Shutting Down Devbox..."}
        </h2>
        {isMultiple ? (
          <div>
            <p>Shutting down {devboxCount} devboxes:</p>
            <ul className="mt-2 space-y-1">
              {devboxList.map((name, index) => (
                <li className="flex items-center text-sm" key={index}>
                  <span className="mr-2 h-2 w-2 rounded-full bg-orange-500" />
                  <strong>{name}</strong>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>
            Shutting down devbox '<strong>{devboxName}</strong>'
          </p>
        )}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-orange-600 border-b-2" />
          <span className="text-gray-600 text-sm">Please wait...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg">Shutdown Devbox Action</h2>
      <p>
        Devbox Name{isMultiple ? "s" : ""}:{" "}
        <strong>
          {Array.isArray(devboxName) ? devboxName.join(", ") : devboxName}
        </strong>
      </p>
      <p>
        Status: <strong>{status}</strong>
      </p>
    </div>
  );
}

export function GetDevboxListActionUI({
  status,
  result,
}: {
  status: "inProgress" | "executing" | "complete";
  result: DevboxList;
}) {
  if (status === "complete" && result) {
    try {
      const devboxSummaries = extractDevboxListSummaries(result);

      return (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground text-lg">Devbox List</h2>
          {devboxSummaries.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-background p-4 text-center">
              <p className="text-foreground">No devboxes found</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-foreground text-sm">
                Found {devboxSummaries.length} devbox
                {devboxSummaries.length === 1 ? "" : "es"}
              </p>
              <div className="space-y-2">
                {devboxSummaries.map((devbox, index) => (
                  <div
                    className="rounded-lg border border-gray-200 bg-background p-4 shadow-sm"
                    key={devbox.name}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground text-lg">
                            {devbox.name}
                          </h3>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 font-medium text-xs ${
                              devbox.status === "Running"
                                ? "bg-green-100 text-green-800"
                                : devbox.status === "Stopped"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {devbox.status}
                          </span>
                          <span className="text-foreground text-xs">
                            ({devbox.phase})
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-foreground">Template:</span>
                            <span className="ml-1 font-mono text-foreground">
                              {devbox.template}
                            </span>
                          </div>
                          <div>
                            <span className="text-foreground">Resources:</span>
                            <span className="ml-1 text-foreground">
                              {devbox.cpu} CPU, {devbox.memory} Memory
                            </span>
                          </div>
                          <div>
                            <span className="text-foreground">Ports:</span>
                            <span className="ml-1 text-foreground">
                              {devbox.ports.length > 0
                                ? devbox.ports.join(", ")
                                : "None"}
                            </span>
                          </div>
                          <div>
                            <span className="text-foreground">Created:</span>
                            <span className="ml-1 text-foreground">
                              {devbox.createdAt}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    } catch (error) {
      // Fallback to raw JSON if parsing fails
      return (
        <div className="space-y-2">
          <h2 className="font-semibold text-foreground text-lg">
            Devbox List (Raw Data)
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
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-blue-600 text-lg">
          Getting Devbox List...
        </h2>
        <p className="text-foreground">Retrieving all devboxes</p>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-blue-600 border-b-2" />
          <span className="text-foreground text-sm">Please wait...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-foreground text-lg">
        Get Devbox List Action
      </h2>
      <p className="text-foreground">
        Status: <strong>{status}</strong>
      </p>
    </div>
  );
}
