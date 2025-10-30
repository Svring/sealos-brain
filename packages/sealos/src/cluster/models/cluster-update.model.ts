import { NameSchema } from "@sealos-brain/k8s/shared/models";
import { z } from "zod";
import {
	CLUSTER_CPU_OPTIONS,
	CLUSTER_MEMORY_OPTIONS,
	CLUSTER_REPLICAS_OPTIONS,
	CLUSTER_STORAGE_OPTIONS,
} from "../constants/cluster-resource.constant";

// Cluster resource update schema (all fields optional for updates)
export const ClusterResourceUpdateSchema = z.object({
	replicas: z.literal(CLUSTER_REPLICAS_OPTIONS).optional(),
	cpu: z.literal(CLUSTER_CPU_OPTIONS).optional(),
	memory: z.literal(CLUSTER_MEMORY_OPTIONS).optional(),
	storage: z.literal(CLUSTER_STORAGE_OPTIONS).optional(),
});

// Update form schema (all fields optional for partial updates)
export const clusterUpdateSchema = z.object({
	name: NameSchema,
	resource: ClusterResourceUpdateSchema.optional(),
});

export type ClusterUpdate = z.infer<typeof clusterUpdateSchema>;
