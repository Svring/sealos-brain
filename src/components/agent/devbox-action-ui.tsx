import { useState } from "react";
import { Button } from "../ui/button";

export function CreateDevboxActionUI({
  template,
  onSelect,
  onReject,
  status,
  result,
}: {
  template: string;
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

  // Initial state - asking for confirmation
  if (userChoice === null) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Devbox Creation Confirmation</h2>
        <p>
          Do you want to create a devbox from template '
          <strong>{template}</strong>'?
        </p>
        <div className="flex gap-2">
          <Button onClick={handleApprove} variant="default">
            Approve
          </Button>
          <Button onClick={handleReject} variant="outline">
            Reject
          </Button>
        </div>
      </div>
    );
  }

  // User rejected the action
  if (userChoice === "rejected") {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-red-600">Action Rejected</h2>
        <p>
          Devbox creation from template '<strong>{template}</strong>' was
          cancelled.
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
          <h2 className="text-lg font-semibold text-blue-600">
            Creating Devbox...
          </h2>
          <p>
            Creating devbox from template '<strong>{template}</strong>'
          </p>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Please wait...</span>
          </div>
        </div>
      );
    }

    // Action completed but no result (error case)
    if (status === "complete" && !result) {
      return (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-red-600">
            Creation Failed
          </h2>
          <p>
            Failed to create devbox from template '<strong>{template}</strong>'
          </p>
        </div>
      );
    }
  }

  // Fallback for unknown state
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Devbox Action</h2>
      <p>
        Template: <strong>{template}</strong>
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
  devboxName: string;
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

  // Initial state - asking for confirmation
  if (userChoice === null) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-red-600">
          Devbox Deletion Confirmation
        </h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">
            <strong>Warning:</strong> Are you sure you want to delete devbox '
            <strong>{devboxName}</strong>'?
          </p>
          <p className="text-sm text-red-600 mt-2">
            This action cannot be undone and will permanently remove all data
            associated with this devbox.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleApprove} variant="destructive">
            Delete Devbox
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
        <h2 className="text-lg font-semibold text-green-600">
          Deletion Cancelled
        </h2>
        <p>
          Devbox '<strong>{devboxName}</strong>' deletion was cancelled. The
          devbox remains intact.
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
          <h2 className="text-lg font-semibold text-red-600">
            Deleting Devbox...
          </h2>
          <p>
            Deleting devbox '<strong>{devboxName}</strong>'
          </p>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            <span className="text-sm text-gray-600">Please wait...</span>
          </div>
        </div>
      );
    }

    // Action completed but no result (error case)
    if (status === "complete" && !result) {
      return (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-red-600">
            Deletion Failed
          </h2>
          <p>
            Failed to delete devbox '<strong>{devboxName}</strong>'
          </p>
        </div>
      );
    }
  }

  // Fallback for unknown state
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Devbox Deletion Action</h2>
      <p>
        Devbox Name: <strong>{devboxName}</strong>
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
