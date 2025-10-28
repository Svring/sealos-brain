"use server";

import { createAxiosClient } from "@sealos-brain/shared/network/utils";
import type { AxiosInstance } from "axios";
import type { AiProxyCreateData } from "../models";
import { composeAiProxyBaseUrl } from "../utils/ai-proxy-utils";

// ===== TYPES =====

export type AiProxyCreateTokenResponse = {
	code: number;
	data: unknown;
	message: string;
};

export type AiProxyDeleteTokenRequest = {
	id: number;
};

export type AiProxyDeleteTokenResponse = {
	code: number;
	message: string;
};

// ===== API CLIENT CREATION =====

export async function createAiProxyApi(
	baseUrl: string,
	authorization?: string,
): Promise<AxiosInstance> {
	return createAxiosClient({
		baseURL: composeAiProxyBaseUrl(baseUrl),
		headers: {
			...(authorization ? { Authorization: authorization } : {}),
		},
	});
}

// ===== MUTATION OPERATIONS =====

// Token Management
export async function createAiProxyToken(
	ctx: { regionUrl: string; authorization: string },
	request: AiProxyCreateData,
): Promise<AiProxyCreateTokenResponse> {
	const api = await createAiProxyApi(ctx.regionUrl, ctx.authorization);
	const response = await api.post("/user/token", request);
	return response.data;
}

export async function deleteAiProxyToken(
	ctx: { regionUrl: string; authorization: string },
	request: AiProxyDeleteTokenRequest,
): Promise<AiProxyDeleteTokenResponse> {
	const api = await createAiProxyApi(ctx.regionUrl, ctx.authorization);
	const response = await api.delete(`/user/token/${request.id}`);
	return response.data;
}

// ===== QUERY OPERATIONS =====

// Token Listing
export async function listTokens(ctx: {
	regionUrl: string;
	authorization: string;
}) {
	const api = await createAiProxyApi(ctx.regionUrl, ctx.authorization);
	const response = await api.get("/user/token", {
		params: { page: 1, perPage: 10 },
	});
	return response.data.data.tokens;
}
