"use server";

import { CUSTOM_RESOURCES } from "@/registry/dark/constants/k8s/k8s-custom.constant";
import { addMissingFields } from "@/registry/dark/lib/k8s/k8s-client.utils";
import {
	getApiClients,
	getBuiltinApiClient,
	getCurrentNamespace,
	invokeApiMethod,
} from "@/registry/dark/lib/k8s/k8s-server.utils";
import type {
	BuiltinResourceTarget,
	BuiltinResourceTypeTarget,
	CustomResourceTarget,
	CustomResourceTypeTarget,
} from "@/registry/dark/models/k8s/k8s.model";
import type { K8sContext } from "@/registry/dark/models/k8s/k8s-context.model";

// ============================================================================
// Kubernetes API Query Functions
// ============================================================================

export const listCustomResources = async (
	context: K8sContext,
	target: CustomResourceTypeTarget,
) => {
	const { clients } = await getApiClients(context.kubeconfig);
	const customResourceConfig = CUSTOM_RESOURCES[target.resourceType];
	const namespace = await getCurrentNamespace(context.kubeconfig);

	if (!customResourceConfig) {
		throw new Error(`Unknown custom resource type: ${target.resourceType}`);
	}

	if (!namespace) {
		throw new Error("Namespace is required but not found in kubeconfig");
	}

	const customResourceListResponse = await invokeApiMethod(
		clients.customApi,
		"listNamespacedCustomObject",
		{
			group: customResourceConfig.group,
			version: customResourceConfig.version,
			namespace,
			plural: customResourceConfig.plural,
			labelSelector:
				target.label && target.name
					? `${target.label}=${target.name}`
					: undefined,
		},
	);
	return JSON.parse(JSON.stringify(customResourceListResponse));
};

export const getCustomResource = async (
	context: K8sContext,
	target: CustomResourceTarget,
) => {
	const { clients } = await getApiClients(context.kubeconfig);
	const customResourceConfig = CUSTOM_RESOURCES[target.resourceType];
	const namespace = await getCurrentNamespace(context.kubeconfig);

	if (!customResourceConfig) {
		throw new Error(`Unknown custom resource type: ${target.resourceType}`);
	}

	if (!namespace) {
		throw new Error("Namespace is required but not found in kubeconfig");
	}

	const customResourceGetResponse = await invokeApiMethod(
		clients.customApi,
		"getNamespacedCustomObject",
		{
			group: customResourceConfig.group,
			version: customResourceConfig.version,
			namespace,
			plural: customResourceConfig.plural,
			name: target.name,
		},
	);
	return JSON.parse(JSON.stringify(customResourceGetResponse));
};

export const listBuiltinResources = async (
	context: K8sContext,
	target: BuiltinResourceTypeTarget,
) => {
	const { client, resourceConfig } = await getBuiltinApiClient(
		context.kubeconfig,
		target.resourceType,
	);
	const namespace = await getCurrentNamespace(context.kubeconfig);

	if (!namespace) {
		throw new Error("Namespace is required but not found in kubeconfig");
	}

	const builtinResourceListResponse = await invokeApiMethod<{
		items: any[];
	}>(client, resourceConfig.listMethod, {
		namespace,
		labelSelector:
			target.label && target.name
				? `${target.label}=${target.name}`
				: undefined,
	});

	return JSON.parse(
		JSON.stringify(
			await addMissingFields(
				builtinResourceListResponse.items,
				resourceConfig.apiVersion,
				resourceConfig.kind,
			),
		),
	);
};

export const getBuiltinResource = async (
	context: K8sContext,
	target: BuiltinResourceTarget,
) => {
	const { client, resourceConfig } = await getBuiltinApiClient(
		context.kubeconfig,
		target.resourceType,
	);
	const namespace = await getCurrentNamespace(context.kubeconfig);

	if (!namespace) {
		throw new Error("Namespace is required but not found in kubeconfig");
	}

	const builtinResourceGetResponse = await invokeApiMethod(
		client,
		resourceConfig.getMethod,
		{
			namespace,
			name: target.name,
		},
	);

	return JSON.parse(JSON.stringify(builtinResourceGetResponse));
};
