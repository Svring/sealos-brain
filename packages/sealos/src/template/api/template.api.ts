"use server";

import type { K8sContext } from "@sealos-brain/k8s/shared/models";
import { getRegionUrlFromKubeconfig } from "@sealos-brain/k8s/shared/utils";
import { createAxiosClient } from "@sealos-brain/shared/network/utils";
import type { AxiosInstance } from "axios";
import {
	err,
	fromPromise,
	ok,
	type Result,
} from "neverthrow";
import { TemplateObjectSchema } from "../models/template-object.model";

/**
 * Creates axios instance for template API calls
 */
async function createTemplateAxios(
	context: K8sContext,
): Promise<Result<AxiosInstance, Error>> {
	const regionUrlResultAsync = fromPromise(
		getRegionUrlFromKubeconfig(context.kubeconfig),
		(error) => error as Error,
	);

	const regionUrlResult = await regionUrlResultAsync;

	if (regionUrlResult.isErr()) {
		return err(
			new Error("Failed to extract region URL from kubeconfig", {
				cause: regionUrlResult.error,
			}),
		);
	}

	const regionUrl = regionUrlResult.value;
	if (!regionUrl) {
		return err(new Error("Failed to extract region URL from kubeconfig"));
	}

	const baseURL = `http://template.${regionUrl}/api/v1/template`;

	return ok(
		createAxiosClient({
			baseURL,
			headers: {
				Authorization: encodeURIComponent(context.kubeconfig),
			},
		}),
	);
}

// ============================================================================
// Query Operations
// ============================================================================

/**
 * List all templates
 */
export const listTemplates = async (
	context: K8sContext,
): Promise<unknown> => {
	const apiResult = await createTemplateAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(api.get("/"), (error) => error as Error).map(
		(response) => response.data.data,
	);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

/**
 * Get a specific template by name
 */
export const getTemplate = async (
	context: K8sContext,
	params: { path: { name: string } },
): Promise<ReturnType<typeof TemplateObjectSchema.parse>> => {
	const apiResult = await createTemplateAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.get(`/${params.path.name}`),
		(error) => error as Error,
	).map((response) => TemplateObjectSchema.parse(response.data.data));

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};
