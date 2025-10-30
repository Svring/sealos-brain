import type { BaseMessage } from "@langchain/core/messages";
import { MessagesZodMeta } from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";
import { DevboxObjectSchema } from "@sealos-brain/sealos/devbox/models";
import { z } from "zod/v4-mini";

export const State = z.object({
	kubeconfigEncoded: z.string(),
	apiKey: z.string(),
	baseURL: z.string(),
	modelName: z.string(),
	messages: z
		.array(z.custom<BaseMessage>())
		.register(registry, MessagesZodMeta),
	devboxObject: DevboxObjectSchema,
});

export type State = z.infer<typeof State>;
