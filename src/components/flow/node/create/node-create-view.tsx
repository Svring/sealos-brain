import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Box,
  Database,
  Code,
  Globe,
  Settings,
  Zap,
  Clock,
  HardDrive,
  Plus,
  Search,
} from "lucide-react";
import { usePanel } from "@/context/panel-provider";
import { useSealosStore } from "@/store/sealos-store";
import { useQuery } from "@tanstack/react-query";
import { directResourceListOptions } from "@/lib/sealos/k8s/k8s-query";
import { usePatchResourceAnnotationMutation } from "@/lib/sealos/k8s/k8s-mutation";
import { RESOURCES, type ResourceType } from "@/lib/sealos/k8s/k8s-utils";
import DevboxCreateView from "@/components/flow/node/devbox/create/view/devbox-create-view";

interface NodeCreateViewProps {
  onCreateNode: (nodeType: string) => void;
}

// Icon mapping for resource types
const resourceIcons: Record<ResourceType, React.ComponentType<any>> = {
  devbox: Box,
  cluster: Database,
  deployment: Code,
  cronjob: Clock,
  objectstoragebucket: HardDrive,
};

// Color mapping for resource types
const resourceColors: Record<ResourceType, string> = {
  devbox: "bg-blue-500",
  cluster: "bg-green-500",
  deployment: "bg-purple-500",
  cronjob: "bg-orange-500",
  objectstoragebucket: "bg-indigo-500",
};

// Display names for resource types
const resourceDisplayNames: Record<ResourceType, string> = {
  devbox: "DevBox",
  cluster: "Database Cluster",
  deployment: "Deployment",
  cronjob: "Cron Job",
  objectstoragebucket: "Object Storage",
};

// Descriptions for resource types
const resourceDescriptions: Record<ResourceType, string> = {
  devbox: "Create a new development environment",
  cluster: "Set up a database cluster instance",
  deployment: "Deploy an application",
  cronjob: "Schedule automated tasks",
  objectstoragebucket: "Manage object storage buckets",
};

interface ExistingResource {
  name: string;
  type: ResourceType;
  status?: string;
  annotations?: Record<string, string>;
}

export default function NodeCreateView({ onCreateNode }: NodeCreateViewProps) {
  const { openPanel } = usePanel();
  const { currentUser } = useSealosStore();
  const [selectedExistingTab, setSelectedExistingTab] = useState("all");
  const [selectedResource, setSelectedResource] =
    useState<ExistingResource | null>(null);
  const [graphName, setGraphName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const patchAnnotationMutation = usePatchResourceAnnotationMutation();

  // Fetch all resource types
  const devboxQuery = useQuery(
    directResourceListOptions(currentUser, "devbox")
  );
  const clusterQuery = useQuery(
    directResourceListOptions(currentUser, "cluster")
  );
  const deploymentQuery = useQuery(
    directResourceListOptions(currentUser, "deployment")
  );
  const cronjobQuery = useQuery(
    directResourceListOptions(currentUser, "cronjob")
  );
  const bucketQuery = useQuery(
    directResourceListOptions(currentUser, "objectstoragebucket")
  );

  // Combine all resources into a single list
  const allResources: ExistingResource[] = React.useMemo(() => {
    const resources: ExistingResource[] = [];

    // Add devboxes
    if (devboxQuery.data?.body?.items) {
      devboxQuery.data.body.items.forEach((item: any) => {
        resources.push({
          name: item.metadata?.name || "",
          type: "devbox",
          status: item.status?.phase || "Unknown",
          annotations: item.metadata?.annotations || {},
        });
      });
    }

    // Add clusters
    if (clusterQuery.data?.body?.items) {
      clusterQuery.data.body.items.forEach((item: any) => {
        resources.push({
          name: item.metadata?.name || "",
          type: "cluster",
          status: item.status?.phase || "Unknown",
          annotations: item.metadata?.annotations || {},
        });
      });
    }

    // Add deployments
    if (deploymentQuery.data?.body?.items) {
      deploymentQuery.data.body.items.forEach((item: any) => {
        resources.push({
          name: item.metadata?.name || "",
          type: "deployment",
          status: item.status?.conditions?.[0]?.type || "Unknown",
          annotations: item.metadata?.annotations || {},
        });
      });
    }

    // Add cronjobs
    if (cronjobQuery.data?.body?.items) {
      cronjobQuery.data.body.items.forEach((item: any) => {
        resources.push({
          name: item.metadata?.name || "",
          type: "cronjob",
          status: item.status?.active ? "Active" : "Inactive",
          annotations: item.metadata?.annotations || {},
        });
      });
    }

    // Add object storage buckets
    if (bucketQuery.data?.body?.items) {
      bucketQuery.data.body.items.forEach((item: any) => {
        resources.push({
          name: item.metadata?.name || "",
          type: "objectstoragebucket",
          status: item.status?.phase || "Unknown",
          annotations: item.metadata?.annotations || {},
        });
      });
    }

    return resources;
  }, [
    devboxQuery.data,
    clusterQuery.data,
    deploymentQuery.data,
    cronjobQuery.data,
    bucketQuery.data,
  ]);

  // Filter resources based on selected tab
  const filteredResources = React.useMemo(() => {
    if (selectedExistingTab === "all") {
      return allResources;
    }
    return allResources.filter(
      (resource) => resource.type === selectedExistingTab
    );
  }, [allResources, selectedExistingTab]);

  // Get unique resource types from existing resources
  const existingResourceTypes = React.useMemo(() => {
    const types = new Set(allResources.map((resource) => resource.type));
    return Array.from(types);
  }, [allResources]);

  const handleResourceClick = (resource: ExistingResource) => {
    if (!resource.annotations?.graphName) {
      setSelectedResource(resource);
      setGraphName("");
      setIsDialogOpen(true);
    }
  };

  const handleAddToGraph = async () => {
    if (!selectedResource || !graphName.trim()) return;

    try {
      await patchAnnotationMutation.mutateAsync({
        currentUser,
        resourceType: selectedResource.type,
        resourceName: selectedResource.name,
        annotationKey: "graphName",
        annotationValue: graphName.trim(),
      });

      // Refetch the data to update the UI
      devboxQuery.refetch();
      clusterQuery.refetch();
      deploymentQuery.refetch();
      cronjobQuery.refetch();
      bucketQuery.refetch();

      setIsDialogOpen(false);
      setSelectedResource(null);
      setGraphName("");
    } catch (error) {
      console.error("Failed to add resource to graph:", error);
      // You might want to show an error toast here
    }
  };

  const isLoading =
    devboxQuery.isLoading ||
    clusterQuery.isLoading ||
    deploymentQuery.isLoading ||
    cronjobQuery.isLoading ||
    bucketQuery.isLoading;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Manage Graph Nodes
        </h2>
        <p className="text-muted-foreground mt-2">
          Create new resources or add existing ones to your graph
        </p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New
          </TabsTrigger>
          <TabsTrigger value="existing" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Add Existing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {(Object.keys(RESOURCES) as ResourceType[]).map((resourceType) => {
              const Icon = resourceIcons[resourceType];
              return (
                <Card
                  key={resourceType}
                  className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-2 hover:border-primary/50"
                  onClick={() => {
                    if (resourceType === "devbox") {
                      openPanel(
                        "devbox-create",
                        <DevboxCreateView onComplete={() => {}} />
                      );
                    } else {
                      onCreateNode(resourceType);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg ${resourceColors[resourceType]} flex items-center justify-center text-white`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {resourceDisplayNames[resourceType]}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {resourceDescriptions[resourceType]}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="existing" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                Loading existing resources...
              </div>
            </div>
          ) : (
            <>
              <Tabs
                value={selectedExistingTab}
                onValueChange={setSelectedExistingTab}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="all">
                    All ({allResources.length})
                  </TabsTrigger>
                  {existingResourceTypes.map((type) => {
                    const count = allResources.filter(
                      (r) => r.type === type
                    ).length;
                    return (
                      <TabsTrigger key={type} value={type}>
                        {resourceDisplayNames[type]} ({count})
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <TabsContent value={selectedExistingTab} className="mt-4">
                  {filteredResources.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground">
                        No{" "}
                        {selectedExistingTab === "all"
                          ? ""
                          : resourceDisplayNames[
                              selectedExistingTab as ResourceType
                            ]}{" "}
                        resources found
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredResources.map((resource) => {
                        const Icon = resourceIcons[resource.type];
                        const hasGraphAnnotation =
                          resource.annotations?.graphName;

                        return (
                          <Card
                            key={`${resource.type}-${resource.name}`}
                            className={`transition-all hover:shadow-md ${
                              hasGraphAnnotation
                                ? "border-green-200 bg-green-50/50"
                                : "hover:scale-[1.01] cursor-pointer border-2 hover:border-primary/50"
                            }`}
                            onClick={() => handleResourceClick(resource)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-10 h-10 rounded-lg ${resourceColors[resource.type]} flex items-center justify-center text-white`}
                                >
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">
                                      {resource.name}
                                    </h4>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {resourceDisplayNames[resource.type]}
                                    </Badge>
                                    {hasGraphAnnotation && (
                                      <Badge
                                        variant="default"
                                        className="text-xs bg-green-500"
                                      >
                                        In Graph:{" "}
                                        {resource.annotations?.graphName}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Status: {resource.status}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Add to Graph Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Resource to Graph</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add <strong>{selectedResource?.name}</strong> (
              {resourceDisplayNames[selectedResource?.type as ResourceType]}) to
              a graph by specifying the graph name.
            </p>
            <div className="space-y-2">
              <label htmlFor="graph-name" className="text-sm font-medium">
                Graph Name
              </label>
              <Input
                id="graph-name"
                placeholder="Enter graph name (e.g., my-app-stack)"
                value={graphName}
                onChange={(e) => setGraphName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && graphName.trim()) {
                    handleAddToGraph();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddToGraph}
              disabled={!graphName.trim() || patchAnnotationMutation.isPending}
            >
              {patchAnnotationMutation.isPending ? "Adding..." : "Add to Graph"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="text-center pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Resources with graph annotations are already part of a graph
        </p>
      </div>
    </div>
  );
}
