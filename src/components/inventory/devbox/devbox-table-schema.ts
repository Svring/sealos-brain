import { z } from "zod";

const devboxColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  createdAt: z.string(),
  cost: z.string(),
});

export type DevboxColumn = z.infer<typeof devboxColumnSchema>;
