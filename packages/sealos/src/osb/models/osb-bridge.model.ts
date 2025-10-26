import { z } from "zod";

export const OsbBridgeMetaSchema = z.object({
	name: z.string().meta({
		resources: {
			resourceType: "objectstoragebucket",
			path: ["metadata.name"],
		},
	}),
	uid: z.string().meta({
		resources: {
			resourceType: "objectstoragebucket",
			path: ["metadata.uid"],
		},
	}),
	displayName: z.string().meta({
		resources: {
			resourceType: "objectstoragebucket",
			path: ["status.name"],
		},
	}),
	kind: z.string().meta({
		resources: {
			resourceType: "objectstoragebucket",
			path: ["kind"],
		},
	}),
	policy: z.string().meta({
		resources: {
			resourceType: "objectstoragebucket",
			path: ["spec.policy"],
		},
	}),
	access: z.object({
		accessKey: z.string().meta({
			resources: {
				resourceType: "secret",
				name: "^object-storage-key-.*-{{instanceName}}$",
				path: ["data.accessKey"],
			},
		}),
		bucket: z.string().meta({
			resources: {
				resourceType: "secret",
				name: "^object-storage-key-.*-{{instanceName}}$",
				path: ["data.bucket"],
			},
		}),
		external: z.string().meta({
			resources: {
				resourceType: "secret",
				name: "^object-storage-key-.*-{{instanceName}}$",
				path: ["data.external"],
			},
		}),
		internal: z.string().meta({
			resources: {
				resourceType: "secret",
				name: "^object-storage-key-.*-{{instanceName}}$",
				path: ["data.internal"],
			},
		}),
		secretKey: z.string().meta({
			resources: {
				resourceType: "secret",
				name: "^object-storage-key-.*-{{instanceName}}$",
				path: ["data.secretKey"],
			},
		}),
	}),
});

export type OsbBridgeMeta = z.infer<typeof OsbBridgeMetaSchema>;
