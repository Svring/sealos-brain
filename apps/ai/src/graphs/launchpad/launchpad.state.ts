import type { BaseMessage } from "@langchain/core/messages";
import { MessagesZodMeta } from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";
import { LaunchpadObjectSchema } from "@sealos-brain/sealos/launchpad/models";
import { z } from "zod/v4-mini";

export const State = z.object({
	kubeconfigEncoded: z.string(),
	apiKey: z.string(),
	baseURL: z.string(),
	modelName: z.string(),
	messages: z
		.array(z.custom<BaseMessage>())
		.register(registry, MessagesZodMeta),
	launchpadObject: LaunchpadObjectSchema,
});

export type State = z.infer<typeof State>;
