import type { IngressResource } from "@sealos-brain/k8s/resources/ingress/models";
import type { ServiceResource } from "@sealos-brain/k8s/resources/service/models";
import type { ObjectPort } from "../models/network-ports.model";

/**
 * Transforms URL format from subdomain.sealos.run to sealossubdomain.site
 * Preserves protocol and doesn't add 'dbconn.' prefix
 * @example bja.sealos.run -> sealosbja.site
 */
export function transformRegionUrl(url: string): string {
	if (url.endsWith(".io")) return url;

	const protocolMatch = url.match(/^(https?:\/\/)/);
	const protocol = protocolMatch?.[1] ?? "";
	const urlWithoutProtocol = url.replace(/^https?:\/\//, "");
	const parts = urlWithoutProtocol.split(".");

	if (parts.length === 3 && parts[1] === "sealos" && parts[2] === "run") {
		return `${protocol}sealos${parts[0]}.site`;
	}

	return url;
}

/**
 * Extracts service ports and composes addresses
 */
function extractServicePorts(
	services: ServiceResource[],
	namespace: string,
	regionUrl: string,
): Map<number, ObjectPort> {
	const servicePorts = new Map<number, ObjectPort>();

	for (const service of services) {
		const serviceName = service?.metadata?.name;
		const ports = service?.spec?.ports || [];

		for (const port of ports) {
			const protocol = port.protocol?.toLowerCase() || "tcp";
			const protocolForAddress = protocol === "tcp" ? "http" : protocol;

			const privateHost = serviceName
				? `${serviceName}.${namespace}`
				: undefined;
			const privateAddress = privateHost
				? `${protocolForAddress}://${privateHost}:${port.port}`
				: undefined;

			const publicAddress = port.nodePort
				? `${protocolForAddress}://${protocolForAddress}.${transformRegionUrl(
						regionUrl,
					)}:${port.nodePort}`
				: undefined;

			servicePorts.set(port.port, {
				number: port.port,
				portName: port.name,
				protocol: port.protocol,
				serviceName,
				privateAddress,
				privateHost,
				nodePort: port.nodePort,
				publicAddress,
			});
		}
	}

	return servicePorts;
}

/**
 * Merges ingress information with service ports
 */
function mergeIngressPorts(
	ingresses: IngressResource[],
	servicePorts: Map<number, ObjectPort>,
): Map<number, ObjectPort> {
	for (const ingress of ingresses) {
		const protocol =
			ingress?.metadata?.annotations?.[
				"nginx.ingress.kubernetes.io/backend-protocol"
			];
		const fixedDomain =
			ingress?.metadata?.labels?.["cloud.sealos.io/app-deploy-manager-domain"];
		const rules = ingress?.spec?.rules || [];

		for (const rule of rules) {
			const publicHost = rule.host;
			const paths = rule.http?.paths || [];

			for (const path of paths) {
				const portNumber = path.backend?.service?.port?.number;
				if (portNumber) {
					const existingPort = servicePorts.get(portNumber);
					const customDomain =
						publicHost && publicHost !== fixedDomain ? publicHost : fixedDomain;
					const protocolForPublic = protocol?.toLowerCase() || "http";
					const publicAddress = publicHost
						? `${protocolForPublic}s://${publicHost}`
						: undefined;

					if (existingPort) {
						servicePorts.set(portNumber, {
							...existingPort,
							protocol: protocol || existingPort.protocol,
							publicHost,
							publicAddress,
							customDomain,
						});
					} else {
						servicePorts.set(portNumber, {
							number: portNumber,
							protocol,
							publicHost,
							publicAddress,
							customDomain,
						});
					}
				}
			}
		}
	}

	return servicePorts;
}

/**
 * Composes ports from service and ingress resources
 */
export async function composePortsFromResources(
	services: ServiceResource[],
	ingresses: IngressResource[],
	namespace: string,
	regionUrl: string,
): Promise<ObjectPort[]> {
	if (
		!Array.isArray(services) ||
		!Array.isArray(ingresses) ||
		!namespace ||
		!regionUrl
	) {
		return [];
	}

	// Extract service ports
	const servicePorts = extractServicePorts(services, namespace, regionUrl);

	// Merge ingress information
	const mergedPorts = mergeIngressPorts(ingresses, servicePorts);

	return Array.from(mergedPorts.values());
}
