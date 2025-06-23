import { z } from "zod";

const objectstorageColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  type: z.string(),
  createdAt: z.string(),
});

export type ObjectstorageColumn = z.infer<typeof objectstorageColumnSchema>;
