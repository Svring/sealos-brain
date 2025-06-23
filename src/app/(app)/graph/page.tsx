"use client";

import { useGraphNode } from "@/hooks/use-graph-node";
import { GraphCard } from "@/components/graph/graph-card";

export default function GraphPage() {
  // Use the unified hook without specificGraphName to get all graphs
  const { mergedGraphs, isLoading } = useGraphNode();

  const graphNames = Object.keys(mergedGraphs);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Graph</h1>
        <p className="text-muted-foreground">
          Visualize your Sealos infrastructure
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Loading...</h2>
              <p className="text-muted-foreground">
                Fetching your infrastructure resources
              </p>
            </div>
          </div>
        </div>
      ) : graphNames.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {graphNames.map((graphName) => (
            <GraphCard
              key={graphName}
              graphName={graphName}
              resources={mergedGraphs[graphName]}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">No Graphs Found</h2>
              <p className="text-muted-foreground">
                No resources with graphName annotations were found
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
