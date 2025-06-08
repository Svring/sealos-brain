import { z } from 'zod';

export const availableModels = z.object({
  models: z.array(z.string()),
});

export const agentChatResponse = z.object({
  response: z.string(),
});