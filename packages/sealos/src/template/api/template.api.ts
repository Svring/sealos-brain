"use server";

import type { K8sContext } from "@sealos-brain/k8s/shared/models";
import { getRegionUrlFromKubeconfig } from "@sealos-brain/k8s/shared/utils";
import { createAxiosClient } from "@sealos-brain/shared/network/utils";
import { TemplateObjectSchema } from "../models/template-object.model";

/**
 * Creates axios instance for template API calls
 */
async function createTemplateAxios(context: K8sContext) {
	const regionUrl = await getRegionUrlFromKubeconfig(context.kubeconfig);
	if (!regionUrl) {
		throw new Error("Failed to extract region URL from kubeconfig");
	}

	const baseURL = `http://template.${regionUrl}/api/v1/template`;

	return createAxiosClient({
		baseURL,
		headers: {
			Authorization: encodeURIComponent(context.kubeconfig),
		},
	});
}

// ============================================================================
// Query Operations
// ============================================================================

/**
 * List all templates
 */
export const listTemplates = async (context: K8sContext) => {
	const api = await createTemplateAxios(context);
	const response = await api.get("/");
	return response.data.data;
};

/**
 * Get a specific template by name
 */
export const getTemplate = async (
	context: K8sContext,
	params: { path: { name: string } },
) => {
	const api = await createTemplateAxios(context);
	const response = await api.get(`/${params.path.name}`);
	return TemplateObjectSchema.parse(response.data.data);
};
