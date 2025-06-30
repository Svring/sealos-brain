import { z } from "zod";

const aiproxyColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  token: z.string(),
  count: z.string(),
  charged: z.string(),
  createdAt: z.string(),
  graph: z.string(),
});

export type AiproxyColumn = z.infer<typeof aiproxyColumnSchema>;
