"use server";

import https from "node:https";
import axios, { type AxiosInstance } from "axios";
import type { AiProxyCreateData } from "@/ai-proxy/models/ai-proxy-create.model";
import { composeAiProxyBaseUrl } from "@/ai-proxy/utils/ai-proxy-utils";

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
	const isDevelopment = process.env.MODE === "development";
	return axios.create({
		baseURL: composeAiProxyBaseUrl(baseUrl),
		headers: {
			"Content-Type": "application/json",
			...(authorization ? { Authorization: authorization } : {}),
		},
		httpsAgent: isDevelopment
			? new https.Agent({ rejectUnauthorized: false })
			: undefined,
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
export async function getAiProxyTokens(ctx: {
	regionUrl: string;
	authorization: string;
}) {
	const api = await createAiProxyApi(ctx.regionUrl, ctx.authorization);
	const response = await api.get("/user/token", {
		params: { page: 1, perPage: 10 },
	});
	return response.data.data.tokens;
}
