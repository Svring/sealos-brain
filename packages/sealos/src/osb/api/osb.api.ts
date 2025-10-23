"use server";

import { composeObjectFromTarget } from "@sealos-brain/bridge";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import { OsbBridgeSchema } from "@/mvvm/sealos/osb/models/osb-bridge.model";
import { OsbObjectSchema } from "@/mvvm/sealos/osb/models/osb-object.model";

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
