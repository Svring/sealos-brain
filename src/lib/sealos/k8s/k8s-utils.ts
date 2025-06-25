"use client";

import type { User } from "@/payload-types";
import { getCurrentContextWithNamespace } from "./k8s-actions";

// Helper function to get kubeconfig from user
export function getKubeconfig(currentUser: User): string {
  const kubeconfig =
    currentUser?.tokens?.find((t: any) => t.type === "kubeconfig")?.value || "";
  return decodeKubeconfig(kubeconfig);
}

// Dedicated function to decode kubeconfig if needed
export function decodeKubeconfig(kubeconfig: string): string {
  try {
    if (kubeconfig.includes("%") || kubeconfig.includes("+")) {
      return decodeURIComponent(kubeconfig);
    }
  } catch (error) {
    console.warn("Failed to decode kubeconfig, using original:", error);
  }
  return kubeconfig;
}

// Helper function to extract namespace from kubeconfig
export async function getNamespaceFromKubeconfig(
  kubeconfigYaml: string
): Promise<string> {
  try {
    const decoded = decodeKubeconfig(kubeconfigYaml);
    const ctx = await getCurrentContextWithNamespace(decoded);
    return ctx.namespace ?? "default";
  } catch {
    // Failed to parse kubeconfig namespace
    return "default";
  }
}
