"use server";

import { createAxiosClient } from "@sealos-brain/shared/network/utils";
import type { AxiosInstance } from "axios";
import { fromPromise, ok, type Result } from "neverthrow";
import { composeAiProxyBaseUrl } from "../utils/ai-proxy-utils";

/**
 * Creates axios instance for AI proxy API calls
 */
async function createAiProxyAxios(context: {
	regionUrl: string;
	authorization: string;
}): Promise<Result<AxiosInstance, Error>> {
	return ok(
		createAxiosClient({
			baseURL: composeAiProxyBaseUrl(context.regionUrl),
			headers: {
				Authorization: context.authorization,
			},
		}),
	);
}

// ============================================================================
// Query Operations
// ============================================================================

/**
 * List all tokens
 */
export const listTokens = async (
	context: { regionUrl: string; authorization: string },
	params?: { search?: { page?: number; perPage?: number } },
): Promise<unknown> => {
	const apiResult = await createAiProxyAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.get("/user/token", {
			params: params?.search,
		}),
		(error) => error as Error,
	).map((response) => response.data.data.tokens);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

// ============================================================================
// Mutation Operations
// ============================================================================

/**
 * Create AI proxy token
 */
export const createToken = async (
	context: { regionUrl: string; authorization: string },
	params: { body: { name: string } },
): Promise<unknown> => {
	const apiResult = await createAiProxyAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.post("/user/token", params.body),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

/**
 * Delete AI proxy token
 */
export const deleteToken = async (
	context: { regionUrl: string; authorization: string },
	params: { path: { id: number } },
): Promise<unknown> => {
	const apiResult = await createAiProxyAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.delete(`/user/token/${params.path.id}`),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};
