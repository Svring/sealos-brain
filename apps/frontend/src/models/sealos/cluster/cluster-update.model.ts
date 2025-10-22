import { z } from "zod";
import {
	CLUSTER_CPU_OPTIONS,
	CLUSTER_MEMORY_OPTIONS,
	CLUSTER_REPLICAS_OPTIONS,
	CLUSTER_STORAGE_OPTIONS,
} from "@/constants/cluster/cluster-resource.constant";
import { createNumberUnionSchema } from "@/lib/utils";
import { NameSchema } from "@/mvvm/k8s/models/k8s-resource.model";

// Cluster resource update schema (all fields optional for updates)
export const ClusterResourceUpdateSchema = z.object({
	replicas: createNumberUnionSchema(CLUSTER_REPLICAS_OPTIONS).optional(),
	cpu: createNumberUnionSchema(CLUSTER_CPU_OPTIONS).optional(),
	memory: createNumberUnionSchema(CLUSTER_MEMORY_OPTIONS).optional(),
	storage: createNumberUnionSchema(CLUSTER_STORAGE_OPTIONS).optional(),
});

// Update form schema (all fields optional for partial updates)
export const clusterUpdateSchema = z.object({
	name: NameSchema,
	resource: ClusterResourceUpdateSchema.optional(),
});

export type ClusterUpdateData = z.infer<typeof clusterUpdateSchema>;
