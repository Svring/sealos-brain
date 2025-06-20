import { z } from "zod";

const databaseColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  status: z.string(),
  createdAt: z.string(),
  cost: z.string(),
});

export type DatabaseColumn = z.infer<typeof databaseColumnSchema>;
