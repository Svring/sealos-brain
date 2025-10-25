"use server";

import { composeObjectFromTarget } from "@sealos-brain/bridge/api";
import type {
	CustomResourceTarget,
	K8sContext,
} from "@sealos-brain/k8s/shared/models";
import { OsbBridgeSchema } from "../models/osb-bridge.model";
import { OsbObjectSchema } from "../models/osb-object.model";

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
) => {
	const osbObject = await composeObjectFromTarget(
		context,
		target,
		OsbBridgeSchema,
		OsbObjectSchema,
	);
	return OsbObjectSchema.parse(osbObject);
};
