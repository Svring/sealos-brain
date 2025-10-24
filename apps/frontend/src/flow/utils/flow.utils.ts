import type { ResourceReliances } from "@sealos-brain/shared/reliance/models";
import {
	inferRelianceFromEnv,
	inferRelianceFromImage,
} from "@sealos-brain/shared/reliance/utils";
import type { ResourceObject } from "@sealos-brain/shared/resource/models";
import { type Edge, MarkerType, type Node } from "@xyflow/react";
import _ from "lodash";
import {
	LAYOUT_OPTIONS,
	SPLIT_OPTIONS,
} from "@/flow/constants/flow-layout.constant";
import type { LayoutOptions } from "@/flow/models/layout-options.model";
import { resourceParser } from "@sealos-brain/shared/resource/utils";
import { applyNormalLayout } from "./layout/layout-normal.utils";
import { applySplitLayout } from "./layout/layout-split.utils";

export const convertObjectsToNodes = (objects: ResourceObject[]): Node[] =>
	_.map(objects, ({ name, resourceType }) => ({
		id: `${resourceType.toLowerCase()}-${name}`,
		type: ["deployment", "statefulset"].includes(resourceType.toLowerCase())
			? "launchpad"
			: resourceType.toLowerCase(),
		position: { x: 0, y: 0 },
		data: {
			id: `${resourceType.toLowerCase()}-${name}`,
			target: resourceParser.toTarget({ resourceType, name }),
		},
	}));

export const inferObjectsReliances = (
	objects: ResourceObject[],
): ResourceReliances => {
	// Custom merge function to avoid TypeError when merging non-iterable values
	const mergeReliances = (
		envReliances: ResourceReliances,
		imageReliances: ResourceReliances,
	): ResourceReliances =>
		_.mergeWith({ ...envReliances }, imageReliances, (objValue, srcValue) => {
			// Only merge arrays, otherwise return undefined to use default merge
			if (Array.isArray(objValue) && Array.isArray(srcValue)) {
				return _.uniqBy(
					[...objValue, ...srcValue],
					(r) => `${r.resourceType}-${r.name}`,
				);
			}
			// If only one is array, return the array
			if (Array.isArray(objValue)) return objValue;
			if (Array.isArray(srcValue)) return srcValue;
			// Otherwise, use default merge (return undefined)
			return undefined;
		});

	return mergeReliances(
		inferRelianceFromEnv(objects),
		inferRelianceFromImage(objects),
	);
};

export const convertReliancesToEdges = (
	reliances: ResourceReliances,
	resourceObjects?: any[],
): Edge[] =>
	_.flatMap(Object.entries(reliances), ([ownerKind, ownerResources]) =>
		_.flatMap(Object.entries(ownerResources), ([ownerName, dependencies]) => {
			const target = `${ownerKind.toLowerCase()}-${ownerName}`;
			return _.map(dependencies, (dependency) => {
				const isDevboxToLaunchpad =
					dependency.kind.toLowerCase() === "devbox" &&
					(ownerKind.toLowerCase() === "deployment" ||
						ownerKind.toLowerCase() === "statefulset");

				let devboxVersion = null;
				if (isDevboxToLaunchpad && resourceObjects) {
					const launchpadResource = resourceObjects.find(
						(resource) =>
							(resource.kind?.toLowerCase() === "deployment" ||
								resource.kind?.toLowerCase() === "statefulset") &&
							resource.name === ownerName,
					);

					let imageUrl = null;
					if (launchpadResource?.image?.imageName) {
						imageUrl = launchpadResource.image.imageName;
					} else if (launchpadResource?.image) {
						imageUrl = launchpadResource.image;
					} else if (
						launchpadResource?.spec?.template?.spec?.containers?.[0]?.image
					) {
						imageUrl = launchpadResource.spec.template.spec.containers[0].image;
					}

					if (imageUrl) {
						// Extract version from launchpad's image URL (e.g., "hub.usw.sealos.io/ns-czonr3p6/devbox-vfvscq21:v1.1.0" -> "v1.1.0")
						const versionMatch = imageUrl.match(/:([^:]+)$/);
						if (versionMatch) {
							devboxVersion = versionMatch[1];
						} else {
							// If no version found, use "latest"
							devboxVersion = "latest";
						}
					}
				}

				const edgeData =
					isDevboxToLaunchpad && devboxVersion ? { devboxVersion } : undefined;

				return {
					id: `${dependency.kind.toLowerCase()}-${dependency.name}-${target}`,
					source: `${dependency.kind.toLowerCase()}-${dependency.name}`,
					target,
					type: "floating",
					markerEnd: { type: MarkerType.Arrow, width: 30, height: 30 },
					animated: true,
					data: edgeData,
				};
			});
		}),
	);

export const deriveNetworkNodesAndEdges = (
	objects: ResourceObject[],
): { nodes: Node[]; edges: Edge[] } => {
	const nodes: Node[] = [];
	const edges: Edge[] = [];

	_.forEach(objects, ({ name, resourceType, ports }) => {
		if (!ports || !Array.isArray(ports) || ports.length === 0) return;

		const networkNodeId = `network-${name}`;
		const resourceNodeId = `${resourceType.toLowerCase()}-${name}`;
		const edgeId = `${resourceType.toLowerCase()}-${name}-to-${networkNodeId}`;

		const networkData = {
			target: resourceParser.toTarget({ resourceType, name }),
		};

		if (!_.some(nodes, { id: networkNodeId })) {
			nodes.push({
				id: networkNodeId,
				type: "network",
				position: { x: 0, y: 0 },
				data: networkData,
			});
		}

		if (!_.some(edges, { id: edgeId })) {
			edges.push({
				id: edgeId,
				source: resourceNodeId,
				target: networkNodeId,
				type: "floating",
				markerEnd: { type: MarkerType.Arrow, width: 30, height: 30 },
				animated: true,
			});
		}
	});

	return { nodes, edges };
};

export const createDevGroup = (nodes: Node[]): Node[] => {
	const devboxNodes = _.filter(nodes, { type: "devbox" });
	if (_.isEmpty(devboxNodes)) return nodes;

	const devboxNames = new Set(
		_.map(devboxNodes, (node) => node.data?.target?.name as string),
	);

	// Find devbox network nodes
	const devboxNetworkNodes = _.filter(
		nodes,
		(node) =>
			node.type === "network" &&
			node.id.startsWith("network-") &&
			devboxNames.has(node.id.replace("network-", "")),
	);

	// Note: Database (cluster) nodes connected to devbox are no longer added to dev group
	const clusterNodesConnectedToDevbox: Node[] = [];

	const groupNode: Node = {
		id: "devbox-group",
		type: "devgroup",
		data: { label: "Devbox Group" },
		position: { x: 0, y: 0 },
	};

	const groupedNodes = _.map(
		[...devboxNodes, ...devboxNetworkNodes, ...clusterNodesConnectedToDevbox],
		(node) => ({
			...node,
			parentId: "devbox-group",
			extent: "parent" as const,
			position: node.position ?? { x: 0, y: 0 },
		}),
	);

	const groupedIds = new Set(_.map(groupedNodes, "id"));
	return [
		..._.filter(nodes, (node) => !groupedIds.has(node.id)),
		groupNode,
		...groupedNodes,
	];
};

export const applyLayout = (
	nodes: Node[],
	edges: Edge[] = [],
	options: LayoutOptions = {},
): Node[] => {
	if (nodes.length === 0) return nodes;

	// Check if there's a devbox group node
	const hasDevboxGroup = nodes.some((node) => node.id === "devbox-group");

	if (hasDevboxGroup) {
		// Use split layout for devbox groups with machine's options
		return applySplitLayout(nodes, edges, {
			...SPLIT_OPTIONS,
			// Allow options to override default settings
			groupLayoutOptions: {
				...SPLIT_OPTIONS.groupLayoutOptions,
				...options,
			},
			outsideLayoutOptions: {
				...SPLIT_OPTIONS.outsideLayoutOptions,
				...options,
			},
		});
	} else {
		// Use normal layout for regular nodes with machine's options
		return applyNormalLayout(nodes, edges, {
			...LAYOUT_OPTIONS,
			edgeAware: true,
			barycentricIterations: 3,
			...options,
		});
	}
};
