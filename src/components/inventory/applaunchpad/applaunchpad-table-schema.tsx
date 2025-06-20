import { z } from "zod";

const appLaunchpadColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  createdAt: z.string(),
  replicas: z.string(),
  cost: z.string(),
});

export type AppLaunchpadColumn = z.infer<typeof appLaunchpadColumnSchema>;
