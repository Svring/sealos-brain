import type { Env } from "@/mvvm/k8s/models/k8s-resource.model";
import type { ResourceObject } from "@/mvvm/resource/models/resource-object.model";
import type { ResourceReliances } from "@/mvvm/resource/models/resource-reliance.model";

/**
 * Infers resource dependencies based on environment variables
 * @param resourceObjects Array of resource objects to analyze
 * @returns Object containing resource dependencies grouped by kind and name
 */
export function inferRelianceFromEnv(
	resourceObjects: ResourceObject[],
): ResourceReliances {
	const result: ResourceReliances = {};

	// console.log("resourceObjects", resourceObjects);

	// Filter owner resources (deployment, statefulset, and devbox)
	const ownerResources = resourceObjects.filter(
		(resource) =>
			resource.resourceType.toLowerCase() === "deployment" ||
			resource.resourceType.toLowerCase() === "statefulset" ||
			resource.resourceType.toLowerCase() === "devbox",
	);

	// console.log("ownerResources", ownerResources);

	// All resources can be dependencies (including other deployments/statefulsets/devboxes)
	const dependencyResources = resourceObjects;

	for (const ownerResource of ownerResources) {
		const ownerKind = ownerResource.resourceType.toLowerCase();
		const ownerName = ownerResource.name;

		// Initialize result structure
		if (!result[ownerKind]) {
			result[ownerKind] = {};
		}
		result[ownerKind][ownerName] = [];

		// Extract env values and keys
		const envValues: string[] = [];
		const envKeys: string[] = [];
		if (ownerResource.env) {
			for (const envVar of ownerResource.env as Env[]) {
				// Add the key to check
				envKeys.push(envVar.name);

				if (envVar.value) {
					// Direct value environment variable
					envValues.push(envVar.value);
				} else if (envVar.valueFrom?.secretKeyRef) {
					// Secret reference environment variable
					envValues.push(envVar.valueFrom.secretKeyRef.name);
				}
			}
		}

		// Match env values and keys against dependency resource names
		const allEnvFields = [...envValues, ...envKeys];
		for (const envField of allEnvFields) {
			let bestMatch: ResourceObject | null = null;
			let bestMatchLength = 0;

			for (const depResource of dependencyResources) {
				const depName = depResource.name;

				// Skip self-reference (a resource cannot depend on itself)
				if (
					depResource.name === ownerName &&
					depResource.resourceType.toLowerCase() === ownerKind
				) {
					continue;
				}

				// Check if env field contains the dependency resource name
				if (envField.includes(depName) && depName.length > bestMatchLength) {
					bestMatch = depResource;
					bestMatchLength = depName.length;
				}
			}

			// Add the best match if found and not already added
			if (
				bestMatch &&
				!result[ownerKind][ownerName].some((r) => r.name === bestMatch.name)
			) {
				result[ownerKind][ownerName].push({
					name: bestMatch.name,
					kind: bestMatch.resourceType,
				});
			}
		}
	}

	// console.log("result", result);

	return result;
}
