import { z } from "zod";

// Database Types Enum
export enum DBTypeEnum {
  postgresql = "postgresql",
  mongodb = "mongodb",
  mysql = "apecloud-mysql",
  redis = "redis",
  kafka = "kafka",
  qdrant = "qdrant",
  nebula = "nebula",
  weaviate = "weaviate",
  milvus = "milvus",
  pulsar = "pulsar",
  clickhouse = "clickhouse",
}

// Zod Schemas
export const DBTypeSchema = z.nativeEnum(DBTypeEnum);

export const DBVersionSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const DBTypeListItemSchema = z.object({
  id: DBTypeSchema,
  label: z.string(),
});

export const DBVersionMapSchema = z.record(
  DBTypeSchema,
  z.array(DBVersionSchema)
);

export const DBComponentSpecSchema = z.object({
  cpuMemory: z.object({
    limits: z.object({
      cpu: z.string(),
      memory: z.string(),
    }),
    requests: z.object({
      cpu: z.string(),
      memory: z.string(),
    }),
  }),
  storage: z.number(),
  other: z.record(z.any()).optional(),
});

export const AutoBackupSchema = z.object({
  start: z.boolean(),
  type: z.enum(["day", "week"]),
  week: z.array(z.number()),
  hour: z.string(),
  minute: z.string(),
  saveTime: z.number(),
  saveType: z.enum(["d", "w", "m"]),
});

export const DBEditSchema = z.object({
  dbType: DBTypeSchema,
  dbVersion: z.string(),
  dbName: z
    .string()
    .regex(/^[a-z]([-a-z0-9]*[a-z0-9])?$/)
    .max(30),
  replicas: z.number().min(1),
  cpu: z.number().min(100),
  memory: z.number().min(128),
  storage: z.number().min(1),
  labels: z.record(z.string()),
  terminationPolicy: z.enum(["Delete", "Halt", "DoNotTerminate", "WipeOut"]),
  autoBackup: AutoBackupSchema.optional(),
});

// Hardcoded Data
export const DB_TYPE_LIST = [
  { id: DBTypeEnum.postgresql, label: "PostgreSQL" },
  { id: DBTypeEnum.mongodb, label: "MongoDB" },
  { id: DBTypeEnum.mysql, label: "MySQL" },
  { id: DBTypeEnum.redis, label: "Redis" },
  { id: DBTypeEnum.kafka, label: "Kafka" },
  { id: DBTypeEnum.milvus, label: "Milvus" },
  { id: DBTypeEnum.qdrant, label: "Qdrant" },
  { id: DBTypeEnum.nebula, label: "Nebula" },
  { id: DBTypeEnum.weaviate, label: "Weaviate" },
  { id: DBTypeEnum.pulsar, label: "Pulsar" },
  { id: DBTypeEnum.clickhouse, label: "ClickHouse" },
] as const;

export const DB_VERSION_MAP = {
  [DBTypeEnum.postgresql]: [
    { id: "postgresql-12.14.0", label: "postgresql-12.14.0" },
    { id: "postgresql-12.15.0", label: "postgresql-12.15.0" },
    { id: "postgresql-14.7.2", label: "postgresql-14.7.2" },
    { id: "postgresql-14.8.0", label: "postgresql-14.8.0" },
    { id: "postgresql-15.2.0", label: "postgresql-15.2.0" },
  ],
  [DBTypeEnum.mongodb]: [
    { id: "mongodb-4.0", label: "mongodb-4.0" },
    { id: "mongodb-4.2", label: "mongodb-4.2" },
    { id: "mongodb-4.4", label: "mongodb-4.4" },
    { id: "mongodb-5.0", label: "mongodb-5.0" },
    { id: "mongodb-6.0", label: "mongodb-6.0" },
  ],
  [DBTypeEnum.mysql]: [
    { id: "ac-mysql-8.0.30", label: "ac-mysql-8.0.30" },
    { id: "ac-mysql-8.0.33", label: "ac-mysql-8.0.33" },
    { id: "ac-mysql-5.7.44", label: "ac-mysql-5.7.44" },
  ],
  [DBTypeEnum.redis]: [
    { id: "redis-7.0.6", label: "redis-7.0.6" },
    { id: "redis-6.2.13", label: "redis-6.2.13" },
    { id: "redis-5.0.14", label: "redis-5.0.14" },
  ],
  [DBTypeEnum.kafka]: [
    { id: "kafka-3.3.2", label: "kafka-3.3.2" },
    { id: "kafka-2.8.1", label: "kafka-2.8.1" },
  ],
  [DBTypeEnum.qdrant]: [
    { id: "qdrant-1.5.0", label: "qdrant-1.5.0" },
    { id: "qdrant-1.4.0", label: "qdrant-1.4.0" },
  ],
  [DBTypeEnum.nebula]: [
    { id: "nebula-v3.5.0", label: "nebula-v3.5.0" },
    { id: "nebula-v3.4.0", label: "nebula-v3.4.0" },
  ],
  [DBTypeEnum.weaviate]: [
    { id: "weaviate-1.18.0", label: "weaviate-1.18.0" },
    { id: "weaviate-1.17.0", label: "weaviate-1.17.0" },
  ],
  [DBTypeEnum.milvus]: [
    { id: "milvus-2.2.4", label: "milvus-2.2.4" },
    { id: "milvus-2.1.4", label: "milvus-2.1.4" },
  ],
  [DBTypeEnum.pulsar]: [
    { id: "pulsar-2.11.2", label: "pulsar-2.11.2" },
    { id: "pulsar-2.10.4", label: "pulsar-2.10.4" },
  ],
  [DBTypeEnum.clickhouse]: [
    { id: "clickhouse-22.9.4", label: "clickhouse-22.9.4" },
    { id: "clickhouse-22.8.8", label: "clickhouse-22.8.8" },
  ],
} as const;

export const DB_COMPONENT_NAME_MAP = {
  [DBTypeEnum.postgresql]: ["postgresql"],
  [DBTypeEnum.mongodb]: ["mongodb"],
  [DBTypeEnum.mysql]: ["mysql"],
  [DBTypeEnum.redis]: ["redis", "redis-sentinel"],
  [DBTypeEnum.kafka]: [
    "kafka-server",
    "kafka-broker",
    "controller",
    "kafka-exporter",
  ],
  [DBTypeEnum.qdrant]: ["qdrant"],
  [DBTypeEnum.nebula]: [
    "nebula-console",
    "nebula-graphd",
    "nebula-metad",
    "nebula-storaged",
  ],
  [DBTypeEnum.weaviate]: ["weaviate"],
  [DBTypeEnum.milvus]: ["milvus", "etcd", "minio"],
  [DBTypeEnum.pulsar]: ["bookies", "pulsar-proxy", "zookeeper"],
  [DBTypeEnum.clickhouse]: ["ch-keeper", "clickhouse", "zookeeper"],
} as const;

export const BACKUP_SUPPORTED_DB_TYPES = [
  DBTypeEnum.postgresql,
  DBTypeEnum.mongodb,
  DBTypeEnum.mysql,
  DBTypeEnum.redis,
] as const;

export const DEFAULT_DB_EDIT_VALUE = {
  dbType: DBTypeEnum.postgresql,
  dbVersion: "postgresql-14.8.0",
  dbName: "test-db",
  replicas: 1,
  cpu: 500, // 0.5 CPU cores in millicores
  memory: 512, // 512Mi
  storage: 3, // 3Gi
  labels: {},
  autoBackup: {
    start: true,
    type: "day" as const,
    week: [],
    hour: "23",
    minute: "00",
    saveTime: 7,
    saveType: "d" as const,
  },
  terminationPolicy: "Delete" as const,
} as const;

export const CPU_SLIDE_MARKS = [
  { label: "0.1", value: 100 },
  { label: "0.5", value: 500 },
  { label: "1", value: 1000 },
  { label: "2", value: 2000 },
  { label: "4", value: 4000 },
  { label: "8", value: 8000 },
] as const;

export const MEMORY_SLIDE_MARKS = [
  { label: "128Mi", value: 128 },
  { label: "256Mi", value: 256 },
  { label: "512Mi", value: 512 },
  { label: "1Gi", value: 1024 },
  { label: "2Gi", value: 2048 },
  { label: "4Gi", value: 4096 },
  { label: "8Gi", value: 8192 },
  { label: "16Gi", value: 16384 },
] as const;

// Type exports for TypeScript
export type DBType = z.infer<typeof DBTypeSchema>;
export type DBVersion = z.infer<typeof DBVersionSchema>;
export type DBTypeListItem = z.infer<typeof DBTypeListItemSchema>;
export type DBVersionMap = z.infer<typeof DBVersionMapSchema>;
export type DBEdit = z.infer<typeof DBEditSchema>;
export type AutoBackup = z.infer<typeof AutoBackupSchema>;

// Validation functions
export const validateDBEdit = (data: unknown): DBEdit => {
  return DBEditSchema.parse(data);
};

export const validateDBType = (data: unknown): DBType => {
  return DBTypeSchema.parse(data);
};

export const validateDBVersionMap = (data: unknown): DBVersionMap => {
  return DBVersionMapSchema.parse(data);
};
