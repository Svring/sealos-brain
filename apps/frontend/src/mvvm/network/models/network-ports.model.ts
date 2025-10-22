import { z } from "zod";

/**
 * Zod schema for composed port objects
 */
export const ObjectPortSchema = z.object({
	number: z.number(),
	portName: z.string().optional(),
	protocol: z.string().optional(),
	serviceName: z.string().optional(),
	privateAddress: z.string().optional(),
	privateHost: z.string().optional(),
	nodePort: z.number().optional(),
	publicAddress: z.string().optional(),
	publicHost: z.string().optional(),
	customDomain: z.string().optional(),
});

export type ObjectPort = z.infer<typeof ObjectPortSchema>;
