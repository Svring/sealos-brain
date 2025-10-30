import { NameSchema } from "@sealos-brain/k8s/shared/models";
import { z } from "zod";
import {
	CLUSTER_CPU_OPTIONS,
	CLUSTER_MEMORY_OPTIONS,
	CLUSTER_REPLICAS_OPTIONS,
	CLUSTER_STORAGE_OPTIONS,
} from "../constants/cluster-resource.constant";
import { CLUSTER_AVAILABLE_TYPES } from "../constants/cluster-type.constant";

// Component schemas
export const ClusterTypeSchema = z.enum(CLUSTER_AVAILABLE_TYPES);

export const ClusterVersionSchema = z
	.string()
	.min(1, "Cluster version is required");

export const ClusterCreateQuotaSchema = z.object({
	replicas: z.literal(CLUSTER_REPLICAS_OPTIONS),
	cpu: z.literal(CLUSTER_CPU_OPTIONS),
	memory: z.literal(CLUSTER_MEMORY_OPTIONS),
	storage: z.literal(CLUSTER_STORAGE_OPTIONS),
});

export const ClusterTerminationPolicySchema = z.enum(["Delete", "WipeOut"]);

// Main cluster create form schema
export const clusterCreateSchema = z.object({
	name: NameSchema,
	type: ClusterTypeSchema.default("postgresql"),
	version: ClusterVersionSchema.default("postgresql-14.8.0"),
	quota: ClusterCreateQuotaSchema.default({
		replicas: 1,
		cpu: 0.5,
		memory: 0.5,
		storage: 1,
	}),
	terminationPolicy: ClusterTerminationPolicySchema.default("Delete"),
});

// Export types
export type ClusterCreate = z.infer<typeof clusterCreateSchema>;
