import { z } from "zod";

export const objectStorageTableSchema = z.object({
  name: z.string(),
  status: z.string(),
  size: z.string(),
  createdAt: z.string(),
  graph: z.string(),
});

export type ObjectStorageColumn = z.infer<typeof objectStorageTableSchema>;
