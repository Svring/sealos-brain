"use server";

import type {
	CustomResourceTarget,
	K8sContext,
} from "@sealos-brain/k8s/shared/models";

// ============================================================================
// OSB API Functions
// ============================================================================

/**
 * List all OSB buckets
 */
export const listOsbBuckets = async (_context: K8sContext) => {
	// TODO: Implement list OSB buckets
	throw new Error("Not implemented");
};

/**
 * Get a specific OSB bucket by CustomResourceTarget
 */
export const getOsbBucket = async (
	context: K8sContext,
	target: CustomResourceTarget,
) => {};
