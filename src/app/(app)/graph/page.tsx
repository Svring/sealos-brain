"use client";

import { useGraphNode } from "@/hooks/use-graph-node";
import { GraphCard } from "@/components/graph/graph-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function GraphPage() {
  // Use the unified hook without specificGraphName to get all graphs
  const { mergedGraphs, isLoading, deleteGraph, isDeletingGraph } =
    useGraphNode();

  const graphNames = Object.keys(mergedGraphs);

  return (
    <div className="container mx-auto p-6 flex flex-col h-full">
      <div className="mb-6 flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Graph</h1>
        </div>
        <Link href="/graph/new-graph">
          <Button variant="outline" className="size-8">
            <Plus />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-lg border p-6">
          <div className="flex items-center justify-center h-full">
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
              onDelete={deleteGraph}
              isDeleting={isDeletingGraph}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg p-6 flex-1">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">No Graphs Found</h2>
              <p className="text-muted-foreground mb-4">
                No resources with graphName annotations were found
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
