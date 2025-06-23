import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface GraphCardProps {
  graphName: string;
  resources: {
    [resourceKind: string]: string[];
  };
}

export function GraphCard({ graphName, resources }: GraphCardProps) {
  const totalResources = Object.values(resources).reduce(
    (acc, resourceList) => acc + resourceList.length,
    0
  );

  const resourceTypes = Object.keys(resources);

  return (
    <Link href={`/graph/${encodeURIComponent(graphName)}`}>
      <Card className="w-full cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{graphName}</CardTitle>
            <Badge variant="secondary" className="ml-2">
              {totalResources} resources
            </Badge>
          </div>
          <CardDescription>
            Graph containing {resourceTypes.length} resource type{resourceTypes.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {Object.entries(resources).map(([resourceKind, resourceList]) => (
              <div
                key={resourceKind}
                className="flex items-center justify-between p-2 rounded-md bg-muted/50"
              >
                <span className="font-medium capitalize">{resourceKind}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {resourceList.length}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {resourceList.join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
