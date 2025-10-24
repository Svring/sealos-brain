import type { ResourceObject } from "../../resource/models/resource-object.model";
import type { ResourceReliances } from "../models/resource-reliance.model";

/**
 * Extracts image name from either ImageSchema object or string
 * @param image - Image can be either ImageSchema object or string
 * @returns The image name string or undefined if not available
 */
function getImageName(
	image: string | { imageName?: string } | undefined,
): string | undefined {
	if (!image) return undefined;

	if (typeof image === "string") {
		return image;
	}

	if (typeof image === "object" && "imageName" in image) {
		return image.imageName;
	}

	return undefined;
}

/**
 * Infers resource dependencies based on image names
 * Matches deployment and statefulset images (processed by truncateImage) against devbox names
 * @param resourceObjects Array of resource objects to analyze (devbox, deployment, and statefulset)
 * @returns Object containing resource dependencies grouped by kind and name
 */
export function inferRelianceFromImage(
	resourceObjects: ResourceObject[],
): ResourceReliances {
	const result: ResourceReliances = {};

	// Filter devbox resources
	const devboxResources = resourceObjects.filter(
		(resource) => resource.resourceType.toLowerCase() === "devbox",
	);

	// Filter deployment and statefulset resources (both are workload resources)
	const workloadResources = resourceObjects.filter(
		(resource) =>
			resource.resourceType.toLowerCase() === "deployment" ||
			resource.resourceType.toLowerCase() === "statefulset",
	);

	// Process each workload resource to find matching devboxes
	for (const workload of workloadResources) {
		const workloadKind = workload.resourceType.toLowerCase();
		const workloadName = workload.name;

		// Initialize result structure
		if (!result[workloadKind]) {
			result[workloadKind] = {};
		}
		result[workloadKind][workloadName] = [];

		// Extract image name from workload (should be ImageSchema object)
		const workloadImageName = getImageName(
			workload.image as string | { imageName?: string } | undefined,
		);

		if (workloadImageName) {
			// Use truncateImage to extract the meaningful part of the image name
			const processedImage =
				workloadImageName.split("/").pop() ?? workloadImageName;

			// Find devboxes whose names match the processed image
			for (const devbox of devboxResources) {
				const devboxName = devbox.name;
				// Extract devbox image name (should be string)

				// Check if the processed workload image contains the devbox name as a complete word
				// This prevents false matches where devbox name is a substring of another name
				const devboxNameRegex = new RegExp(
					`\\b${devboxName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
				);
				if (devboxNameRegex.test(processedImage)) {
					// Add the devbox as a dependency if not already added
					if (
						!result[workloadKind][workloadName].some(
							(r) => r.name === devboxName,
						)
					) {
						result[workloadKind][workloadName].push({
							name: devboxName,
							kind: devbox.resourceType,
						});
					}
				}
			}
		}
	}

	return result;
}
