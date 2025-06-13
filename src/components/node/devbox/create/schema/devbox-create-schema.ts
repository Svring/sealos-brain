import { z } from "zod";

export const devboxCreateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  templateRepositoryUid: z.string().nonempty("Please select a repository"),
  templateUid: z.string().nonempty("Please select a template"),
  image: z.string().optional(),
  templateConfig: z.string().optional(),
  cpu: z.number().min(1000).optional(),
  memory: z.number().min(2048).optional(),
  gpu: z
    .object({
      type: z.string().optional(),
      amount: z.number().min(1).optional(),
    })
    .optional(),
  networks: z
    .array(
      z.object({
        networkName: z.string().optional(),
        portName: z.string(),
        port: z.number().min(1).max(65535),
        protocol: z.enum(["HTTP", "GRPC", "WS"]),
        openPublicDomain: z.boolean(),
        publicDomain: z.string().optional(),
        customDomain: z.string().optional(),
        id: z.string().optional(),
      })
    )
    .optional(),
});

// Infer the type from the schema
export type DevboxFormValues = z.infer<typeof devboxCreateSchema>;
