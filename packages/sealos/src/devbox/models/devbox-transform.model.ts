import type { Env, K8sResource } from "@sealos-brain/k8s/shared/models";
import {
	getCurrentNamespace,
	getRegionUrlFromKubeconfig,
	standardizeUnit,
} from "@sealos-brain/k8s/shared/utils";
import {
	formatDurationToReadable,
	formatIsoDateToReadable,
} from "@sealos-brain/shared/date/utils";
import { composePortsFromResources } from "@sealos-brain/shared/network/utils";
import { z } from "zod";

// Transform functions

// biome-ignore lint/suspicious/noExplicitAny: Generic resource transformation
const transformSsh = async (resources: any) => {
	if (!resources || !Array.isArray(resources) || resources.length < 5) {
		return {
			host: null,
			port: null,
			user: null,
			workingDir: null,
			privateKey: null,
		};
	}

	const [kubeconfig, nodePort, user, workingDir, privateKey] = resources;

	// Transform host from kubeconfig
	const host = kubeconfig ? await getRegionUrlFromKubeconfig(kubeconfig) : null;

	// Transform privateKey from base64
	const decodedPrivateKey = privateKey
		? Buffer.from(privateKey, "base64").toString("utf-8")
		: null;

	return {
		host,
		port: nodePort,
		user,
		workingDir,
		privateKey: decodedPrivateKey,
	};
};

const transformRuntime = (image: string | undefined) => {
	if (!image) return "";
	// Transform the image similar to how devbox node title processes it
	// First extract the image name (remove registry and tag)
	const parts = image.split(":")[0]?.split("/");
	if (!parts || parts.length === 0) return "";
	const imageName = parts[parts.length - 1] || "";
	// Then apply the same processing as devbox node title: split by "-", remove last part, join back
	return imageName.split("-").slice(0, 1).join("-");
};

// biome-ignore lint/suspicious/noExplicitAny: Generic resource transformation
const transformOperationalStatus = (resource: any) => {
	const metadata = resource.metadata;
	const status = resource.status;

	// Get createdAt from metadata and format it
	const createdAt = formatIsoDateToReadable(metadata.creationTimestamp);

	// Calculate upTime from state.running.startedAt
	let upTime: string | undefined;
	if (status?.state?.running?.startedAt) {
		const startedAt = new Date(status.state.running.startedAt);
		const currentTime = new Date();
		const upTimeSeconds = Math.floor(
			(currentTime.getTime() - startedAt.getTime()) / 1000,
		); // Convert to seconds
		upTime = formatDurationToReadable(upTimeSeconds);
	}

	return {
		createdAt,
		upTime,
	};
};

// biome-ignore lint/suspicious/noExplicitAny: Generic resource transformation
const transformResource = (resources: any) => {
	// Convert Kubernetes resource strings to universal units
	const cpu = standardizeUnit(resources.cpu || "0", "cpu");
	const memory = standardizeUnit(resources.memory || "0", "memory");

	return {
		cpu,
		memory,
	};
};

const transformEnv = (envVars: Env[]) => {
	if (!envVars.length) {
		return [];
	}
	return envVars.map((envVar: Env) => {
		if (envVar.value) {
			// Direct value environment variable
			return {
				name: envVar.name,
				value: envVar.value,
			};
		} else if (envVar.valueFrom?.secretKeyRef) {
			// Secret reference environment variable
			return {
				name: envVar.name,
				valueFrom: {
					secretKeyRef: {
						name: envVar.valueFrom.secretKeyRef.name,
						key: envVar.valueFrom.secretKeyRef.key,
					},
				},
			};
		} else {
			// Unknown type, return as value with placeholder
			return {
				name: envVar.name,
				value: `[UNKNOWN_ENV_TYPE: ${JSON.stringify(envVar)}]`,
			};
		}
	});
};

// biome-ignore lint/suspicious/noExplicitAny: Generic resource transformation
const transformPorts = async (resources: any) => {
	if (!resources || !Array.isArray(resources) || resources.length < 3) {
		return [];
	}

	const [services, ingresses, kubeconfig] = resources;

	// Extract namespace and regionUrl from context
	const namespace = await getCurrentNamespace(kubeconfig);
	const regionUrl = await getRegionUrlFromKubeconfig(kubeconfig);

	// Compose ports using the modular function
	if (!namespace || !regionUrl) {
		return [];
	}
	return await composePortsFromResources(
		services,
		ingresses,
		namespace,
		regionUrl,
	);
};

const transformPods = (pods: K8sResource[]) => {
	return pods.map((pod: K8sResource) => {
		return {
			name: pod.metadata?.name,
			status: pod.status?.phase,
		};
	});
};

// Transform schema
export const DevboxBridgeTransSchema = z.object({
	name: z.any(),
	uid: z.any(),
	runtime: z.any().transform(transformRuntime),
	image: z.any(),
	operationalStatus: z.any().transform(transformOperationalStatus),
	status: z.any(),
	resource: z.any().transform(transformResource),
	ssh: z.any().transform(transformSsh),
	env: z.any().optional().transform(transformEnv),
	ports: z.any().optional().transform(transformPorts),
	pods: z.any().optional().transform(transformPods),
});
