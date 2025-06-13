import { z } from "zod";

// Define the Tag schema
const TagSchema = z.object({
  uid: z.string().uuid(),
  type: z.enum(["OFFICIAL_CONTENT", "PROGRAMMING_LANGUAGE", "USE_CASE"]),
  name: z.string(),
  zhName: z.string(),
  enName: z.string(),
});

// Define the TemplateRepositoryTag schema
const TemplateRepositoryTagSchema = z.object({
  tag: TagSchema,
});

// Define the TemplateRepository schema
const TemplateRepositorySchema = z.object({
  kind: z.enum(["LANGUAGE", "FRAMEWORK", "OS", "SERVICE"]),
  iconId: z.string(),
  name: z.string(),
  uid: z.string().uuid(),
  description: z.string(),
  templateRepositoryTags: z.array(TemplateRepositoryTagSchema),
});

// Define the Data schema
const DataSchema = z.object({
  templateRepositoryList: z.array(TemplateRepositorySchema),
});

// Define the full Response schema
const ResponseSchema = z.object({
  code: z.number(),
  statusText: z.string(),
  message: z.string(),
  data: DataSchema,
});

export { ResponseSchema };
