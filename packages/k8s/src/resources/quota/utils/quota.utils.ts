import type { QuotaObject } from "../models/quota-object.model";

interface ObjectWithResource {
	resource?: {
		cpu?: number;
		memory?: number;
		storage?: number;
	};
	ports?: Array<{
		protocol: string;
		exposesPublicDomain?: boolean;
	}>;
}

interface ResourceDelta {
	cpu: number;
	memory: number;
	storage: number;
	ports: number;
}

/**
 * Computes the remaining quota for each resource type
 */
export function computeRemainingQuota(quota: QuotaObject): {
	cpu: number;
	memory: number;
	storage: number;
	ports: number;
} {
	return {
		cpu: quota.cpu ? quota.cpu.limit - quota.cpu.used : Infinity,
		memory: quota.memory ? quota.memory.limit - quota.memory.used : Infinity,
		storage: quota.storage
			? quota.storage.limit - quota.storage.used
			: Infinity,
		ports: quota.ports ? quota.ports.limit - quota.ports.used : Infinity,
	};
}

/**
 * Counts TCP and UDP ports from an object's ports array
 */
function countTcpUdpPorts(object: ObjectWithResource): number {
	if (!object.ports) return 0;

	return object.ports.filter(
		(port) => port.protocol === "TCP" || port.protocol === "UDP",
	).length;
}

export function validateCreationByQuota(
	objects: unknown[],
	quota: QuotaObject,
): { success: boolean; errors: string[] } {
	const errors: string[] = [];

	// Calculate remaining quota for each resource
	const remaining = computeRemainingQuota(quota);

	// Calculate total resource requirements from all objects
	const totalRequired = objects.reduce(
		(
			acc: { cpu: number; memory: number; storage: number; ports: number },
			obj,
		) => {
			const objectWithResource = obj as ObjectWithResource;

			if (objectWithResource.resource) {
				const { cpu, memory, storage } = objectWithResource.resource;

				// Add to total requirements
				if (cpu !== undefined) acc.cpu += cpu;
				if (memory !== undefined) acc.memory += memory;
				if (storage !== undefined) acc.storage += storage;
			}

			// Count TCP/UDP ports
			acc.ports += countTcpUdpPorts(objectWithResource);

			return acc;
		},
		{
			cpu: 0,
			memory: 0,
			storage: 0,
			ports: 0,
		},
	);

	// Validate against remaining quota
	if (quota.cpu && totalRequired.cpu > remaining.cpu) {
		errors.push(
			`Insufficient CPU quota. Required: ${totalRequired.cpu}, Available: ${remaining.cpu.toFixed(2)}`,
		);
	}

	if (quota.memory && totalRequired.memory > remaining.memory) {
		errors.push(
			`Insufficient memory quota. Required: ${totalRequired.memory}, Available: ${remaining.memory.toFixed(2)}`,
		);
	}

	if (quota.storage && totalRequired.storage > remaining.storage) {
		errors.push(
			`Insufficient storage quota. Required: ${totalRequired.storage}, Available: ${remaining.storage.toFixed(2)}`,
		);
	}

	if (quota.ports && totalRequired.ports > remaining.ports) {
		errors.push(
			`Insufficient port quota. Required: ${totalRequired.ports}, Available: ${remaining.ports}`,
		);
	}

	return {
		success: errors.length === 0,
		errors,
	};
}

/**
 * Validates quota for object updates by comparing the delta between before and after states
 */
export function validateUpdateByQuota(
	beforeUpdateObject: unknown,
	afterUpdateObject: unknown,
	quota: QuotaObject,
): { success: boolean; errors: string[] } {
	const errors: string[] = [];

	// Compute remaining quota
	const remaining = computeRemainingQuota(quota);

	// Calculate resource delta between before and after states
	const delta = calculateResourceDelta(beforeUpdateObject, afterUpdateObject);

	// Validate delta against remaining quota
	if (quota.cpu && delta.cpu > remaining.cpu) {
		errors.push(
			`Insufficient CPU quota for update. Additional required: ${delta.cpu}, Available: ${remaining.cpu.toFixed(2)}`,
		);
	}

	if (quota.memory && delta.memory > remaining.memory) {
		errors.push(
			`Insufficient memory quota for update. Additional required: ${delta.memory}, Available: ${remaining.memory.toFixed(2)}`,
		);
	}

	if (quota.storage && delta.storage > remaining.storage) {
		errors.push(
			`Insufficient storage quota for update. Additional required: ${delta.storage}, Available: ${remaining.storage.toFixed(2)}`,
		);
	}

	if (quota.ports && delta.ports > remaining.ports) {
		errors.push(
			`Insufficient port quota for update. Additional required: ${delta.ports}, Available: ${remaining.ports}`,
		);
	}

	return {
		success: errors.length === 0,
		errors,
	};
}

/**
 * Calculates the resource delta between before and after update objects
 */
function calculateResourceDelta(
	beforeObject: unknown,
	afterObject: unknown,
): ResourceDelta {
	const before = beforeObject as ObjectWithResource;
	const after = afterObject as ObjectWithResource;

	const beforeResource = before.resource || { cpu: 0, memory: 0, storage: 0 };
	const afterResource = after.resource || { cpu: 0, memory: 0, storage: 0 };

	const beforePorts = countTcpUdpPorts(before);
	const afterPorts = countTcpUdpPorts(after);

	return {
		cpu: (afterResource.cpu || 0) - (beforeResource.cpu || 0),
		memory: (afterResource.memory || 0) - (beforeResource.memory || 0),
		storage: (afterResource.storage || 0) - (beforeResource.storage || 0),
		ports: afterPorts - beforePorts,
	};
}
