import { z } from "zod";

export const ClusterObjectResourceSchema = z.object({
	cpu: z.number(),
	memory: z.number(),
	storage: z.number(),
	replicas: z.number(),
});

export const ClusterComponentSchema = z.object({
	name: z.string().nullable().optional(),
	status: z.string().nullable().optional(),
	resource: ClusterObjectResourceSchema.nullable().optional(),
});

export const ClusterConnectionSchema = z.object({
	privateConnection: z
		.object({
			endpoint: z.string().nullable().optional(),
			host: z.string().nullable().optional(),
			port: z.string().nullable().optional(),
			username: z.string().nullable().optional(),
			password: z.string().nullable().optional(),
			connectionString: z.string().nullable().optional(),
		})
		.nullable()
		.optional(),
	publicConnection: z
		.union([
			z.object({
				port: z.number().nullable().optional(),
				connectionString: z.string().nullable().optional(),
			}),
			z.array(z.any()),
		])
		.nullable()
		.optional(),
});

export const ClusterBackupSchema = z
	.object({
		cronExpression: z.string().optional(),
		enabled: z.boolean().optional(),
		method: z.string().optional(),
		pitrEnabled: z.boolean().optional(),
		repoName: z.string().optional(),
		retentionPeriod: z.string().optional(),
	})
	.optional();

export const PodSchema = z.object({
	name: z.string().nullable().optional(),
	status: z.string().nullable().optional(),
	upTime: z.string().optional().nullable(),
	containers: z.any().nullable().optional(),
});

export const ClusterObjectSchema = z.object({
	name: z.string(),
	uid: z.string(),
	resourceType: z.string().default("cluster"),
	type: z.enum([
		"postgresql",
		"mongodb",
		"redis",
		"apecloud-mysql",
		"kafka",
		"milvus",
		"weaviate",
	]),
	version: z.string(),
	operationalStatus: z.any(),
	status: z.string(),
	resource: ClusterObjectResourceSchema,
	components: z
		.union([z.array(ClusterComponentSchema), z.object({}).passthrough()])
		.optional()
		.nullable(),
	connection: ClusterConnectionSchema,
	backup: ClusterBackupSchema.optional().nullable(),
	pods: z.array(PodSchema).optional().nullable(),
});

export type ClusterObjectResource = z.infer<typeof ClusterObjectResourceSchema>;
export type ClusterComponent = z.infer<typeof ClusterComponentSchema>;
export type ClusterConnection = z.infer<typeof ClusterConnectionSchema>;
export type ClusterBackup = z.infer<typeof ClusterBackupSchema>;
export type ClusterObject = z.infer<typeof ClusterObjectSchema>;
export type Pod = z.infer<typeof PodSchema>;
