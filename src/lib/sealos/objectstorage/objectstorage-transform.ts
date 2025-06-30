import type { ObjectStorageNodeData } from "@/components/flow/node/objectstorage/objectstorage-node";
import type { ObjectStorageColumn } from "@/components/inventory/objectstorage/objectstorage-table-schema";
import { GRAPH_NAME_LABEL_KEY } from "@/lib/sealos/k8s/k8s-constant";

export function transformObjectStorageToTable(
  data: any
): ObjectStorageColumn[] {
  // Handle response structure: { code: 200, data: { list: [...] } }
  const responseData = data?.data || data;
  const buckets = responseData?.list;

  if (!(buckets && Array.isArray(buckets))) {
    return [];
  }

  return buckets.map((bucket: any) => {
    // Extract graph name from labels if available
    const graph = bucket.labels?.[GRAPH_NAME_LABEL_KEY] || "none";

    return {
      id: bucket.crName || bucket.name || "",
      name: bucket.name || "Unnamed",
      status: bucket.isComplete ? "Complete" : "Incomplete",
      type: bucket.policy || "private",
      size: "N/A",
      createdAt: "N/A", // Not provided in the response
      graph,
    };
  });
}

export function transformObjectStorageToNodes(
  data: any
): ObjectStorageNodeData[] {
  // Handle response structure: { code: 200, data: { list: [...] } }
  const responseData = data?.data || data;
  const buckets = responseData?.list;

  if (!(buckets && Array.isArray(buckets))) {
    return [];
  }

  return buckets.map((bucket: any) => ({
    id: bucket.crName || `objectstorage-${bucket.name}`,
    name: bucket.name || "Unnamed Bucket",
    crName: bucket.crName || "",
    policy: bucket.policy || "private",
    isComplete: bucket.isComplete,
    size: bucket.size,
    objects: bucket.objects,
    createdAt: bucket.createdAt,
  }));
}
