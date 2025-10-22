export const CLUSTER_ALL_TYPES = [
	"postgresql",
	"mongodb",
	"redis",
	"apecloud-mysql",
	"kafka",
	"milvus",
	"weaviate",
] as const;

export const CLUSTER_AVAILABLE_TYPES = [
	"postgresql",
	"mongodb",
	"redis",
	"apecloud-mysql",
	"kafka",
	"milvus",
] as const;

export type ClusterType = (typeof CLUSTER_ALL_TYPES)[number];
