"use server";

import type {
	CustomResourceTarget,
	K8sContext,
} from "@sealos-brain/k8s/shared/models";
import { errAsync, type ResultAsync } from "neverthrow";

// ============================================================================
// OSB API Functions
// ============================================================================

/**
 * List all OSB buckets
 */
export const listOsbBuckets = async (
	_context: K8sContext,
): Promise<ResultAsync<unknown, Error>> => {
	// TODO: Implement list OSB buckets
	return errAsync(new Error("Not implemented"));
};

/**
 * Get a specific OSB bucket by CustomResourceTarget
 */
export const getOsbBucket = async (
	_context: K8sContext,
	_target: CustomResourceTarget,
): Promise<ResultAsync<unknown, Error>> => {
	// TODO: Implement get OSB bucket
	return errAsync(new Error("Not implemented"));
};
