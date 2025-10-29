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

// ===== TEST BLOCK =====
/**
 * Test block that only runs when file is directly executed
 *
 * Usage:
 * ```bash
 * TEST_REGION_URL=bja.sealos.run TEST_AUTHORIZATION=your_token bun packages/sealos/src/ai-proxy/api/ai-proxy.api.ts
 * ```
 *
 * Environment variables:
 * - TEST_REGION_URL: The region URL to test against (default: "bja.sealos.run")
 * - TEST_AUTHORIZATION: The authorization token (required)
 */
if (import.meta.url === `file://${process.argv[1]}`) {
	const testListTokens = async () => {
		console.log("Testing listTokens...");

		// Test parameters - replace with actual values for testing
		const testCtx = {
			regionUrl: process.env.TEST_REGION_URL || "bja.sealos.run",
			authorization: process.env.TEST_AUTHORIZATION || "",
		};

		if (!testCtx.authorization) {
			console.error(
				"ERROR: TEST_AUTHORIZATION environment variable is required",
			);
			process.exit(1);
		}

		try {
			const tokens = await listTokens(testCtx);
			console.log("✅ listTokens test passed!");
			console.log("Tokens:", JSON.stringify(tokens, null, 2));
		} catch (error) {
			console.error("❌ listTokens test failed:", error);
			process.exit(1);
		}
	};

	void testListTokens();
}
