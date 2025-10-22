import { z } from "zod";
import {
	CLUSTER_CPU_OPTIONS,
	CLUSTER_MEMORY_OPTIONS,
	CLUSTER_REPLICAS_OPTIONS,
	CLUSTER_STORAGE_OPTIONS,
} from "@/constants/cluster/cluster-resource.constant";
import { CLUSTER_AVAILABLE_TYPES } from "@/constants/cluster/cluster-type.constant";
import { createNumberUnionSchema, nanoid } from "@/lib/utils";
import { NameSchema } from "@/mvvm/k8s/models/k8s-resource.model";

// Component schemas
export const ClusterTypeSchema = z.enum(CLUSTER_AVAILABLE_TYPES);

export const ClusterVersionSchema = z
	.string()
	.min(1, "Cluster version is required");

export const ClusterResourceSchema = z.object({
	replicas: createNumberUnionSchema(CLUSTER_REPLICAS_OPTIONS),
	cpu: createNumberUnionSchema(CLUSTER_CPU_OPTIONS),
	memory: createNumberUnionSchema(CLUSTER_MEMORY_OPTIONS),
	storage: createNumberUnionSchema(CLUSTER_STORAGE_OPTIONS),
});

export const ClusterTerminationPolicySchema = z.enum(["Delete", "WipeOut"]);

// Main cluster create form schema
export const clusterCreateSchema = z.object({
	name: NameSchema.default(() => `cluster-${nanoid()}`),
	type: ClusterTypeSchema.default("postgresql"),
	version: ClusterVersionSchema.default("postgresql-14.8.0"),
	resource: ClusterResourceSchema.default({
		replicas: 1,
		cpu: 0.5,
		memory: 0.5,
		storage: 1,
	}),
	terminationPolicy: ClusterTerminationPolicySchema.default("Delete"),
});

// Export types
export type ClusterCreateData = z.infer<typeof clusterCreateSchema>;
