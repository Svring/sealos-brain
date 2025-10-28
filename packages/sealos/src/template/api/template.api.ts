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
// Template API Functions
// ============================================================================

/**
 * List all templates
 */
export const listTemplates = async (context: K8sContext) => {
	const api = await createTemplateAxios(context);
	const response = await api.get("/");

	// Parse the response structure: { code, message, data: { templates: [...], menuKeys: "..." } }
	const { data } = response.data;
	const templates = data.templates.map(
		(template: unknown) =>
			// TemplateItemSchema.parse(template),
			template,
	);
	const menuKeys = data.menuKeys;

	return {
		templates,
		menuKeys,
	};
};

/**
 * Get a specific template by name
 */
export const getTemplate = async (context: K8sContext, name: string) => {
	const api = await createTemplateAxios(context);
	const response = await api.get(`/${name}`);
	return TemplateObjectSchema.parse(response.data.data);
};
