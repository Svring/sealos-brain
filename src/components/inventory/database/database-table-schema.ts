import { z } from "zod";

export const databaseTableSchema = z.object({
  name: z.string(),
  status: z.string(),
  type: z.string(),
  createdAt: z.string(),
  cost: z.string(),
});

export type DatabaseColumn = z.infer<typeof databaseTableSchema>;