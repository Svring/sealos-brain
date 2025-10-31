"use server";

import { createAxiosClient } from "@sealos-brain/shared/network/utils";
import type { AxiosInstance } from "axios";
import {
	errAsync,
	fromPromise,
	ok,
	type Result,
	type ResultAsync,
} from "neverthrow";
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
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createAiProxyAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.get("/user/token", {
			params: params?.search,
		}),
		(error) => error as Error,
	).map((response) => response.data.data.tokens);
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
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createAiProxyAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.post("/user/token", params.body),
		(error) => error as Error,
	).map((response) => response.data);
};

/**
 * Delete AI proxy token
 */
export const deleteToken = async (
	context: { regionUrl: string; authorization: string },
	params: { path: { id: number } },
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createAiProxyAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.delete(`/user/token/${params.path.id}`),
		(error) => error as Error,
	).map((response) => response.data);
};
