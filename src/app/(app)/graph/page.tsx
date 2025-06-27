"use client";

// Force dynamic rendering since the layout uses headers()
export const dynamic = "force-dynamic";

import { Plus } from "lucide-react";
import Link from "next/link";
import { GraphCard } from "@/components/graph/graph-card";
import { Button } from "@/components/ui/button";
import { useGraphNode } from "@/hooks/use-graph-node";
import { Loading } from "@/components/ui/loading";
import { generateGraphName } from "@/lib/utils";

export default function GraphPage() {
  const { mergedGraphs, isLoading, deleteGraph, isDeletingGraph } =
    useGraphNode();
  const graphNames = Object.keys(mergedGraphs);

  const renderContent = () => (
    <div className="rounded-lg border p-6">
      <Loading text="Fetching your infrastructure resources" />
    </div>
  );

  const renderNoGraphs = () => (
    <div className="flex-1 rounded-lg p-6">
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 font-semibold text-xl">No Graphs Found</h2>
          <p className="mb-4 text-muted-foreground">
            No resources with graphName annotations were found
          </p>
        </div>
      </div>
    </div>
  );

  const renderGraphs = () => (
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
  );

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

      {isLoading && renderContent()}
      {!isLoading && graphNames.length === 0 && renderNoGraphs()}
      {!isLoading && graphNames.length > 0 && renderGraphs()}
    </div>
  );
}
