"use server";

import { NodeSSH } from "node-ssh";
import * as fs from "fs";
import * as path from "path";

interface DevboxInfo {
  ssh_credentials: {
    host: string;
    port?: string | number;
    username: string;
    password?: string;
    privateKey?: string;
  };
  project_public_address: string;
}

interface SSHConfig {
  host: string;
  port?: number;
  username: string;
  password?: string;
  privateKey?: string;
}

function formatPrivateKey(privateKey?: string): string | undefined {
  if (!privateKey) {
    return undefined;
  }

  let decodedKey = privateKey;

  // Try to decode base64 if it doesn't contain PEM markers
  if (!privateKey.includes("-----BEGIN") && !privateKey.includes("-----END")) {
    try {
      // Decode base64 in Node.js environment
      decodedKey = Buffer.from(privateKey, "base64").toString("utf-8");
    } catch (error) {
      console.error("Failed to decode base64 private key:", error);
      throw new Error("Invalid base64 private key format");
    }
  }

  // Return the decoded key as-is (do not add markers)
  return decodedKey;
}

/**
 * Activate (or update) Galatea for a devbox. If update=true, cleans up existing Galatea files before activation.
 * Cleans ports and launches Galatea if it exists, otherwise uploads and launches it.
 *
 * @param devboxInfo - DevboxInfo containing SSH credentials and connection details
 * @param mcpEnabled - If true, launch Galatea with '--mcp-enabled' flag
 * @param update - If true, cleanup existing Galatea files before activation
 * @returns URL in the format {project_public_address}galatea
 */
export async function activateGalateaForDevbox(
  devboxInfo: DevboxInfo,
  mcpEnabled: boolean = false,
  update: boolean = false
): Promise<string> {
  try {
    console.log(
      `Starting Galatea activation for devbox at ${devboxInfo.ssh_credentials.host}`
    );

    if (update) {
      console.log("Update flag is set. Cleaning up existing Galatea files...");
      await cleanupGalateaFilesOnDevbox(devboxInfo);
      console.log("Cleanup complete. Proceeding with activation...");
    }

    // Extract SSH configuration from DevboxInfo
    const sshConfig: SSHConfig = {
      host: devboxInfo.ssh_credentials.host,
      port: devboxInfo.ssh_credentials.port
        ? parseInt(devboxInfo.ssh_credentials.port.toString())
        : 22,
      username: devboxInfo.ssh_credentials.username,
      password: devboxInfo.ssh_credentials.password,
      privateKey: formatPrivateKey(devboxInfo.ssh_credentials.privateKey),
    };

    console.log(
      `Connecting to devbox via SSH at ${sshConfig.host}:${sshConfig.port}`
    );

    const ssh = new NodeSSH();
    await ssh.connect({
      host: sshConfig.host,
      port: sshConfig.port,
      username: sshConfig.username,
      // password: sshConfig.password,
      privateKey: sshConfig.privateKey,
    });

    try {
      console.log("SSH connection established, cleaning ports...");
      // Clean ports first
      await ssh.execCommand("fuser -k 3051/tcp 3000/tcp", {
        cwd: "/home/devbox",
      });

      console.log("Checking if Galatea binary exists...");
      // Check if galatea exists
      const checkResult = await ssh.execCommand("test -f galatea", {
        cwd: "/home/devbox",
      });

      if (checkResult.code !== 0) {
        console.log("Galatea binary not found, uploading...");
        // Galatea does not exist, upload it
        await uploadGalateaBinary(sshConfig);
      } else {
        console.log("Galatea binary found");
      }

      console.log("Making Galatea executable and launching...");
      // Make executable
      const chmodResult = await ssh.execCommand("chmod a+x galatea", {
        cwd: "/home/devbox",
      });
      if (chmodResult.stderr) {
        throw new Error(`chmod failed: ${chmodResult.stderr}`);
      }

      // Launch Galatea in background with proper detachment
      const launchCmd = mcpEnabled
        ? "(./galatea --mcp-enabled --use-sudo > galatea.log 2>&1 &) && sleep 1"
        : "(./galatea > galatea.log 2>&1 &) && sleep 1";

      await ssh.execCommand(launchCmd, {
        cwd: "/home/devbox",
      });
    } finally {
      ssh.dispose();
    }

    const galateaUrl = `${devboxInfo.project_public_address}galatea`;
    console.log(`Galatea activation complete. URL: ${galateaUrl}`);
    return galateaUrl;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error activating Galatea: ${errorMessage}`);
    throw new Error(`Failed to activate Galatea for devbox: ${errorMessage}`);
  }
}

/**
 * Helper function to upload Galatea binary to the devbox.
 * Downloads to local temp file first, then uploads to server.
 *
 * @param sshConfig - SSH connection configuration
 */
async function uploadGalateaBinary(sshConfig: SSHConfig): Promise<void> {
  const galateaRelease = process.env.GALATEA_RELEASE;
  if (!galateaRelease) {
    throw new Error("GALATEA_RELEASE environment variable is not set");
  }

  let tempFilePath: string | null = null;

  try {
    console.log("Downloading Galatea binary to local temp file...");

    // Download to local temporary file
    const response = await fetch(galateaRelease);
    if (!response.ok) {
      throw new Error(`Failed to download Galatea: ${response.statusText}`);
    }

    // Create temporary file
    const tempDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    tempFilePath = path.join(tempDir, `galatea-${Date.now()}`);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(tempFilePath, Buffer.from(buffer));

    console.log("Uploading Galatea binary to devbox...");

    // Upload to remote using node-ssh
    const ssh = new NodeSSH();
    await ssh.connect({
      host: sshConfig.host,
      port: sshConfig.port,
      username: sshConfig.username,
      // password: sshConfig.password,
      privateKey: sshConfig.privateKey,
    });

    try {
      await ssh.putFile(tempFilePath, "/home/devbox/galatea");
      console.log("Galatea binary uploaded successfully");
    } finally {
      ssh.dispose();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to upload Galatea binary: ${errorMessage}`);
  } finally {
    // Clean up temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log("Cleaned up temporary file");
      } catch (cleanupError) {
        console.warn("Failed to cleanup temporary file:", cleanupError);
      }
    }
  }
}

/**
 * Cleans up Galatea-related files and folders on the remote devbox.
 * Deletes 'galatea_files', 'project' folders and 'galatea', 'galatea_log' files from /home/{user}.
 *
 * @param devboxInfo - DevboxInfo containing SSH credentials and connection details
 * @returns true if cleanup succeeds
 */
export async function cleanupGalateaFilesOnDevbox(
  devboxInfo: DevboxInfo
): Promise<boolean> {
  try {
    const sshUser = devboxInfo.ssh_credentials.username;
    if (!sshUser) {
      throw new Error("SSH username is required for cleanup.");
    }

    const sshConfig: SSHConfig = {
      host: devboxInfo.ssh_credentials.host,
      port: devboxInfo.ssh_credentials.port
        ? parseInt(devboxInfo.ssh_credentials.port.toString())
        : 22,
      username: sshUser,
      password: devboxInfo.ssh_credentials.password,
      privateKey: formatPrivateKey(devboxInfo.ssh_credentials.privateKey),
    };

    const cleanupCmd = `cd /home/${sshUser} && sudo pkill -f galatea 2>/dev/null || true && sleep 2 && sudo chmod -R 755 project 2>/dev/null || true && sudo rm -rf galatea_files project galatea galatea.log command.log || (sleep 3 && sudo chmod -R 777 project 2>/dev/null && sudo rm -rf galatea_files project galatea galatea.log command.log)`;

    console.log(
      `Connecting to devbox for cleanup at ${sshConfig.host}:${sshConfig.port}`
    );

    const ssh = new NodeSSH();
    await ssh.connect({
      host: sshConfig.host,
      port: sshConfig.port,
      username: sshConfig.username,
      password: sshConfig.password,
      privateKey: sshConfig.privateKey,
    });

    try {
      console.log(`Running cleanup command: ${cleanupCmd}`);
      const result = await ssh.execCommand(cleanupCmd);

      if (result.code !== 0) {
        throw new Error(`Cleanup command failed: ${result.stderr}`);
      }
    } finally {
      ssh.dispose();
    }

    console.log("Cleanup completed successfully.");
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error during cleanup: ${errorMessage}`);
    throw new Error(
      `Failed to cleanup Galatea files on devbox: ${errorMessage}`
    );
  }
}

/**
 * Kill Galatea processes on SSH device (legacy function for backward compatibility)
 *
 * @param sshConfig - SSH configuration
 */
export async function killGalateaProcessOnSSHDevice(sshConfig: {
  host: string;
  port?: number;
  username: string;
  password?: string;
  privateKey?: string;
}): Promise<any> {
  const ssh = new NodeSSH();
  await ssh.connect({
    host: sshConfig.host,
    port: sshConfig.port,
    username: sshConfig.username,
    password: sshConfig.password,
    privateKey: formatPrivateKey(sshConfig.privateKey),
  });

  try {
    const killResult = await ssh.execCommand("fuser -k 3051/tcp 3000/tcp", {
      cwd: "/home/devbox",
    });

    if (
      killResult.stderr &&
      !killResult.stderr.includes("No such file or directory")
    ) {
      throw new Error(`fuser failed: ${killResult.stderr}`);
    }
    return killResult;
  } finally {
    ssh.dispose();
  }
}
