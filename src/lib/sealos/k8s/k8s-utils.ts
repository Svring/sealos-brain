"use client";

import type { User } from "@/payload-types";

// Helper function to get kubeconfig from user
export function getKubeconfig(currentUser: User): string {
  return (
    currentUser?.tokens?.find((t: any) => t.type === "kubeconfig")?.value || ""
  );
}

function getCurrentContext(lines: string[]): string {
  let currentContext = "";
  for (const l of lines) {
    const t = l.trim();
    if (t.startsWith("current-context:")) {
      currentContext = t.split(":")[1].trim();
      break;
    }
  }
  return currentContext;
}

function findContextsSection(lines: string[]): string[] {
  const contextsStart = lines.findIndex((line) => line.trim() === "contexts:");
  if (contextsStart === -1) {
    return [];
  }

  const usersStart = lines.findIndex(
    (line, index) => index > contextsStart && line.trim() === "users:"
  );

  const endIndex = usersStart === -1 ? lines.length : usersStart;
  return lines.slice(contextsStart + 1, endIndex);
}

function processContextLine(
  line: string,
  context: string,
  state: { name: string | null; ns: string | null }
): string | null {
  const trimmed = line.trim();

  if (line.startsWith("- ")) {
    if (state.name === context && state.ns) {
      return state.ns;
    }
    state.name = null;
    state.ns = null;
  }

  if (trimmed.startsWith("name:")) {
    state.name = trimmed.split(":")[1].trim();
  }

  if (trimmed.startsWith("namespace:")) {
    state.ns = trimmed.split(":")[1].trim();
    if (state.name === context) {
      return state.ns;
    }
  }

  return null;
}

function parseContextEntry(lines: string[], context: string): string | null {
  const state = { name: null as string | null, ns: null as string | null };

  for (const line of lines) {
    const result = processContextLine(line, context, state);
    if (result) {
      return result;
    }
  }

  return state.name === context && state.ns ? state.ns : null;
}

function getNamespaceForContext(
  lines: string[],
  context: string
): string | null {
  const contextLines = findContextsSection(lines);
  return parseContextEntry(contextLines, context);
}

// Helper function to extract namespace from kubeconfig
export function getNamespaceFromKubeconfig(kubeconfigYaml: string): string {
  try {
    // Decode URL-encoded kubeconfig
    let decoded = kubeconfigYaml;
    try {
      if (kubeconfigYaml.includes("%") || kubeconfigYaml.includes("+")) {
        decoded = decodeURIComponent(kubeconfigYaml);
      }
    } catch {
      // kubeconfig decode failed, fallback to raw string
    }

    const lines = decoded.split("\n");
    const currentContext = getCurrentContext(lines);
    const ns = getNamespaceForContext(lines, currentContext);
    return ns || "default";
  } catch {
    // Failed to parse kubeconfig namespace
    return "default";
  }
}

// Resource definitions (copied from k8s-actions.ts for shared use)
export const RESOURCES = {
  devbox: {
    group: "devbox.sealos.io",
    version: "v1alpha1",
    plural: "devboxes",
  },
  cluster: {
    group: "apps.kubeblocks.io",
    version: "v1alpha1",
    plural: "clusters",
  },
  deployment: {
    apiVersion: "apps/v1",
    kind: "Deployment",
  },
  cronjob: {
    apiVersion: "batch/v1",
    kind: "CronJob",
  },
  objectstoragebucket: {
    group: "objectstorage.sealos.io",
    version: "v1",
    plural: "objectstoragebuckets",
  },
};

export type ResourceType = keyof typeof RESOURCES;

// Shared annotation keys for graph functionality
export const GRAPH_ANNOTATION_KEY = "sealosBrain/graphName";
export const GRAPH_EDGES_ANNOTATION_KEY = "sealosBrain/graphEdges";
