import type { BaseMessage } from "@langchain/core/messages";
import { MessagesZodMeta } from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";
import { z } from "zod/v4-mini";

export const State = z.object({
	kubeconfig: z.string(),
	apiKey: z.string(),
	messages: z
		.array(z.custom<BaseMessage>())
		.register(registry, MessagesZodMeta),
	trial: z.boolean(),
});

export type State = z.infer<typeof State>;
