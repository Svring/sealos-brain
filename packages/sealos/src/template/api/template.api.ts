"use server";

import type { K8sContext } from "@sealos-brain/k8s/shared/models";
import { getRegionUrlFromKubeconfig } from "@sealos-brain/k8s/shared/utils";
import { createAxiosClient } from "@sealos-brain/shared/network/utils";
import type { AxiosInstance } from "axios";
import {
	err,
	errAsync,
	fromPromise,
	ok,
	type Result,
	type ResultAsync,
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
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createTemplateAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(api.get("/"), (error) => error as Error).map(
		(response) => response.data.data,
	);
};

/**
 * Get a specific template by name
 */
export const getTemplate = async (
	context: K8sContext,
	params: { path: { name: string } },
): Promise<
	ResultAsync<ReturnType<typeof TemplateObjectSchema.parse>, Error>
> => {
	const apiResult = await createTemplateAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.get(`/${params.path.name}`),
		(error) => error as Error,
	).map((response) => TemplateObjectSchema.parse(response.data.data));
};
