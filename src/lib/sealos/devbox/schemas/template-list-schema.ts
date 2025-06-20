import { z } from "zod";

// Define the Template schema based on the actual API response
const TemplateSchema = z.object({
  uid: z.string().uuid(),
  name: z.string(),
  config: z.string(), // JSON string containing configuration
  image: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Define the Data schema
const DataSchema = z.object({
  templateList: z.array(TemplateSchema),
});

// Define the full Response schema
const ResponseSchema = z.object({
  code: z.number(),
  statusText: z.string(),
  message: z.string(),
  data: DataSchema,
});

// Export types
export type Template = z.infer<typeof TemplateSchema>;
export type TemplateListData = z.infer<typeof DataSchema>;
export type TemplateListResponse = z.infer<typeof ResponseSchema>;

// Export schemas
export { TemplateSchema, DataSchema, ResponseSchema };
