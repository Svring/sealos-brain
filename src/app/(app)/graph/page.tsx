"use client";

// Force dynamic rendering since the layout uses headers()
export const dynamic = "force-dynamic";

import { Plus } from "lucide-react";
import Link from "next/link";
import { GraphCard } from "@/components/graph/graph-card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { useGraphOverview } from "@/hooks/use-graph-overview";
import { generateGraphName } from "@/lib/utils";

export default function GraphPage() {
  const { mergedGraphs, isLoading, deleteGraph, isDeletingGraph } =
    useGraphOverview();
  const graphNames = Object.keys(mergedGraphs);
  const hasGraphs = graphNames.length > 0;

  return (
    <div className="container mx-auto flex h-full flex-col p-6">
      <div className="mb-6 flex items-center gap-4">
        <div>
          <h1 className="font-bold text-3xl">Graph</h1>
        </div>
        <Link href={`/graph/${generateGraphName()}`}>
          <Button className="size-8" variant="outline">
            <Plus />
          </Button>
        </Link>
      </div>

      {(isLoading || !hasGraphs) && (
        <div className="rounded-lg border p-6">
          <Loading text="Computing your infrastructure graph" />
        </div>
      )}

      {!isLoading && hasGraphs && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {graphNames.map((graphName) => (
            <GraphCard
              graphName={graphName}
              isDeleting={isDeletingGraph}
              key={graphName}
              onDelete={deleteGraph}
              resources={mergedGraphs[graphName]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
