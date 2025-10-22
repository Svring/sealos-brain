import { z } from "zod";

export const BuiltinResourceConfigSchema = z.object({
	type: z.literal("builtin"),
	resourceType: z.enum([
		"deployment",
		"service",
		"ingress",
		"statefulset",
		"daemonset",
		"configmap",
		"secret",
		"pod",
		"pvc",
		"hpa",
		"role",
		"rolebinding",
		"serviceaccount",
		"job",
		"cronjob",
		"resourcequota",
		"event",
	]),
	apiVersion: z.string(),
	kind: z.string(),
	listMethod: z.string(),
	getMethod: z.string(),
	createMethod: z.string(),
	deleteMethod: z.string(),
	patchMethod: z.string(),
	replaceMethod: z.string(),
	deleteCollectionMethod: z.string().optional(),
	apiClient: z.string(),
});

export const BuiltinResourceTargetSchema = z.object({
	type: z.literal("builtin"),
	resourceType: z.enum([
		"deployment",
		"service",
		"ingress",
		"statefulset",
		"daemonset",
		"configmap",
		"secret",
		"pod",
		"pvc",
		"hpa",
		"role",
		"rolebinding",
		"serviceaccount",
		"job",
		"cronjob",
		"resourcequota",
		"event",
	]),
	name: z.string(),
});

export const BuiltinResourceTypeTargetSchema = z
	.object({
		type: z.literal("builtin"),
		resourceType: z.string(),
		name: z.string().optional(),
		label: z.string().optional(),
	})
	.refine(
		(data) => {
			// If label is present, name must also be provided
			if (data.label && data.label !== "") {
				return data.name !== undefined && data.name !== "";
			}
			return true;
		},
		{
			message: "If label is provided, name must also be provided",
			path: ["name"],
		},
	);

// Derived types from schemas
export type BuiltinResourceConfig = z.infer<typeof BuiltinResourceConfigSchema>;
export type BuiltinResourceTarget = z.infer<typeof BuiltinResourceTargetSchema>;
export type BuiltinResourceTypeTarget = z.infer<
	typeof BuiltinResourceTypeTargetSchema
>;
