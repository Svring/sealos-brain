/* eslint-disable complexity, sonarjs/cognitive-complexity */

import { CheckIcon, LinkIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAddResourceToGraphMutation } from "@/lib/graph/graph-mutation";
import type { GraphCreationRequest } from "@/lib/graph/graph-utils";
import {
  createGraphWithNewResources,
  generateUniqueGraphName,
} from "@/lib/graph/graph-utils";
import { useSealosStore } from "@/store/sealos-store";
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

// Helper function to render new resource badges
function renderNewResourceBadges(
  resources: GraphCreationRequest["resources"],
  colorScheme: "green" | "blue" = "green"
) {
  return (
    <div className="space-y-2">
      {resources.devbox && resources.devbox.length > 0 && (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full bg-${colorScheme}-100 px-2 py-1 font-medium text-${colorScheme}-800 text-xs`}
          >
            Devboxes ({resources.devbox.length})
          </span>
          <span className={`text-${colorScheme}-700 text-sm`}>
            {resources.devbox.join(", ")}
          </span>
        </div>
      )}
      {resources.cluster && resources.cluster.length > 0 && (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full bg-${colorScheme}-100 px-2 py-1 font-medium text-${colorScheme}-800 text-xs`}
          >
            Clusters ({resources.cluster.length})
          </span>
          <span className={`text-${colorScheme}-700 text-sm`}>
            {resources.cluster.join(", ")}
          </span>
        </div>
      )}
      {resources.objectstoragebucket &&
        resources.objectstoragebucket.count > 0 && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full bg-${colorScheme}-100 px-2 py-1 font-medium text-${colorScheme}-800 text-xs`}
            >
              Storage Buckets ({resources.objectstoragebucket.count})
            </span>
            <span className={`text-${colorScheme}-700 text-sm`}>
              {resources.objectstoragebucket.count} bucket
              {resources.objectstoragebucket.count === 1 ? "" : "s"} will be
              created
            </span>
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
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h2 className="mb-2 font-semibold text-blue-900 text-lg">
          Create Graph: {graphName}
        </h2>
        <p className="mb-3 text-blue-800 text-sm">
          Add {totalResources} existing resource
          {totalResources === 1 ? "" : "s"} to this graph
        </p>

        <div className="space-y-2">
          {Object.entries(resources).map(([resourceType, names]) => (
            <div className="flex items-center gap-2" key={resourceType}>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs capitalize">
                {resourceType} ({names.length})
              </span>
              <span className="text-blue-700 text-sm">{names.join(", ")}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={onApprove}
          variant="default"
        >
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
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-blue-600 border-b-2" />
          <h2 className="font-semibold text-blue-900 text-lg">
            Creating Graph...
          </h2>
        </div>
        <p className="mb-3 text-blue-800 text-sm">
          Creating '<strong>{graphName}</strong>' and adding {totalResources}{" "}
          resource{totalResources === 1 ? "" : "s"}
        </p>

        <div className="space-y-2">
          {Object.entries(resources).map(([resourceType, names]) => (
            <div className="flex items-center gap-2" key={resourceType}>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs capitalize">
                {resourceType} ({names.length})
              </span>
              <span className="text-blue-700 text-sm">{names.join(", ")}</span>
            </div>
          ))}
        </div>
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
  totalResources,
  onSelect,
  onReject,
  status,
  result,
}: {
  graphName: string;
  resources: Record<string, string[]>;
  totalResources: number;
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

/* eslint-disable complexity, sonarjs/cognitive-complexity */
export function CreateGraphWithNewResourcesActionUI({
  status,
  args,
  result,
  respond,
}: {
  status: "complete" | "executing" | "inProgress";
  args: { graphName: string; resources: GraphCreationRequest["resources"] };
  result: CreateGraphWithNewResourcesResult | string | null;
  respond?: (message: string) => void;
}) {
  const { graphName, resources } = args;
  const { currentUser, regionUrl } = useSealosStore();
  const { mutateAsync: addResourceToGraph } = useAddResourceToGraphMutation();
  const [choice, setChoice] = useState<"pending" | "rejected" | "approved">(
    "pending"
  );
  const [uniqueGraphName] = useState(() =>
    generateUniqueGraphName(graphName as string)
  );

  const request: GraphCreationRequest = {
    graphName: uniqueGraphName,
    resources: resources as GraphCreationRequest["resources"],
  };

  const totalResources =
    (request.resources.devbox?.length || 0) +
    (request.resources.cluster?.length || 0) +
    (request.resources.objectstoragebucket?.count || 0);

  const handleApprove = async () => {
    setChoice("approved");
    try {
      const createResult = await createGraphWithNewResources(
        request,
        currentUser,
        regionUrl,
        addResourceToGraph
      );
      respond?.(createResult.summary);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      respond?.(`Failed to create graph with new resources: ${errorMessage}`);
    }
  };

  const handleReject = () => {
    setChoice("rejected");
    respond?.(
      "User cancelled the graph creation operation, step down and ask whether they have any other questions"
    );
  };

  if (choice === "pending") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-semibold text-lg">
            Create Graph: {uniqueGraphName}
          </h2>
          <p className="mb-3 text-foreground/80 text-sm">
            Create {totalResources} new resource
            {totalResources === 1 ? "" : "s"} and add them to this graph.
          </p>
          {renderNewResourceBadges(request.resources, "green")}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleApprove} variant="default">
            Create Graph
          </Button>
          <Button onClick={handleReject} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (choice === "rejected") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-semibold text-lg text-red-600">
            Action Cancelled
          </h2>
          <p className="text-foreground/80 text-sm">
            Graph and resource creation was cancelled.
          </p>
        </div>
      </div>
    );
  }

  // choice approved
  if (status === "executing" || status === "inProgress") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-green-600 border-b-2" />
            <h2 className="font-semibold text-green-900 text-lg">
              Creating Graph and Resources...
            </h2>
          </div>
          <p className="mb-3 text-foreground/80 text-sm">
            Creating '{uniqueGraphName}' and generating {totalResources} new
            resource{totalResources === 1 ? "" : "s"}
          </p>
          {renderNewResourceBadges(request.resources, "green")}
        </div>
      </div>
    );
  }

  if (status === "complete" && result) {
    const gName = extractGraphName(result) || uniqueGraphName;
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 font-semibold text-green-600 text-lg">
            Graph and Resources Created Successfully
          </h2>
          <div className="space-y-2 text-foreground text-sm">
            {typeof result === "string" ? (
              <p>{result}</p>
            ) : (
              <>
                <p className="font-medium">Graph: {result.graphName}</p>
                <p>Resources Created: {result.resourcesCreated}</p>
                <p>Resources Added: {result.resourcesAddedToGraph}</p>
              </>
            )}
          </div>
        </div>
        <div className="mt-2">
          <Link href={`/graph/${encodeURIComponent(gName)}`} passHref>
            <Button variant="default">Go to graph: {gName}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg text-red-600">Creation Failed</h2>
      <p>Failed to create graph '{uniqueGraphName}' with new resources.</p>
    </div>
  );
}

interface DeleteDevboxesResult {
  resourceType: string;
  successful: string[];
  failed: string[];
  summary: string;
}

/* eslint-disable complexity, sonarjs/cognitive-complexity */
export function DeleteDevboxesActionUI({
  status,
  args,
  result,
  respond,
}: {
  status: "complete" | "executing" | "inProgress";
  args: { devboxNames: string[] };
  result: DeleteDevboxesResult | string | null;
  respond?: (message: string) => void;
}) {
  const { currentUser, regionUrl } = useSealosStore();
  const [choice, setChoice] = useState<"pending" | "rejected" | "approved">(
    "pending"
  );

  const { devboxNames } = args;
  const devboxNamesArray = Array.isArray(devboxNames)
    ? devboxNames
    : [devboxNames];
  const validDevboxNames = devboxNamesArray.filter(
    (name): name is string => typeof name === "string" && name.trim().length > 0
  );

  const isMultiple = validDevboxNames.length > 1;

  const handleApprove = async () => {
    setChoice("approved");
    try {
      if (!(currentUser && regionUrl)) {
        throw new Error("User not authenticated or region URL missing");
      }

      const { deleteDevboxesFromGraph } = await import(
        "@/lib/graph/graph-utils"
      );
      const deleteResult = await deleteDevboxesFromGraph(
        validDevboxNames,
        currentUser,
        regionUrl
      );
      respond?.(deleteResult.summary);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      respond?.(`Failed to delete devboxes: ${errorMessage}`);
    }
  };

  const handleReject = () => {
    setChoice("rejected");
    respond?.("User cancelled the devbox deletion operation");
  };

  if (validDevboxNames.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="font-semibold text-lg text-red-600">
          Invalid Devbox Names
        </h2>
        <p>No valid devbox names provided.</p>
      </div>
    );
  }

  if (choice === "pending") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-background p-4">
          <h2 className="font-semibold text-lg text-red-600">
            {isMultiple
              ? "Multiple Devboxes Deletion Confirmation"
              : "Devbox Deletion Confirmation"}
          </h2>
          {isMultiple ? (
            <div>
              <p className="text-red-800">
                <strong>Warning:</strong> Are you sure you want to delete{" "}
                <strong>{validDevboxNames.length} devboxes</strong>?
              </p>
              <ul className="mt-2 space-y-1">
                {validDevboxNames.map((name) => (
                  <li className="flex items-center" key={name}>
                    <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                    <strong>{name}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-red-800">
              <strong>Warning:</strong> Are you sure you want to delete devbox '
              <strong>{validDevboxNames[0]}</strong>'?
            </p>
          )}
          <p className="mt-2 text-red-600 text-sm">
            This action cannot be undone and will permanently remove all data
            associated with {isMultiple ? "these devboxes" : "this devbox"}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={handleApprove}
            variant="default"
          >
            {isMultiple
              ? `Delete ${validDevboxNames.length} Devboxes`
              : "Delete Devbox"}
          </Button>
          <Button onClick={handleReject} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (choice === "rejected") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-semibold text-lg text-red-600">
            Action Cancelled
          </h2>
          <p className="text-foreground/80 text-sm">
            Devbox deletion was cancelled.
          </p>
        </div>
      </div>
    );
  }

  // choice approved
  if (status === "executing" || status === "inProgress") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-background p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-red-600 border-b-2" />
            <h2 className="font-semibold text-lg text-red-600">
              {isMultiple ? "Deleting Devboxes..." : "Deleting Devbox..."}
            </h2>
          </div>
          {isMultiple ? (
            <div>
              <p>Deleting {validDevboxNames.length} devboxes:</p>
              <ul className="mt-2 space-y-1">
                {validDevboxNames.map((name) => (
                  <li className="flex items-center text-sm" key={name}>
                    <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                    <strong>{name}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>
              Deleting devbox '<strong>{validDevboxNames[0]}</strong>'
            </p>
          )}
        </div>
      </div>
    );
  }

  if (status === "complete" && result) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 font-semibold text-green-600 text-lg">
            Devboxes Deleted Successfully
          </h2>
          <div className="space-y-2 text-foreground text-sm">
            {typeof result === "string" ? (
              <p>{result}</p>
            ) : (
              <>
                <p>Successful: {result.successful.length}</p>
                <p>Failed: {result.failed.length}</p>
                <p>{result.summary}</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg text-red-600">Deletion Failed</h2>
      <p>Failed to delete devboxes.</p>
    </div>
  );
}
