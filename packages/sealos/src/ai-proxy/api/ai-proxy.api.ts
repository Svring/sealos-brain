"use server";

import { createAxiosClient } from "@sealos-brain/shared/network/utils";
import { composeAiProxyBaseUrl } from "../utils/ai-proxy-utils";

/**
 * Creates axios instance for AI proxy API calls
 */
async function createAiProxyAxios(context: {
	regionUrl: string;
	authorization: string;
}) {
	return createAxiosClient({
		baseURL: composeAiProxyBaseUrl(context.regionUrl),
		headers: {
			Authorization: context.authorization,
		},
	});
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
) => {
	const api = await createAiProxyAxios(context);
	const response = await api.get("/user/token", {
		params: params?.search,
	});
	return response.data.data.tokens;
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
) => {
	const api = await createAiProxyAxios(context);
	const response = await api.post("/user/token", params.body);
	return response.data;
};

/**
 * Delete AI proxy token
 */
export const deleteToken = async (
	context: { regionUrl: string; authorization: string },
	params: { path: { id: number } },
) => {
	const api = await createAiProxyAxios(context);
	const response = await api.delete(`/user/token/${params.path.id}`);
	return response.data;
};
