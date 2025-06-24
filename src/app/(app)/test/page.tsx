"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { directResourceListOptions } from "@/lib/sealos/k8s/k8s-query";
import { usePatchResourceAnnotationMutation } from "@/lib/sealos/k8s/k8s-mutation";
import { useSealosStore } from "@/store/sealos-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function K8sTestPage() {
  const { currentUser } = useSealosStore();
  const queryClient = useQueryClient();

  // Annotation management state
  const [selectedDevboxName, setSelectedDevboxName] = useState("");
  const [annotationKey, setAnnotationKey] = useState("");
  const [annotationValue, setAnnotationValue] = useState("");

  // Run all queries using the new generic function
  const devboxQuery = useQuery(directResourceListOptions(currentUser, "devbox"));
  const clusterQuery = useQuery(directResourceListOptions(currentUser, "cluster"));
  const deploymentQuery = useQuery(directResourceListOptions(currentUser, "deployment"));
  const cronJobQuery = useQuery(directResourceListOptions(currentUser, "cronjob"));
  const bucketQuery = useQuery(directResourceListOptions(currentUser, "objectstoragebucket"));

  // Add annotation mutation using the new generic hook
  const addAnnotationMutation = usePatchResourceAnnotationMutation();

  if (!currentUser) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">
            You must be logged in to access this page.
          </p>
        </div>
      </div>
    );
  }

  const handleAddAnnotation = () => {
    if (annotationKey && annotationValue && selectedDevboxName) {
      addAnnotationMutation.mutate({
        currentUser,
        resourceType: "devbox",
        resourceName: selectedDevboxName,
        annotationKey,
        annotationValue,
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["k8s"] });
          setAnnotationKey("");
          setAnnotationValue("");
        },
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Kubernetes Cluster Testing</h1>
      <p className="text-gray-600 mb-8">
        Test various Kubernetes API endpoints and explore your cluster resources
        interactively.
      </p>

      <Tabs defaultValue="resources" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resources">Resource Lists</TabsTrigger>
          <TabsTrigger value="annotations">Devbox Annotations</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <K8sQueryResult title="Devboxes" query={devboxQuery} />
            <K8sQueryResult title="Clusters" query={clusterQuery} />
            <K8sQueryResult title="Deployments" query={deploymentQuery} />
            <K8sQueryResult title="CronJobs" query={cronJobQuery} />
            <K8sQueryResult title="ObjectStorageBuckets" query={bucketQuery} />
          </div>
        </TabsContent>

        <TabsContent value="annotations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Devbox Annotation</CardTitle>
              <CardDescription>
                Add annotations to your devbox resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="devboxName">Devbox Name</Label>
                <Input
                  id="devboxName"
                  value={selectedDevboxName}
                  onChange={(e) => setSelectedDevboxName(e.target.value)}
                  placeholder="Enter devbox name"
                />
              </div>

              <div>
                <Label htmlFor="annotationKey">Add Annotation</Label>
                <div className="flex gap-2">
                  <Input
                    id="annotationKey"
                    placeholder="Key"
                    value={annotationKey}
                    onChange={(e) => setAnnotationKey(e.target.value)}
                  />
                  <Input
                    placeholder="Value"
                    value={annotationValue}
                    onChange={(e) => setAnnotationValue(e.target.value)}
                  />
                  <Button
                    onClick={handleAddAnnotation}
                    disabled={
                      !annotationKey || !annotationValue || !selectedDevboxName || addAnnotationMutation.isPending
                    }
                  >
                    {addAnnotationMutation.isPending ? "Adding..." : "Add"}
                  </Button>
                </div>
                {addAnnotationMutation.isSuccess && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                    <span className="text-green-600">
                      ✓ Annotation added successfully
                    </span>
                  </div>
                )}
                {addAnnotationMutation.isError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                    <span className="text-red-500">
                      ✗ Error: {addAnnotationMutation.error?.message || "Unknown error"}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function K8sQueryResult({ title, query }: { title: string; query: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract resource count and names for summary
  const getResourceSummary = (data: any) => {
    if (!data || data.error) return null;

    const items = data.body?.items || data.items || [];
    const count = items.length;
    const names = items
      .slice(0, 5)
      .map((item: any) => item.metadata?.name || "Unknown");

    return { count, names, hasMore: items.length > 5 };
  };

  const summary = query.isSuccess ? getResourceSummary(query.data) : null;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          {query.isSuccess && summary && (
            <Badge variant="secondary">{summary.count}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {query.isLoading && <p className="text-blue-500">Loading...</p>}

        {query.isError && (
          <p className="text-red-500">
            Error: {query.error?.message || String(query.error)}
          </p>
        )}

        {query.isSuccess && (
          <div className="space-y-2">
            {summary && summary.count > 0 ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Found {summary.count} resource{summary.count !== 1 ? "s" : ""}
                  :
                </p>
                <div className="space-y-1">
                  {summary.names.map((name: string, index: number) => (
                    <Badge key={index} variant="outline" className="mr-1 mb-1">
                      {name}
                    </Badge>
                  ))}
                  {summary.hasMore && (
                    <Badge variant="outline" className="mr-1 mb-1">
                      +{summary.count - 5} more...
                    </Badge>
                  )}
                </div>

                <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 p-0 h-auto"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Hide Raw Data
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-4 w-4 mr-1" />
                          Show Raw Data
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <pre className="overflow-x-auto text-xs bg-background p-2 rounded mt-2 max-h-60 overflow-y-auto">
                      {JSON.stringify(query.data, null, 2)}
                    </pre>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No resources found</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
