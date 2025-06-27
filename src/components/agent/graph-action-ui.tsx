import Link from "next/link";
import { useState } from "react";
import type { GraphCreationRequest } from "@/lib/graph/graph-utils";
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

interface CreateGraphWithNewResourcesResult {
  graphName: string;
  resourcesCreated: number;
  resourcesAddedToGraph: number;
  summary: string;
}

const GRAPH_NAME_REGEX = /Graph '([^']+)'/;

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

// Helper function to render new resource list
function renderNewResourceList(
  resources: GraphCreationRequest["resources"],
  color: string
) {
  return (
    <div className="mt-2 space-y-2">
      {resources.devbox && resources.devbox.length > 0 && (
        <div>
          <h5 className="font-medium text-sm">
            Devboxes ({resources.devbox.length}):
          </h5>
          <ul className="ml-4 space-y-1">
            {resources.devbox.map((template) => (
              <li className="flex items-center text-sm" key={template}>
                <span className={`mr-2 h-2 w-2 rounded-full bg-${color}-500`} />
                <strong>{template}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
      {resources.cluster && resources.cluster.length > 0 && (
        <div>
          <h5 className="font-medium text-sm">
            Clusters ({resources.cluster.length}):
          </h5>
          <ul className="ml-4 space-y-1">
            {resources.cluster.map((dbType) => (
              <li className="flex items-center text-sm" key={dbType}>
                <span className={`mr-2 h-2 w-2 rounded-full bg-${color}-500`} />
                <strong>{dbType}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
      {resources.objectstoragebucket && (
        <div>
          <h5 className="font-medium text-sm">
            Object Storage Buckets ({resources.objectstoragebucket.count}):
          </h5>
          <div className="ml-4">
            <span className="flex items-center text-sm">
              <span className={`mr-2 h-2 w-2 rounded-full bg-${color}-500`} />
              <strong>
                {resources.objectstoragebucket.count} buckets will be created
              </strong>
            </span>
          </div>
        </div>
      )}
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

function extractGraphName(
  result: CreateGraphResult | CreateGraphWithNewResourcesResult | string | null
): string | undefined {
  if (result && typeof result === "object") {
    // Prefer direct property access for known result types
    if ("graphName" in result && typeof result.graphName === "string") {
      return result.graphName;
    }
    return;
  }
  if (typeof result === "string") {
    const match = result.match(GRAPH_NAME_REGEX);
    return match ? match[1] : undefined;
  }
  return;
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
    const createdGraphName = extractGraphName(result);
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-green-600 text-lg">
          Graph Created Successfully
        </h2>
        <p>{resultText}</p>
        {createdGraphName && (
          <div className="mt-4">
            <Link
              href={`/graph/${encodeURIComponent(createdGraphName)}`}
              legacyBehavior
              passHref
            >
              <a href={`/graph/${encodeURIComponent(createdGraphName)}`}>
                <button
                  className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                  type="button"
                >
                  Go to Graph
                </button>
              </a>
            </Link>
          </div>
        )}
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

function GraphWithNewResourcesSuccess({
  result,
}: {
  result: CreateGraphWithNewResourcesResult | string;
}) {
  const graphName = extractGraphName(result);
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-green-600 text-lg">
        Graph and Resources Created Successfully
      </h2>
      <div className="text-sm">
        {typeof result === "string" ? (
          <p>{result}</p>
        ) : (
          <div className="space-y-1">
            <p>
              <strong>Graph:</strong> {result.graphName}
            </p>
            <p>
              <strong>Resources Created:</strong> {result.resourcesCreated}
            </p>
            <p>
              <strong>Resources Added to Graph:</strong>{" "}
              {result.resourcesAddedToGraph}
            </p>
          </div>
        )}
        {graphName && (
          <div className="mt-4">
            <Link
              href={`/graph/${encodeURIComponent(graphName)}`}
              legacyBehavior
              passHref
            >
              <a href={`/graph/${encodeURIComponent(graphName)}`}>
                <button
                  className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                  type="button"
                >
                  Go to graph: {graphName}
                </button>
              </a>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function GraphWithNewResourcesProgress({
  graphName,
  resources,
  totalResources,
}: {
  graphName: string;
  resources: GraphCreationRequest["resources"];
  totalResources: number;
}) {
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-blue-600 text-lg">
        Creating Graph and Resources...
      </h2>
      <p>
        Creating graph '<strong>{graphName}</strong>' and generating{" "}
        {totalResources} new resources
      </p>
      {renderNewResourceList(resources, "blue")}
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-blue-600 border-b-2" />
        <span className="text-gray-600 text-sm">Please wait...</span>
      </div>
    </div>
  );
}

export function CreateGraphWithNewResourcesActionUI({
  graphName,
  resources,
  onSelect,
  onReject,
  status,
  result,
}: {
  graphName: string;
  resources: GraphCreationRequest["resources"];
  onSelect: () => void;
  onReject: () => void;
  status: "complete" | "executing" | "inProgress";
  result: CreateGraphWithNewResourcesResult | string | null;
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

  // Calculate total resources to be created
  const totalResources =
    (resources.devbox?.length || 0) +
    (resources.cluster?.length || 0) +
    (resources.objectstoragebucket?.count || 0);

  // Initial state - asking for confirmation
  if (userChoice === null) {
    return (
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">
          Graph Creation with New Resources
        </h2>
        <div>
          <p>
            Do you want to create a graph named '<strong>{graphName}</strong>'
            and create <strong>{totalResources} new resources</strong> to add to
            it?
          </p>
          {renderNewResourceList(resources, "blue")}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleApprove} variant="default">
            Create Graph & Resources
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
        <h2 className="font-semibold text-lg text-red-600">Action Cancelled</h2>
        <p>Graph and resource creation was cancelled.</p>
      </div>
    );
  }

  // User approved - show status based on execution state
  if (userChoice === "approved") {
    // Action completed successfully
    if (status === "complete" && result) {
      return <GraphWithNewResourcesSuccess result={result} />;
    }

    // Action is in progress
    if (status === "executing" || status === "inProgress") {
      return (
        <GraphWithNewResourcesProgress
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
        <p>Failed to create graph '{graphName}' with new resources</p>
      </div>
    );
  }

  // Fallback for unknown state
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg">Graph and Resource Creation</h2>
      <p>
        Graph Name: <strong>{graphName}</strong>
      </p>
      <p>
        Resources to Create: <strong>{totalResources}</strong>
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
