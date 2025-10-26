import { z } from "zod";

// Transform functions

// biome-ignore lint/suspicious/noExplicitAny: Generic base64 transformation
const transformAccessKey = (val: any) =>
	Buffer.from(val, "base64").toString("utf-8");

// biome-ignore lint/suspicious/noExplicitAny: Generic base64 transformation
const transformBucket = (val: any) =>
	Buffer.from(val, "base64").toString("utf-8");

// biome-ignore lint/suspicious/noExplicitAny: Generic base64 transformation
const transformExternal = (val: any) =>
	Buffer.from(val, "base64").toString("utf-8");

// biome-ignore lint/suspicious/noExplicitAny: Generic base64 transformation
const transformInternal = (val: any) =>
	Buffer.from(val, "base64").toString("utf-8");

// biome-ignore lint/suspicious/noExplicitAny: Generic base64 transformation
const transformSecretKey = (val: any) =>
	Buffer.from(val, "base64").toString("utf-8");

// Transform schema
export const OsbBridgeTransSchema = z.object({
	name: z.any(),
	uid: z.any(),
	displayName: z.any(),
	kind: z.any(),
	policy: z.any(),
	access: z.object({
		accessKey: z.string().transform(transformAccessKey),
		bucket: z.string().transform(transformBucket),
		external: z.string().transform(transformExternal),
		internal: z.string().transform(transformInternal),
		secretKey: z.string().transform(transformSecretKey),
	}),
});
