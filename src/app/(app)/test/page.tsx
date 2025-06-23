"use client";

import { useQuery } from "@tanstack/react-query";
import {
  directDevboxListOptions,
  directClusterListOptions,
  directDeploymentListOptions,
  directCronJobListOptions,
  directObjectStorageBucketListOptions,
} from "@/lib/sealos/k8s/k8s-query";
import { useSealosStore } from "@/store/sealos-store";

export default function K8sTestPage() {
  const { currentUser } = useSealosStore();

  // Run all queries - must be called before any early returns to maintain hook order
  const devboxQuery = useQuery(directDevboxListOptions(currentUser));
  const clusterQuery = useQuery(directClusterListOptions(currentUser));
  const deploymentQuery = useQuery(directDeploymentListOptions(currentUser));
  const cronJobQuery = useQuery(directCronJobListOptions(currentUser));
  const bucketQuery = useQuery(directObjectStorageBucketListOptions(currentUser));

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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Kubernetes Cluster Testing</h1>
      <p className="text-gray-600 mb-8">
        Test various Kubernetes API endpoints and explore your cluster resources interactively.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Devbox */}
        <K8sQueryResult title="Devboxes" query={devboxQuery} />
        {/* Cluster */}
        <K8sQueryResult title="Clusters" query={clusterQuery} />
        {/* Deployment */}
        <K8sQueryResult title="Deployments" query={deploymentQuery} />
        {/* CronJob */}
        <K8sQueryResult title="CronJobs" query={cronJobQuery} />
        {/* ObjectStorageBucket */}
        <K8sQueryResult title="ObjectStorageBuckets" query={bucketQuery} />
      </div>
    </div>
  );
}

function K8sQueryResult({ title, query }: { title: string; query: any }) {
  return (
    <div className="border rounded-lg p-4 bg-background shadow">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {query.isLoading && <p className="text-blue-500">Loading...</p>}
      {query.isError && (
        <p className="text-red-500">Error: {query.error?.message || String(query.error)}</p>
      )}
      {query.isSuccess && (
        <pre className="overflow-x-auto text-xs bg-background p-2 rounded">
          {JSON.stringify(query.data, null, 2)}
        </pre>
      )}
    </div>
  );
}
