import { useQuery } from "@tanstack/react-query";
import {
  devboxByNameOptions,
  sshConnectionInfoOptions,
} from "@/lib/sealos/devbox/devbox-query";
import { directDevboxSecretOptions } from "@/lib/sealos/k8s/k8s-query";
import type { User } from "@/payload-types";
import { useSealosStore } from "@/store/sealos-store";
import { executeSSHCommand } from "./devpod-action";

export interface SSHConfig {
  host: string;
  port?: number;
  username: string;
  privateKey?: string;
}

export interface SSHCommandResult {
  stdout: string;
  stderr: string;
  code: number;
}

export interface DevboxSecretData {
  data?: {
    host?: string;
    port?: string;
    username?: string;
    privateKey?: string;
  };
}

/**
 * Format and decode a private key for SSH connection
 * @param privateKey - Raw private key (may be base64 encoded)
 * @returns Formatted private key string
 */
export function formatPrivateKey(privateKey?: string): string | undefined {
  if (!privateKey) {
    return;
  }

  let decodedKey = privateKey;

  // Try to decode base64 if it doesn't contain PEM markers
  if (!(privateKey.includes("-----BEGIN") || privateKey.includes("-----END"))) {
    try {
      // Decode base64 in Node.js environment
      decodedKey = Buffer.from(privateKey, "base64").toString("utf-8");
    } catch {
      throw new Error("Invalid base64 private key format");
    }
  }

  return decodedKey;
}

/**
 * Extract SSH configuration from devbox secret data
 * @param secretData - The secret data from Kubernetes
 * @returns SSH configuration object
 */
export function extractSSHConfigFromSecret(
  secretData: DevboxSecretData
): SSHConfig | null {
  if (!secretData?.data) {
    return null;
  }

  try {
    // Extract base64 encoded values from secret
    const host = secretData.data.host
      ? Buffer.from(secretData.data.host, "base64").toString("utf-8")
      : "";
    const port = secretData.data.port
      ? Buffer.from(secretData.data.port, "base64").toString("utf-8")
      : "22";
    const username = secretData.data.username
      ? Buffer.from(secretData.data.username, "base64").toString("utf-8")
      : "";
    const privateKey = secretData.data.privateKey
      ? Buffer.from(secretData.data.privateKey, "base64").toString("utf-8")
      : undefined;

    if (!(host && username)) {
      return null;
    }

    return {
      host,
      port: Number.parseInt(port, 10),
      username,
      privateKey,
    };
  } catch {
    return null;
  }
}

/**
 * Create SSH configuration from devbox connection info
 * @param connectionInfo - Devbox connection information
 * @returns SSH configuration object
 */
export function createSSHConfigFromDevboxInfo(connectionInfo: {
  ssh_credentials: {
    host: string;
    port?: string | number;
    username: string;
    privateKey?: string;
  };
}): SSHConfig {
  const { ssh_credentials } = connectionInfo;

  return {
    host: ssh_credentials.host,
    port: ssh_credentials.port
      ? Number.parseInt(ssh_credentials.port.toString(), 10)
      : 22,
    username: ssh_credentials.username,
    privateKey: ssh_credentials.privateKey,
  };
}

/**
 * Get SSH credentials for a devbox by combining SSH info and devbox details
 * @param devboxName - Name of the devbox
 * @returns SSH configuration with host (region URL), port (from devbox), username and privateKey (from SSH info)
 */
export function useDevboxSSHCredentials(devboxName: string) {
  const { currentUser, regionUrl } = useSealosStore();

  // Query SSH connection info
  const sshInfoQuery = useQuery(
    sshConnectionInfoOptions(
      currentUser,
      regionUrl,
      devboxName,
      (data) => data // Extract the data field from response
    )
  );

  // Query devbox details
  const devboxQuery = useQuery(
    devboxByNameOptions(
      currentUser,
      regionUrl,
      devboxName,
      (data) => data // Extract the data field from response
    )
  );

  // Combine the results into SSH config
  const sshConfig: SSHConfig | null = (() => {
    if (!(sshInfoQuery.data && devboxQuery.data)) {
      return null;
    }

    try {
      const sshInfo = sshInfoQuery.data;
      const devboxInfo = devboxQuery.data;

      // Extract username from SSH info
      const username = sshInfo.userName;

      // Extract and decode private key from SSH info
      const privateKey = sshInfo.base64PrivateKey
        ? Buffer.from(sshInfo.base64PrivateKey, "base64").toString("utf-8")
        : undefined;

      // Extract SSH port from devbox info
      const port = devboxInfo.sshPort;

      if (!(regionUrl && username && privateKey && port)) {
        return null;
      }

      return {
        host: regionUrl,
        port,
        username,
        privateKey,
      };
    } catch {
      return null;
    }
  })();

  return sshConfig;
}

/**
 * Get the Kubernetes Secret for a devbox using the direct k8s query
 * @param currentUser - The current user object
 * @param devboxName - The name of the devbox
 * @returns The secret data (query result)
 */
export function useDevboxSecret(currentUser: User, devboxName: string) {
  return useQuery(directDevboxSecretOptions(currentUser, devboxName));
}

/**
 * Kill devbox ports 52323/tcp and 3000/tcp
 */
export function killDevboxPorts(
  sshConfig: SSHConfig
): Promise<SSHCommandResult> {
  return executeSSHCommand(sshConfig, "fuser -k 52323/tcp 3000/tcp");
}

/**
 * Run 'npm run dev' in /home/devbox/project as a background process
 */
export function runDevboxNpmDev(
  sshConfig: SSHConfig
): Promise<SSHCommandResult> {
  return executeSSHCommand(
    sshConfig,
    "nohup npm run dev > devbox-npm-dev.log 2>&1 &",
    { cwd: "/home/devbox/project" }
  );
}

/**
 * Run 'chmod +x devpod && nohup ./devpod > devpod.log 2>&1 &' in /home/devbox as a background process
 */
export function runDevpodBinary(
  sshConfig: SSHConfig
): Promise<SSHCommandResult> {
  return executeSSHCommand(
    sshConfig,
    "chmod +x devpod && nohup ./devpod > devpod.log 2>&1 &",
    { cwd: "/home/devbox" }
  );
}
