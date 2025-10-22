import { z } from "zod";

export const TemplateResourceSchema = z.object({
	cpu: z.number(),
	memory: z.number(),
	storage: z.number(),
	nodeport: z.number(),
});

export const TemplateInputSchema = z.object({
	description: z.string(),
	type: z.string(),
	default: z.string(),
	required: z.boolean(),
});

export const TemplateObjectSchema = z.object({
	name: z.string(),
	resourceType: z.literal("template"),
	resource: TemplateResourceSchema,
	readme: z.string().url(),
	icon: z.string().url(),
	description: z.string(),
	gitRepo: z.string().url(),
	category: z.array(z.string()),
	input: z.record(z.string(), TemplateInputSchema),
	deployCount: z.number(),
});

export const TemplateItemSchema = TemplateObjectSchema.omit({ resource: true });

export type TemplateObject = z.infer<typeof TemplateObjectSchema>;
export type TemplateItem = z.infer<typeof TemplateItemSchema>;
export type TemplateResource = z.infer<typeof TemplateResourceSchema>;
export type TemplateInput = z.infer<typeof TemplateInputSchema>;
