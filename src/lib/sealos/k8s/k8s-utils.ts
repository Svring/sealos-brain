"use client";

// Helper function to get kubeconfig from user
export function getKubeconfig(currentUser: any): string {
  return (
    currentUser?.tokens?.find((t: any) => t.type === "kubeconfig")?.value || ""
  );
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
    } catch (e) {
      console.warn("kubeconfig decode failed, fallback to raw string", e);
    }

    const lines = decoded.split("\n");

    // Retrieve current-context value
    let currentContext = "";
    for (const l of lines) {
      const t = l.trim();
      if (t.startsWith("current-context:")) {
        currentContext = t.split(":")[1].trim();
        break;
      }
    }
    if (!currentContext) return "ns-gapyo0ig";

    // Walk through contexts list and find namespace
    let inContexts = false;
    let candidateName: string | null = null;
    let candidateNs: string | null = null;
    for (const l of lines) {
      const raw = l;
      const t = raw.trim();

      if (!inContexts && t === "contexts:") {
        inContexts = true;
        continue;
      }
      if (!inContexts) continue;

      if (t === "users:") break;

      if (raw.startsWith("- ")) {
        if (candidateName === currentContext && candidateNs) return candidateNs;
        candidateName = null;
        candidateNs = null;
      }

      if (t.startsWith("name:")) {
        candidateName = t.split(":")[1].trim();
        if (candidateName === currentContext && candidateNs) return candidateNs;
      }

      if (t.startsWith("namespace:")) {
        candidateNs = t.split(":")[1].trim();
        if (candidateName === currentContext) return candidateNs;
      }
    }

    if (candidateName === currentContext && candidateNs) return candidateNs;

    return "ns-gapyo0ig";
  } catch (err) {
    console.warn("Failed to parse kubeconfig namespace", err);
    return "ns-gapyo0ig";
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
