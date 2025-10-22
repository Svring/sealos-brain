import { standardizeUnit } from "@/lib/k8s/k8s-client.utils";
import type {
	QuotaObject,
	ResourceValue,
} from "@/mvvm/sealos/quota/models/quota-object.model";
import type { QuotaResource } from "@/mvvm/sealos/quota/models/quota-resource.model";

// Helper function to create ResourceValue from limit and used strings
const createResourceValue = (
	limit: string | undefined,
	used: string | undefined,
	resourceType: "cpu" | "memory" | "storage" | "other" = "other",
): ResourceValue | null => {
	if (!limit || !used) {
		return null;
	}

	return {
		used: Number(standardizeUnit(used, resourceType).toFixed(2)),
		limit: Number(standardizeUnit(limit, resourceType).toFixed(2)),
	};
};

// Convert ResourceQuota to QuotaObject
const toObject = (resourceQuota: QuotaResource): QuotaObject => {
	const { spec, status } = resourceQuota;

	return {
		cpu: createResourceValue(
			spec.hard["limits.cpu"],
			status.used["limits.cpu"],
			"cpu",
		),
		memory: createResourceValue(
			spec.hard["limits.memory"],
			status.used["limits.memory"],
			"memory",
		),
		storage: createResourceValue(
			spec.hard["requests.storage"],
			status.used["requests.storage"],
			"storage",
		),
		ports: createResourceValue(
			spec.hard["services.nodeports"],
			status.used["services.nodeports"],
			"other",
		),
	};
};

export const quotaParser = {
	toObject,
};
