"use server";

import type {
	CustomResourceTarget,
	K8sContext,
} from "@sealos-brain/k8s/shared/models";
import { err, type Result } from "neverthrow";

// ============================================================================
// OSB API Functions
// ============================================================================

/**
 * List all OSB buckets
 */
export const listOsbBuckets = async (
	_context: K8sContext,
): Promise<unknown> => {
	// TODO: Implement list OSB buckets
	throw new Error("Not implemented");
};

/**
 * Get a specific OSB bucket by CustomResourceTarget
 */
export const getOsbBucket = async (
	_context: K8sContext,
	_target: CustomResourceTarget,
): Promise<unknown> => {
	// TODO: Implement get OSB bucket
	throw new Error("Not implemented");
};
