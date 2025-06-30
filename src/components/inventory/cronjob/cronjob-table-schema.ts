import { z } from "zod";

const cronjobColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  schedule: z.string(),
  nextRun: z.string(),
  lastRun: z.string(),
  createdAt: z.string(),
  graph: z.string(),
});

export type CronjobColumn = z.infer<typeof cronjobColumnSchema>;
