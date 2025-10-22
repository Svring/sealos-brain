/**
 * Client-side Kubernetes utilities
 *
 * This file contains utility functions that can be used on the client side
 * for Kubernetes-related operations that don't require server-side execution.
 */

/**
 * Helper to add missing apiVersion and kind to builtin resource lists.
 * This ensures all resources have the proper apiVersion and kind fields.
 */
export async function addMissingFields<T extends Record<string, unknown>>(
	items: T[],
	apiVersion: string,
	kind: string,
): Promise<{
	apiVersion: string;
	kind: string;
	items: T[];
}> {
	await new Promise((resolve) => setTimeout(resolve, 0));
	return {
		apiVersion: `${apiVersion}List`,
		kind: `${kind}List`,
		items: items.map((item) => ({
			apiVersion,
			kind,
			...item,
		})),
	};
}

/**
 * Helper function to escape slashes in keys for JSON Patch paths
 */
export function escapeSlash(key: string): string {
	return key.replace(/\//g, "~1");
}

/**
 * Convert Kubernetes resource quantity string to universal units
 * @param quantity - Kubernetes resource quantity string (e.g., "64", "20200m", "96Gi", "25828Mi")
 * @param resourceType - Type of resource ("cpu", "memory", "storage", or "other")
 * @returns Converted numeric value in universal units (cores for CPU, GB for memory/storage, raw number for others)
 */
export function standardizeUnit(
	quantity: string,
	resourceType: "cpu" | "memory" | "storage" | "other" = "other",
): number {
	if (!quantity || typeof quantity !== "string") {
		return 0;
	}

	// Handle CPU resources
	if (resourceType === "cpu") {
		if (quantity.endsWith("m")) {
			// Convert millicores to cores (e.g., "20200m" -> 20.2)
			return parseFloat(quantity.slice(0, -1)) / 1000;
		} else {
			// Direct cores (e.g., "64" -> 64)
			return parseFloat(quantity);
		}
	}

	// Handle memory and storage resources
	if (resourceType === "memory" || resourceType === "storage") {
		if (quantity.endsWith("Gi")) {
			// Convert GiB to GB (e.g., "96Gi" -> 96)
			return parseFloat(quantity.slice(0, -2));
		} else if (quantity.endsWith("Mi")) {
			// Convert MiB to GB (e.g., "25828Mi" -> 25.828)
			return parseFloat(quantity.slice(0, -2)) / 1024;
		} else if (quantity.endsWith("Ki")) {
			// Convert KiB to GB (e.g., "1048576Ki" -> 1)
			return parseFloat(quantity.slice(0, -2)) / (1024 * 1024);
		} else if (quantity.endsWith("G")) {
			// Direct GB (e.g., "100G" -> 100)
			return parseFloat(quantity.slice(0, -1));
		} else if (quantity.endsWith("M")) {
			// Convert MB to GB (e.g., "1000M" -> 1)
			return parseFloat(quantity.slice(0, -1)) / 1000;
		} else if (quantity.endsWith("K")) {
			// Convert KB to GB (e.g., "1000000K" -> 0.001)
			return parseFloat(quantity.slice(0, -1)) / (1000 * 1000);
		} else {
			// Assume bytes and convert to GB
			return parseFloat(quantity) / (1024 * 1024 * 1024);
		}
	}

	// Handle other resources (counts, custom resources, etc.)
	return parseFloat(quantity) || 0;
}
