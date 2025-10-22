import { z } from "zod";

// Single AI Proxy Token Schema
export const AiProxyTokenSchema = z.object({
	key: z.string(),
	name: z.string(),
	group: z.string(),
	subnets: z.any().nullable(),
	models: z.any().nullable(),
	status: z.number(),
	id: z.number(),
	used_amount: z.number(),
	request_count: z.number(),
	quota: z.number(),
	period_quota: z.number(),
	period_type: z.string(),
	period_last_update_amount: z.number(),
	created_at: z.number(),
	period_last_update_time: z.number(),
	accessed_at: z.number(),
});

// AI Proxy Token List Response Schema
export const AiProxyTokenListSchema = z.object({
	tokens: z.array(AiProxyTokenSchema),
	total: z.number(),
});

// Type exports
export type AiProxyToken = z.infer<typeof AiProxyTokenSchema>;
export type AiProxyTokenList = z.infer<typeof AiProxyTokenListSchema>;
