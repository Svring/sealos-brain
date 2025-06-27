"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { directResourceListOptions } from "@/lib/sealos/k8s/k8s-query";
import { usePatchResourceAnnotationMutation } from "@/lib/sealos/k8s/k8s-mutation";
import { createDevboxFromTemplateMutation } from "@/lib/sealos/devbox/devbox-mutation";
import { generateDevboxFormFromTemplate } from "@/lib/sealos/devbox/devbox-utils";
import { DevboxFormValues } from "@/components/flow/node/devbox/create/schema/devbox-create-schema";
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

// Force dynamic rendering since the layout uses headers()
export const dynamic = "force-dynamic";

export default function K8sTestPage() {
  const { currentUser, regionUrl } = useSealosStore();
  const queryClient = useQueryClient();

  // Annotation management state
  const [selectedDevboxName, setSelectedDevboxName] = useState("");
  const [annotationKey, setAnnotationKey] = useState("");
  const [annotationValue, setAnnotationValue] = useState("");

  // Devbox form generation state
  const [templateName, setTemplateName] = useState("");
  const [generatedForm, setGeneratedForm] = useState<DevboxFormValues | null>(
    null
  );

  // Standalone function test state
  const [standaloneTemplateName, setStandaloneTemplateName] = useState("");
  const [standaloneForm, setStandaloneForm] = useState<DevboxFormValues | null>(
    null
  );
  const [standaloneLoading, setStandaloneLoading] = useState(false);
  const [standaloneError, setStandaloneError] = useState<string | null>(null);
  const [customOptions, setCustomOptions] = useState({
    devboxName: "",
    cpu: 1000,
    memory: 2048,
    enablePublicDomain: true,
  });

  // Run all queries using the new generic function
  const devboxQuery = useQuery(
    directResourceListOptions(currentUser, "devbox")
  );
  const clusterQuery = useQuery(
    directResourceListOptions(currentUser, "cluster")
  );
  const deploymentQuery = useQuery(
    directResourceListOptions(currentUser, "deployment")
  );
  const cronJobQuery = useQuery(
    directResourceListOptions(currentUser, "cronjob")
  );
  const bucketQuery = useQuery(
    directResourceListOptions(currentUser, "objectstoragebucket")
  );

  // Add annotation mutation using the new generic hook
  const addAnnotationMutation = usePatchResourceAnnotationMutation();

  // Devbox form generation mutation
  const generateFormMutation = createDevboxFromTemplateMutation(
    currentUser,
    regionUrl
  );

  const handleStandaloneGeneration = async () => {
    if (!currentUser || !regionUrl || !standaloneTemplateName) return;

    setStandaloneLoading(true);
    setStandaloneError(null);
    setStandaloneForm(null);

    try {
      const options = {
        devboxName: customOptions.devboxName || undefined,
        cpu: customOptions.cpu,
        memory: customOptions.memory,
        enablePublicDomain: customOptions.enablePublicDomain,
      };

      const result = await generateDevboxFormFromTemplate(
        standaloneTemplateName,
        currentUser,
        regionUrl,
        options
      );

      setStandaloneForm(result);
    } catch (error: any) {
      setStandaloneError(error.message || "Unknown error occurred");
    } finally {
      setStandaloneLoading(false);
    }
  };

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
      addAnnotationMutation.mutate(
        {
          currentUser,
          resourceType: "devbox",
          resourceName: selectedDevboxName,
          annotationKey,
          annotationValue,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["k8s"] });
            setAnnotationKey("");
            setAnnotationValue("");
          },
        }
      );
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resources">Resource Lists</TabsTrigger>
          <TabsTrigger value="annotations">Devbox Annotations</TabsTrigger>
          <TabsTrigger value="devboxForm">Devbox Form</TabsTrigger>
          <TabsTrigger value="standalone">Standalone Function</TabsTrigger>
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
                      !annotationKey ||
                      !annotationValue ||
                      !selectedDevboxName ||
                      addAnnotationMutation.isPending
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
                      ✗ Error:{" "}
                      {addAnnotationMutation.error?.message || "Unknown error"}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devboxForm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Devbox Form from Template</CardTitle>
              <CardDescription>
                Test the createDevboxFormFromTemplateMutation function by
                generating a complete devbox form from just a template name.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., 1.22, node-18, ubuntu-22.04"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Common templates: 1.22 (Go), node-18, ubuntu-22.04,
                  python-3.11
                </p>
              </div>

              <Button
                onClick={async () => {
                  try {
                    const result =
                      await generateFormMutation.mutateAsync(templateName);
                    setGeneratedForm(result);
                  } catch (error) {
                    console.error("Form generation failed:", error);
                  }
                }}
                disabled={!templateName || generateFormMutation.isPending}
              >
                {generateFormMutation.isPending
                  ? "Generating..."
                  : "Generate Devbox Form"}
              </Button>

              {generateFormMutation.isSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 font-medium">
                      ✓ Form Generated Successfully!
                    </span>
                  </div>
                  <div className="text-sm text-green-700">
                    Generated form for template:{" "}
                    <code className="bg-green-100 px-1 rounded">
                      {templateName}
                    </code>
                  </div>
                </div>
              )}

              {generateFormMutation.isError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-600 font-medium">
                      ✗ Generation Failed
                    </span>
                  </div>
                  <div className="text-sm text-red-700">
                    {generateFormMutation.error?.message ||
                      "Unknown error occurred"}
                  </div>
                </div>
              )}

              {generatedForm && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Generated Devbox Form
                    </CardTitle>
                    <CardDescription>
                      This form can be used directly with the createDevbox API
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Name:</span>{" "}
                          {generatedForm.name}
                        </div>
                        <div>
                          <span className="font-medium">CPU:</span>{" "}
                          {generatedForm.cpu}m
                        </div>
                        <div>
                          <span className="font-medium">Memory:</span>{" "}
                          {generatedForm.memory}MB
                        </div>
                        <div>
                          <span className="font-medium">Networks:</span>{" "}
                          {generatedForm.networks?.length || 0}
                        </div>
                      </div>

                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="mt-2">
                            <ChevronRight className="h-4 w-4 mr-1" />
                            View Full Form JSON
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto max-h-96 overflow-y-auto">
                            {JSON.stringify(generatedForm, null, 2)}
                          </pre>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standalone" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Test Standalone generateDevboxFormFromTemplate
              </CardTitle>
              <CardDescription>
                Test the standalone utility function with custom options. This
                function doesn't require React Query.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="standaloneTemplateName">Template Name</Label>
                <Input
                  id="standaloneTemplateName"
                  value={standaloneTemplateName}
                  onChange={(e) => setStandaloneTemplateName(e.target.value)}
                  placeholder="e.g., 1.22, node-18, ubuntu-22.04"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customDevboxName">
                    Custom Devbox Name (optional)
                  </Label>
                  <Input
                    id="customDevboxName"
                    value={customOptions.devboxName}
                    onChange={(e) =>
                      setCustomOptions({
                        ...customOptions,
                        devboxName: e.target.value,
                      })
                    }
                    placeholder="Leave empty for auto-generated"
                  />
                </div>
                <div>
                  <Label htmlFor="enablePublicDomain">Public Domain</Label>
                  <select
                    id="enablePublicDomain"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={customOptions.enablePublicDomain.toString()}
                    onChange={(e) =>
                      setCustomOptions({
                        ...customOptions,
                        enablePublicDomain: e.target.value === "true",
                      })
                    }
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customCpu">CPU (millicores)</Label>
                  <Input
                    id="customCpu"
                    type="number"
                    value={customOptions.cpu}
                    onChange={(e) =>
                      setCustomOptions({
                        ...customOptions,
                        cpu: parseInt(e.target.value) || 1000,
                      })
                    }
                    min="1000"
                    step="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="customMemory">Memory (MB)</Label>
                  <Input
                    id="customMemory"
                    type="number"
                    value={customOptions.memory}
                    onChange={(e) =>
                      setCustomOptions({
                        ...customOptions,
                        memory: parseInt(e.target.value) || 2048,
                      })
                    }
                    min="2048"
                    step="1024"
                  />
                </div>
              </div>

              <Button
                onClick={handleStandaloneGeneration}
                disabled={!standaloneTemplateName || standaloneLoading}
              >
                {standaloneLoading
                  ? "Generating..."
                  : "Generate with Custom Options"}
              </Button>

              {standaloneError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-600 font-medium">
                      ✗ Generation Failed
                    </span>
                  </div>
                  <div className="text-sm text-red-700">{standaloneError}</div>
                </div>
              )}

              {standaloneForm && (
                <div className="mt-4 space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600 font-medium">
                        ✓ Form Generated Successfully!
                      </span>
                    </div>
                    <div className="text-sm text-green-700">
                      Generated form for template:{" "}
                      <code className="bg-green-100 px-1 rounded">
                        {standaloneTemplateName}
                      </code>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Generated Devbox Form (Standalone)
                      </CardTitle>
                      <CardDescription>
                        Generated using the standalone utility function
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Name:</span>{" "}
                            {standaloneForm.name}
                          </div>
                          <div>
                            <span className="font-medium">CPU:</span>{" "}
                            {standaloneForm.cpu}m
                          </div>
                          <div>
                            <span className="font-medium">Memory:</span>{" "}
                            {standaloneForm.memory}MB
                          </div>
                          <div>
                            <span className="font-medium">Networks:</span>{" "}
                            {standaloneForm.networks?.length || 0}
                          </div>
                          <div>
                            <span className="font-medium">Image:</span>
                            <code className="text-xs ml-1 bg-muted px-1 rounded">
                              {standaloneForm.image?.split("/").pop() || "N/A"}
                            </code>
                          </div>
                          <div>
                            <span className="font-medium">Public Domains:</span>
                            {standaloneForm.networks?.filter(
                              (n) => n.openPublicDomain
                            ).length || 0}
                          </div>
                        </div>

                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="mt-2">
                              <ChevronRight className="h-4 w-4 mr-1" />
                              View Full Form JSON
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto max-h-96 overflow-y-auto">
                              {JSON.stringify(standaloneForm, null, 2)}
                            </pre>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
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
