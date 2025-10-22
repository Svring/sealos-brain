"use server";

import type { Operation } from "fast-json-patch";
import _ from "lodash";
import {
	applyResource as applyResourceMutation,
	deleteBuiltinResource,
	deleteCustomResource,
	patchBuiltinResource,
	patchBuiltinResourceMetadata,
	patchCustomResource,
	patchCustomResourceMetadata,
	removeBuiltinResourceMetadata,
	removeCustomResourceMetadata,
	strategicMergePatchBuiltinResource,
	strategicMergePatchCustomResource,
	upsertBuiltinResource,
	upsertCustomResource,
} from "@/registry/dark/lib/k8s/k8s-mutation.api";
import {
	getBuiltinResource,
	getCustomResource,
	listBuiltinResources,
	listCustomResources,
} from "@/registry/dark/lib/k8s/k8s-query.api";
import type {
	BuiltinResourceTarget,
	BuiltinResourceTypeTarget,
	CustomResourceTarget,
	CustomResourceTypeTarget,
	ResourceTarget,
	ResourceTypeTarget,
} from "@/registry/dark/models/k8s/k8s.model";
import type { K8sContext } from "@/registry/dark/models/k8s/k8s-context.model";
import type { K8sResource } from "@/registry/dark/models/k8s/k8s-resource.model";
import { K8sResourceListSchema } from "@/registry/dark/models/k8s/k8s-resource.model";

// ============================================================================
// Resource Selection Functions
// ============================================================================

/**
 * Select specific resources based on provided resource type targets.
 * This function allows selecting only the resources specified in the targets array.
 * Returns a flattened array of all K8sResource objects from all targets.
 *
 * @example
 * ```typescript
 * // Select specific builtin and custom resources
 * const selectedResources = await selectResources(context, [
 *   { type: "builtin", resourceType: "pod", label: "app", name: "my-app" },
 *   { type: "builtin", resourceType: "service", label: "app", name: "my-app" },
 *   { type: "custom", resourceType: "devbox", label: "app", name: "my-app" },
 *   { type: "custom", resourceType: "instance", label: "app", name: "my-app" }
 * ]);
 * ```
 */
export const selectResources = async (
	context: K8sContext,
	targets: ResourceTypeTarget[],
): Promise<K8sResource[]> => {
	// Execute all resource queries in parallel
	const resourcePromises = targets.map((target) =>
		listResources(context, target),
	);

	// Wait for all promises to complete
	const results = await Promise.all(resourcePromises);

	// Flatten all resources into a single array
	const allResources = _.flatMap(results, (result) => {
		if (result?.items) {
			return K8sResourceListSchema.parse(result).items;
		}
		return [];
	});

	return allResources;
};

// ============================================================================
// Unified Kubernetes Service API Functions
// ============================================================================

/**
 * List resources automatically determining if they are builtin or custom.
 *
 * @example
 * ```typescript
 * // List custom resources
 * const instances = await listResources(context, {
 *   type: "custom",
 *   resourceType: "instance",
 *   label: "app",
 *   name: "my-app"
 * });
 *
 * // List builtin resources
 * const pods = await listResources(context, {
 *   type: "builtin",
 *   resourceType: "pod",
 *   label: "app",
 *   name: "my-app"
 * });
 * ```
 */
export const listResources = async (
	context: K8sContext,
	target: ResourceTypeTarget,
) => {
	if (target.type === "custom") {
		return await listCustomResources(
			context,
			target as CustomResourceTypeTarget,
		);
	} else {
		return await listBuiltinResources(
			context,
			target as BuiltinResourceTypeTarget,
		);
	}
};

/**
 * Get a specific resource automatically determining if it's builtin or custom.
 *
 * @example
 * ```typescript
 * // Get custom resource
 * const instance = await getResource(context, {
 *   type: "custom",
 *   resourceType: "instance",
 *   name: "my-instance"
 * });
 *
 * // Get builtin resource
 * const pod = await getResource(context, {
 *   type: "builtin",
 *   resourceType: "pod",
 *   name: "my-pod"
 * });
 * ```
 */
export const getResource = async (
	context: K8sContext,
	target: ResourceTarget,
) => {
	if (target.type === "custom") {
		return await getCustomResource(context, target as CustomResourceTarget);
	} else {
		return await getBuiltinResource(context, target as BuiltinResourceTarget);
	}
};

/**
 * Delete a resource automatically determining if it's builtin or custom.
 *
 * @example
 * ```typescript
 * // Delete custom resource
 * await deleteResource(context, {
 *   type: "custom",
 *   resourceType: "instance",
 *   name: "my-instance"
 * });
 *
 * // Delete builtin resource
 * await deleteResource(context, {
 *   type: "builtin",
 *   resourceType: "pod",
 *   name: "my-pod"
 * });
 * ```
 */
export const deleteResource = async (
	context: K8sContext,
	target: ResourceTarget,
) => {
	if (target.type === "custom") {
		return await deleteCustomResource(context, target as CustomResourceTarget);
	} else {
		return await deleteBuiltinResource(
			context,
			target as BuiltinResourceTarget,
		);
	}
};

/**
 * Upsert (create or update) a resource automatically determining if it's builtin or custom.
 *
 * @example
 * ```typescript
 * // Upsert custom resource
 * const instance = await upsertResource(context,
 *   { type: "custom", resourceType: "instance", name: "my-instance" },
 *   { metadata: { name: "my-instance" }, spec: { ... } }
 * );
 *
 * // Upsert builtin resource
 * const pod = await upsertResource(context,
 *   { type: "builtin", resourceType: "pod", name: "my-pod" },
 *   { metadata: { name: "my-pod" }, spec: { ... } }
 * );
 * ```
 */
export const upsertResource = async (
	context: K8sContext,
	target: ResourceTarget,
	resourceBody: Record<string, unknown>,
) => {
	if (target.type === "custom") {
		return await upsertCustomResource(
			context,
			target as CustomResourceTarget,
			resourceBody,
		);
	} else {
		return await upsertBuiltinResource(
			context,
			target as BuiltinResourceTarget,
			resourceBody,
		);
	}
};

/**
 * Patch resource metadata (annotations or labels) automatically determining if it's builtin or custom.
 *
 * @example
 * ```typescript
 * // Patch custom resource metadata
 * await patchResourceMetadata(context,
 *   { type: "custom", resourceType: "instance", name: "my-instance" },
 *   "labels", "app", "my-app"
 * );
 *
 * // Patch builtin resource metadata
 * await patchResourceMetadata(context,
 *   { type: "builtin", resourceType: "pod", name: "my-pod" },
 *   "annotations", "description", "My pod"
 * );
 * ```
 */
export const patchResourceMetadata = async (
	context: K8sContext,
	target: ResourceTarget,
	metadataType: "annotations" | "labels",
	key: string,
	value: string,
) => {
	if (target.type === "custom") {
		return await patchCustomResourceMetadata(
			context,
			target as CustomResourceTarget,
			metadataType,
			key,
			value,
		);
	} else {
		return await patchBuiltinResourceMetadata(
			context,
			target as BuiltinResourceTarget,
			metadataType,
			key,
			value,
		);
	}
};

/**
 * Remove resource metadata (annotations or labels) automatically determining if it's builtin or custom.
 *
 * @example
 * ```typescript
 * // Remove custom resource metadata
 * await removeResourceMetadata(context,
 *   { type: "custom", resourceType: "instance", name: "my-instance" },
 *   "labels", "app"
 * );
 *
 * // Remove builtin resource metadata
 * await removeResourceMetadata(context,
 *   { type: "builtin", resourceType: "pod", name: "my-pod" },
 *   "annotations", "description"
 * );
 * ```
 */
export const removeResourceMetadata = async (
	context: K8sContext,
	target: ResourceTarget,
	metadataType: "annotations" | "labels",
	key: string,
) => {
	if (target.type === "custom") {
		return await removeCustomResourceMetadata(
			context,
			target as CustomResourceTarget,
			metadataType,
			key,
		);
	} else {
		return await removeBuiltinResourceMetadata(
			context,
			target as BuiltinResourceTarget,
			metadataType,
			key,
		);
	}
};

/**
 * Patch a resource with arbitrary patch operations automatically determining if it's builtin or custom.
 *
 * @example
 * ```typescript
 * // Patch custom resource
 * await patchResource(context,
 *   { type: "custom", resourceType: "instance", name: "my-instance" },
 *   [{ op: "replace", path: "/spec/replicas", value: 3 }]
 * );
 *
 * // Patch builtin resource
 * await patchResource(context,
 *   { type: "builtin", resourceType: "deployment", name: "my-deployment" },
 *   [{ op: "replace", path: "/spec/replicas", value: 5 }]
 * );
 * ```
 */
export const patchResource = async (
	context: K8sContext,
	target: ResourceTarget,
	patchBody: Operation[],
) => {
	if (target.type === "custom") {
		return await patchCustomResource(
			context,
			target as CustomResourceTarget,
			patchBody,
		);
	} else {
		return await patchBuiltinResource(
			context,
			target as BuiltinResourceTarget,
			patchBody,
		);
	}
};

/**
 * Strategic merge patch for a resource automatically determining if it's builtin or custom.
 * This allows partial updates without needing to get the full resource first.
 *
 * @example
 * ```typescript
 * // Strategic merge patch custom resource
 * await strategicMergePatchResource(context,
 *   { type: "custom", resourceType: "instance", name: "my-instance" },
 *   { spec: { replicas: 3 } }
 * );
 *
 * // Strategic merge patch builtin resource
 * await strategicMergePatchResource(context,
 *   { type: "builtin", resourceType: "deployment", name: "my-deployment" },
 *   { spec: { replicas: 5 } }
 * );
 * ```
 */
export const strategicMergePatchResource = async (
	context: K8sContext,
	target: ResourceTarget,
	patchBody: Record<string, unknown>,
) => {
	if (target.type === "custom") {
		return await strategicMergePatchCustomResource(
			context,
			target as CustomResourceTarget,
			patchBody,
		);
	} else {
		return await strategicMergePatchBuiltinResource(
			context,
			target as BuiltinResourceTarget,
			patchBody,
		);
	}
};

/**
 * Apply resource content (JSON or YAML) automatically determining if it's builtin or custom.
 * This is a wrapper around the mutation API's applyResource function.
 *
 * @example
 * ```typescript
 * // Apply YAML content with target
 * const result = await applyResource(context,
 *   { type: "custom", resourceType: "instance", name: "my-instance" },
 *   yamlContent
 * );
 * ```
 */
export const applyResource = async (
	context: K8sContext,
	target: ResourceTarget,
	resourceContent: string | Record<string, unknown>,
) => {
	return await applyResourceMutation(context, target, resourceContent);
};
