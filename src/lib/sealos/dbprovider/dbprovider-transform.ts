import { z } from "zod";

export interface DBProviderNodeDisplayData extends Record<string, unknown> {
  id: string;
  state: "Running" | "Stopped" | "Unknown" | "Creating" | "Failed";
  dbType: string;
  dbName: string;
  dbVersion?: string;
  replicas?: number;
}

// Define the actual API response structure based on the provided data
export interface DBProviderAPIItem {
  id: string;
  name: string;
  dbType: string;
  status: {
    label: string;
    value: string;
    color: string;
    backgroundColor: string;
    dotColor: string;
  };
  createTime: string;
  cpu: number;
  memory: number;
  totalCpu: number;
  totalMemory: number;
  storage: number;
  totalStorage: number;
  replicas: number;
  conditions: Array<{
    lastTransitionTime: string;
    message: string;
    observedGeneration?: number;
    reason: string;
    status: string;
    type: string;
  }>;
  isDiskSpaceOverflow: boolean;
  labels: {
    "clusterdefinition.kubeblocks.io/name": string;
    "clusterversion.kubeblocks.io/name": string;
    "sealos-db-provider-cr": string;
  };
  source: {
    hasSource: boolean;
    sourceName: string;
    sourceType: string;
  };
}

/**
 * Transform DBProvider list into lightweight node display data
 * Only includes data needed for node rendering
 */
export const transformDBProviderListIntoNode = (
  data: DBProviderAPIItem[]
): DBProviderNodeDisplayData[] => {
  if (!Array.isArray(data)) {
    console.error("Expected array but got:", typeof data, data);
    return [];
  }

  return data
    .map((dbProvider): DBProviderNodeDisplayData | null => {
      if (!dbProvider || typeof dbProvider !== "object") return null;

      const dbName = dbProvider.name;
      const dbType = capitalizeDBType(dbProvider.dbType);
      const dbVersion =
        dbProvider.labels?.["clusterversion.kubeblocks.io/name"];

      // Map the status value to our node states
      let state: DBProviderNodeDisplayData["state"] = "Unknown";
      if (dbProvider.status?.value) {
        switch (dbProvider.status.value.toLowerCase()) {
          case "running":
            state = "Running";
            break;
          case "stopped":
          case "paused":
            state = "Stopped";
            break;
          case "creating":
          case "starting":
            state = "Creating";
            break;
          case "failed":
          case "error":
            state = "Failed";
            break;
          default:
            state = "Unknown";
        }
      }

      const replicas = dbProvider.replicas;

      return {
        id: `dbprovider-${dbName}`,
        state,
        dbType,
        dbName,
        dbVersion,
        replicas,
      };
    })
    .filter((item): item is DBProviderNodeDisplayData => item !== null);
};

/**
 * Capitalize database type for display
 * Maps database types to proper capitalized names
 */
function capitalizeDBType(dbType: string): string {
  const lowerType = dbType.toLowerCase();

  switch (lowerType) {
    case "postgresql":
    case "postgres":
      return "PostgreSQL";
    case "mongodb":
    case "mongo":
      return "MongoDB";
    case "mysql":
      return "MySQL";
    case "redis":
      return "Redis";
    case "kafka":
      return "Kafka";
    case "qdrant":
      return "Qdrant";
    case "nebula":
      return "Nebula";
    case "weaviate":
      return "Weaviate";
    case "milvus":
      return "Milvus";
    case "pulsar":
      return "Pulsar";
    case "clickhouse":
      return "ClickHouse";
    default:
      // Capitalize first letter of unknown types
      return dbType.charAt(0).toUpperCase() + dbType.slice(1);
  }
}

/**
 * Get the appropriate icon/logo for a database type
 */
export function getDBTypeIcon(dbType: string): string {
  const lowerType = dbType.toLowerCase();

  // You can customize these paths based on your icon assets
  if (lowerType.includes("postgresql") || lowerType.includes("postgres")) {
    return "https://dbprovider.cloud.sealos.io/icons/postgresql.svg";
  }
  if (lowerType.includes("mongodb") || lowerType.includes("mongo")) {
    return "https://dbprovider.cloud.sealos.io/icons/mongodb.svg";
  }
  if (lowerType.includes("mysql")) {
    return "https://dbprovider.cloud.sealos.io/icons/mysql.svg";
  }
  if (lowerType.includes("redis")) {
    return "https://dbprovider.cloud.sealos.io/icons/redis.svg";
  }
  if (lowerType.includes("kafka")) {
    return "https://dbprovider.cloud.sealos.io/icons/kafka.svg";
  }

  // Fallback to a generic database icon
  return "https://dbprovider.cloud.sealos.io/icons/database.svg";
}

/**
 * Transform database list into table data format
 * Converts API response to format expected by the DatabaseColumn schema
 */
export const transformDatabaseListToTable = (data: DBProviderAPIItem[]) => {
  if (!Array.isArray(data)) {
    console.error("Expected array but got:", typeof data, data);
    return [];
  }

  return data
    .map((database) => {
      if (!database || typeof database !== "object") return null;

      const dbName = database.name;
      const dbType = capitalizeDBType(database.dbType);

      // Get status from the database object
      const status =
        database.status?.label || database.status?.value || "Unknown";

      // Format creation timestamp
      const createdAt = new Date(database.createTime).toLocaleDateString();

      // Calculate estimated cost based on resources
      const cpu = database.cpu || 0;
      const memory = database.memory || 0;
      const storage = database.storage || 0;
      const cost = `$${(cpu * 0.001 + memory * 0.0001 + storage * 0.01).toFixed(2)}/day`;

      return {
        id: `database-${dbName}`,
        name: dbName,
        type: dbType,
        status,
        createdAt,
        cost,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
};
