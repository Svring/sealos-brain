# Bridge Query API

This module provides a declarative way to fetch and compose Kubernetes resources based on Zod schemas with special description annotations.

## Overview

The bridge query system allows you to:
1. Define a Zod schema with resource descriptions in field descriptions
2. Automatically fetch related Kubernetes resources
3. Extract and transform data from resources
4. Compose a typed object matching your schema

## Usage

### 1. Define a Schema with Resource Descriptions

```typescript
import { z } from "zod";

export const DevboxBridgeSchema = z.object({
  name: z.any().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["metadata.name"],
    }),
  ),
  status: z.any().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["status.phase"],
    }),
  ),
  pods: z
    .any()
    .optional()
    .describe(
      JSON.stringify({
        resourceType: "pod",
        label: "app.kubernetes.io/name",
      }),
    ),
});
```

### 2. Compose Object from Target

```typescript
import { composeObjectFromTarget } from "@/lib/bridge/bridge-query.api";
import { DevboxBridgeSchema } from "./devbox-bridge.model";

const devboxObject = await composeObjectFromTarget(
  context,
  {
    type: "custom",
    resourceType: "devbox",
    name: "my-devbox",
  },
  DevboxBridgeSchema,
);
```

## Resource Description Format

Each field description should be a JSON string with the following structure:

```typescript
{
  resourceType: string;    // The type of resource to fetch (e.g., "pod", "devbox")
  path?: string[];         // Path to extract data from the resource
  label?: string;          // Label key to use for filtering (value will be instanceName)
  name?: string;           // Name pattern (supports {{instanceName}} placeholder and regex)
}
```

### Special Cases

- **External resources**: Use `resourceType: "external"` for fields that don't come from K8s
- **List resources**: Omit `path` or use `path: [""]` to return the full resource list
- **Name patterns**: Use `{{instanceName}}` placeholder or regex patterns
- **Label filtering**: Specify `label` to filter resources by label (e.g., `label: "app.kubernetes.io/name"`)

## Architecture

### Files

- `bridge-query.api.ts`: Main API functions for fetching and composing resources
- `bridge-query.utils.ts`: Utility functions for schema parsing and data extraction
- `models/bridge-query.model.ts`: Zod schemas for resource descriptions

### Key Functions

#### `composeObjectFromTarget(context, target, schema)`
Main function that orchestrates the entire process:
1. Parses schema descriptions
2. Fetches resources with caching
3. Extracts data from resources
4. Reconstructs arrays
5. Validates with Zod schema

#### `parseFieldDescriptions(schema)`
Extracts resource descriptions from Zod schema field descriptions.

#### `getResourcesByFieldDescriptions(context, descriptions, instanceName)`
Fetches resources with intelligent caching to avoid duplicate API calls.

#### `extractDataFromResources(entries, descriptions)`
Extracts data from fetched resources using path specifications.

## Migration from Old System

The new system simplifies the old approach:

**Old way** (devbox-bridge-query.ts):
- Manual resource fetching
- Manual enrichment with services/ingresses
- Manual port mapping
- Lots of imperative code

**New way**:
- Declarative schema definitions
- Automatic resource fetching
- Automatic data extraction
- Zod transforms for enrichment

## Benefits

1. **Declarative**: Define what you need, not how to get it
2. **Type-safe**: Full TypeScript support with Zod
3. **Efficient**: Automatic caching prevents duplicate API calls
4. **Maintainable**: Schema-driven approach is easier to understand
5. **Reusable**: Same utilities work for any resource type

