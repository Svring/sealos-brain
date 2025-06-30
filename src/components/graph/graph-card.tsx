import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GraphCardProps {
  graphName: string;
  resources: {
    [resourceKind: string]: string[];
  };
  onDeleteGraph?: (graphName: string) => Promise<void>;
  onDeleteAllResources?: (graphName: string) => Promise<void>;
  isDeletingGraph?: boolean;
  isDeletingAllResources?: boolean;
}

export function GraphCard({ graphName, resources }: GraphCardProps) {
  const totalResources = Object.values(resources).reduce(
    (acc, resourceList) => acc + resourceList.length,
    0
  );

  return (
    <Card className="group hover:-translate-y-1 w-full max-w-sm border-0 bg-card shadow-sm transition-all duration-200 hover:shadow-lg">
      <Link
        className="flex h-32 flex-col justify-between px-6"
        href={`/graph/${encodeURIComponent(graphName)}`}
      >
        <CardHeader className="p-0">
          <CardTitle className="truncate font-semibold text-foreground text-lg tracking-tight transition-colors duration-200">
            {graphName}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-auto p-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-muted-foreground text-sm">
              {totalResources} {totalResources === 1 ? "resource" : "resources"}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
