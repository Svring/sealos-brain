import { BUILTIN_RESOURCES } from "@/registry/dark/constants/k8s/k8s-builtin.constant";
import { CUSTOM_RESOURCES } from "@/registry/dark/constants/k8s/k8s-custom.constant";
import type {
	BuiltinResourceTarget,
	BuiltinResourceTypeTarget,
	CustomResourceTarget,
	CustomResourceTypeTarget,
} from "@/registry/dark/models/k8s/k8s.model";
import type { K8sResource } from "@/registry/dark/models/k8s/k8s-resource.model";

/**
 * Convert a resource type string to a resource type target
 * @param resourceType - The resource type (e.g., "deployment", "pod", "devbox")
 * @param name - Optional resource name
 * @param label - Optional label for filtering
 * @returns Resource type target for listing resources
 */
const fromTypeToTarget = (
	resourceType: string,
	name?: string,
	label?: string,
): BuiltinResourceTypeTarget | CustomResourceTypeTarget => {
	const lowerResourceType = resourceType.toLowerCase();

	// Check builtin resources first
	const builtinConfig = BUILTIN_RESOURCES[lowerResourceType];
	if (builtinConfig) {
		return {
			type: "builtin",
			resourceType: builtinConfig.resourceType,
			name: name,
			label,
		};
	}

	// Check custom resources
	const customConfig = CUSTOM_RESOURCES[lowerResourceType];
	if (customConfig) {
		return {
			type: "custom",
			resourceType: customConfig.resourceType,
			name: name,
			label,
		};
	}

	throw new Error(`Unknown resource type: ${resourceType}`);
};

/**
 * Convert a Kubernetes resource to a resource target
 * @param resource - The Kubernetes resource object
 * @returns Resource target for specific resource operations
 */
const fromResourceToTarget = (
	resource: K8sResource,
): BuiltinResourceTarget | CustomResourceTarget => {
	if (!resource.metadata.name) {
		throw new Error("Resource name is required");
	}

	if (!resource.kind) {
		throw new Error("Resource kind is required");
	}

	const lowerKind = resource.kind.toLowerCase();

	// Check builtin resources first
	const builtinConfig = BUILTIN_RESOURCES[lowerKind];
	if (builtinConfig) {
		return {
			type: "builtin",
			resourceType: builtinConfig.resourceType,
			name: resource.metadata.name,
		};
	}

	// Check custom resources
	const customConfig = CUSTOM_RESOURCES[lowerKind];
	if (customConfig) {
		return {
			type: "custom",
			resourceType: customConfig.resourceType,
			name: resource.metadata.name,
		};
	}

	throw new Error(`Unknown resource kind: ${resource.kind}`);
};

/**
 * Convert an unknown object to a resource target if possible
 * @param object - The object expected to have name and resourceType
 * @returns Resource target for specific resource operations
 */
const fromObjectToTarget = (
	object: unknown,
): BuiltinResourceTarget | CustomResourceTarget => {
	if (typeof object !== "object" || object === null) {
		throw new Error("Object must be a non-null object");
	}

	// Use safe property extraction without `any`
	const resourceType =
		"resourceType" in object &&
		typeof (object as { resourceType: unknown }).resourceType === "string"
			? (object as { resourceType: string }).resourceType
			: undefined;
	const name =
		"name" in object && typeof (object as { name: unknown }).name === "string"
			? (object as { name: string }).name
			: undefined;

	if (typeof resourceType !== "string") {
		throw new Error("Object must have a string resourceType property");
	}
	if (typeof name !== "string") {
		throw new Error("Object must have a string name property");
	}

	const lowerResourceType = resourceType.toLowerCase();

	// Check builtin resources first
	const builtinConfig = BUILTIN_RESOURCES[lowerResourceType];
	if (builtinConfig) {
		return {
			type: "builtin",
			resourceType: builtinConfig.resourceType,
			name: name,
		};
	}

	// Check custom resources
	const customConfig = CUSTOM_RESOURCES[lowerResourceType];
	if (customConfig) {
		return {
			type: "custom",
			resourceType: customConfig.resourceType,
			name: name,
		};
	}

	throw new Error(`Unknown resource type: ${resourceType}`);
};

export const k8sParser = {
	fromTypeToTarget,
	fromResourceToTarget,
	fromObjectToTarget,
};
