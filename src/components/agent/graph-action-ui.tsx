import { useState } from "react";
import { Button } from "../ui/button";

interface GraphInfo {
  graphs: Record<string, Record<string, string[]>>;
  totalGraphs: number;
  graphNames: string[];
}

interface CreateGraphResult {
  graphName: string;
  resourcesAdded: number;
}

// Helper function to render resource list
function renderResourceList(
  resources: Record<string, string[]>,
  color: string
) {
  return (
    <div className="mt-2 space-y-2">
      {Object.entries(resources).map(([resourceType, names]) => (
        <div key={resourceType}>
          <h5 className="font-medium text-sm capitalize">{resourceType}:</h5>
          <ul className="ml-4 space-y-1">
            {names.map((name) => (
              <li className="flex items-center text-sm" key={name}>
                <span className={`mr-2 h-2 w-2 rounded-full bg-${color}-500`} />
                <strong>{name}</strong>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// Helper function to render progress state
function renderProgressState(
  title: string,
  description: string,
  color: string
) {
  return (
    <div className="space-y-2">
      <h2 className={`font-semibold text-lg text-${color}-600`}>{title}</h2>
      <p className="text-foreground">{description}</p>
      <div className="flex items-center gap-2">
        <div
          className={`h-4 w-4 animate-spin rounded-full border-${color}-600 border-b-2`}
        />
        <span className="text-gray-600 text-sm">Please wait...</span>
      </div>
    </div>
  );
}

export function GetGraphListActionUI({
  status,
  result,
}: {
  status: "inProgress" | "executing" | "complete";
  result: GraphInfo | null;
}) {
  if (status === "complete" && result) {
    const { graphs, totalGraphs, graphNames } = result;

    return (
      <div className="space-y-4">
        <h2 className="font-semibold text-foreground text-lg">
          Graph List ({totalGraphs} graphs)
        </h2>
        {totalGraphs === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-background p-4 text-center">
            <p className="text-foreground">No graphs found</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-foreground text-sm">
              Found {totalGraphs} graph{totalGraphs === 1 ? "" : "s"}:
            </p>
            <div className="space-y-3">
              {graphNames.map((graphName) => {
                const graphResources = graphs[graphName] || {};
                const totalResources = Object.values(graphResources).reduce(
                  (acc, names) => acc + names.length,
                  0
                );
                return (
                  <div
                    className="rounded-lg border border-gray-200 bg-background p-4 shadow-sm"
                    key={graphName}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground text-lg">
                            {graphName}
                          </h3>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs">
                            {totalResources} resources
                          </span>
                        </div>
                        {renderResourceList(graphResources, "blue")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === "executing" || status === "inProgress") {
    return renderProgressState(
      "Getting Graph List...",
      "Retrieving all graphs with their resources",
      "blue"
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-foreground text-lg">
        Get Graph List Action
      </h2>
      <p className="text-foreground">
        Status: <strong>{status}</strong>
      </p>
    </div>
  );
}

// Helper components to reduce complexity
function GraphCreationConfirmation({
  graphName,
  resources,
  totalResources,
  onApprove,
  onReject,
}: {
  graphName: string;
  resources: Record<string, string[]>;
  totalResources: number;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Graph Creation Confirmation</h2>
      <div>
        <p>
          Do you want to create a graph named '<strong>{graphName}</strong>' and
          add <strong>{totalResources} resources</strong> to it?
        </p>
        {renderResourceList(resources, "blue")}
      </div>
      <div className="flex gap-2">
        <Button onClick={onApprove} variant="default">
          Create Graph
        </Button>
        <Button onClick={onReject} variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  );
}

function GraphCreationProgress({
  graphName,
  resources,
  totalResources,
}: {
  graphName: string;
  resources: Record<string, string[]>;
  totalResources: number;
}) {
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-blue-600 text-lg">Creating Graph...</h2>
      <p>
        Creating graph '<strong>{graphName}</strong>' and adding{" "}
        {totalResources} resources
      </p>
      {renderResourceList(resources, "blue")}
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-blue-600 border-b-2" />
        <span className="text-gray-600 text-sm">Please wait...</span>
      </div>
    </div>
  );
}

function GraphCreationApproved({
  status,
  result,
  graphName,
  resources,
  totalResources,
}: {
  status: "complete" | "executing" | "inProgress";
  result: CreateGraphResult | string | null;
  graphName: string;
  resources: Record<string, string[]>;
  totalResources: number;
}) {
  // Action completed successfully
  if (status === "complete" && result) {
    const resultText =
      typeof result === "string"
        ? result
        : `Graph '${result.graphName}' created successfully with ${result.resourcesAdded} resources added`;
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-green-600 text-lg">
          Graph Created Successfully
        </h2>
        <p>{resultText}</p>
      </div>
    );
  }

  // Action is in progress
  if (status === "executing" || status === "inProgress") {
    return (
      <GraphCreationProgress
        graphName={graphName}
        resources={resources}
        totalResources={totalResources}
      />
    );
  }

  // Action completed but no result (error case)
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg text-red-600">Creation Failed</h2>
      <p>Failed to create graph '{graphName}'</p>
    </div>
  );
}

export function CreateGraphWithResourcesActionUI({
  graphName,
  resources,
  onSelect,
  onReject,
  status,
  result,
}: {
  graphName: string;
  resources: Record<string, string[]>;
  onSelect: () => void;
  onReject: () => void;
  status: "complete" | "executing" | "inProgress";
  result: CreateGraphResult | string | null;
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

  const totalResources = Object.values(resources).reduce(
    (acc, names) => acc + names.length,
    0
  );

  // Initial state - asking for confirmation
  if (userChoice === null) {
    return (
      <GraphCreationConfirmation
        graphName={graphName}
        onApprove={handleApprove}
        onReject={handleReject}
        resources={resources}
        totalResources={totalResources}
      />
    );
  }

  // User rejected the action
  if (userChoice === "rejected") {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-lg text-red-600">Action Cancelled</h2>
        <p>Graph creation was cancelled.</p>
      </div>
    );
  }

  // User approved - show status based on execution state
  if (userChoice === "approved") {
    return (
      <GraphCreationApproved
        graphName={graphName}
        resources={resources}
        result={result}
        status={status}
        totalResources={totalResources}
      />
    );
  }

  // Fallback for unknown state
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg">Graph Creation Action</h2>
      <p>
        Graph Name: <strong>{graphName}</strong>
      </p>
      <p>
        Resources: <strong>{totalResources}</strong>
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
