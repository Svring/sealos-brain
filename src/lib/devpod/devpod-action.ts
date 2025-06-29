"use server";

import fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NodeSSH } from "node-ssh";
import type { SSHCommandResult, SSHConfig } from "./devpod-utils";
import { formatPrivateKey } from "./devpod-utils";

/**
 * Create an SSH connection with the provided configuration
 * @param sshConfig - SSH connection configuration
 * @returns Connected NodeSSH instance
 */
export async function createSSHConnection(
  sshConfig: SSHConfig
): Promise<NodeSSH> {
  const ssh = new NodeSSH();

  await ssh.connect({
    host: sshConfig.host,
    port: sshConfig.port || 22,
    username: sshConfig.username,
    privateKey: formatPrivateKey(sshConfig.privateKey),
  });

  return ssh;
}

/**
 * Execute a command on a remote server via SSH
 * @param sshConfig - SSH connection configuration
 * @param command - Command to execute
 * @param options - Additional options (e.g., working directory)
 * @returns Command execution result
 */
export async function executeSSHCommand(
  sshConfig: SSHConfig,
  command: string,
  options?: { cwd?: string }
): Promise<SSHCommandResult> {
  const ssh = await createSSHConnection(sshConfig);

  try {
    const result = await ssh.execCommand(command, options);
    return {
      stdout: result.stdout,
      stderr: result.stderr,
      code: result.code || 0,
    };
  } finally {
    ssh.dispose();
  }
}

/**
 * Execute multiple commands on a remote server via SSH (reuses connection)
 * @param sshConfig - SSH connection configuration
 * @param commands - Array of commands with optional working directories
 * @returns Array of command execution results
 */
export async function executeMultipleSSHCommands(
  sshConfig: SSHConfig,
  commands: Array<{ command: string; cwd?: string }>
): Promise<SSHCommandResult[]> {
  const ssh = await createSSHConnection(sshConfig);

  try {
    const results = await Promise.all(
      commands.map(async ({ command, cwd }) => {
        const result = await ssh.execCommand(command, { cwd });
        return {
          stdout: result.stdout,
          stderr: result.stderr,
          code: result.code || 0,
        };
      })
    );
    return results;
  } finally {
    ssh.dispose();
  }
}

/**
 * Upload a file to a remote server via SSH
 * @param sshConfig - SSH connection configuration
 * @param localPath - Local file path
 * @param remotePath - Remote file path
 */
export async function uploadFileViaSSH(
  sshConfig: SSHConfig,
  localPath: string,
  remotePath: string
): Promise<void> {
  const ssh = await createSSHConnection(sshConfig);

  try {
    await ssh.putFile(localPath, remotePath);
  } finally {
    ssh.dispose();
  }
}

/**
 * Download a file from a remote server via SSH
 * @param sshConfig - SSH connection configuration
 * @param remotePath - Remote file path
 * @param localPath - Local file path
 */
export async function downloadFileViaSSH(
  sshConfig: SSHConfig,
  remotePath: string,
  localPath: string
): Promise<void> {
  const ssh = await createSSHConnection(sshConfig);

  try {
    await ssh.getFile(localPath, remotePath);
  } finally {
    ssh.dispose();
  }
}

/**
 * Server action to check SSH connection
 * @param sshConfig - SSH connection configuration
 * @returns true if connection is successful, false otherwise
 */
export async function checkSSHConnection(
  sshConfig: SSHConfig
): Promise<boolean> {
  try {
    const ssh = await createSSHConnection(sshConfig);
    ssh.dispose();
    return true;
  } catch {
    return false;
  }
}

/**
 * Server action to download and upload a file from DEVPOD_RELEASE URL to SSH device
 * @param sshConfig - SSH connection configuration
 * @param remotePath - Remote path where to upload the file (optional, defaults to /tmp/devpod-release)
 * @returns Promise with success status and message
 */
export async function uploadDevpodReleaseFile(
  sshConfig: SSHConfig,
  remotePath = "/home/devbox/devpod"
): Promise<{ success: boolean; message: string }> {
  const releaseUrl = process.env.DEVPOD_RELEASE;

  if (!releaseUrl) {
    return {
      success: false,
      message: "DEVPOD_RELEASE environment variable is not set",
    };
  }

  // Check if the file already exists on the remote device
  try {
    const checkResult = await executeSSHCommand(
      sshConfig,
      `test -f ${remotePath} && echo exists || echo notfound`
    );
    if (checkResult.stdout.trim() === "exists") {
      return {
        success: true,
        message: `File already exists at ${remotePath}, skipping upload.`,
      };
    }
  } catch {
    // If the check fails, proceed with upload (could be permission issue, etc.)
  }

  let tempFilePath: string | null = null;

  try {
    // Download the file from the URL
    const response = await fetch(releaseUrl);
    if (!response.ok) {
      return {
        success: false,
        message: `Failed to download file: ${response.status} ${response.statusText}`,
      };
    }

    // Create a temporary file
    const fileName =
      path.basename(new URL(releaseUrl).pathname) || "devpod-release";
    tempFilePath = path.join(tmpdir(), `devpod-${Date.now()}-${fileName}`);

    // Write the downloaded content to temporary file
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(tempFilePath, buffer);

    // Upload the file via SSH
    await uploadFileViaSSH(sshConfig, tempFilePath, remotePath);

    return {
      success: true,
      message: `File successfully uploaded to ${remotePath}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Upload failed: ${errorMessage}`,
    };
  } finally {
    // Clean up temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}
