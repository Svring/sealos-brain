import { z } from "zod";

// Schema for each service object
const ServiceSchema = z.object({
  ready: z.boolean(),
  url: z.string().url(), // Ensures the URL is valid
  error: z.string(),
});

// Schema for the entire data structure
const ServiceDataSchema = z.object({
  data: z.array(ServiceSchema),
});

export { ServiceDataSchema, ServiceSchema };
