"use server";

import https from "node:https";
import axios from "axios";
import isPortReachable from "is-port-reachable";

/**
 * Check if a port on a host is reachable
 * @param port - The port number to check
 * @param host - The host to check (domain or IP address)
 * @param timeout - Timeout in milliseconds (default: 1000)
 * @returns Promise<boolean> - Whether the port is reachable
 */
export async function checkPort(
	port: number,
	host: string,
	timeout: number = 1000,
): Promise<boolean> {
	try {
		return await isPortReachable(port, { host, timeout });
	} catch (error) {
		console.error(`Error checking port ${port} on ${host}:`, error);
		return false;
	}
}

/**
 * Check if multiple ports on a host are reachable
 * @param ports - Array of port numbers to check
 * @param host - The host to check (domain or IP address)
 * @param timeout - Timeout in milliseconds (default: 1000)
 * @returns Promise<Array<{port: number, reachable: boolean}>> - Results for each port
 */
export async function checkPorts(
	ports: number[],
	host: string,
	timeout: number = 1000,
): Promise<Array<{ port: number; reachable: boolean }>> {
	const results = await Promise.all(
		ports.map(async (port) => ({
			port,
			reachable: await checkPort(port, host, timeout),
		})),
	);
	// console.log("results", results);

	return results;
}

// Run test cases directly when the file is executed (e.g., `bun run thisfile.ts` or `bun thisfile.ts`)
// Uses `import.meta.main` to detect direct execution in Bun (ES module main entry point).
if (import.meta.main) {
	(async () => {
		console.log("Running test...\n");
		const httpsAgent = new https.Agent({
			rejectUnauthorized: false,
		});
		const result = await axios.get("https://fvjwjrdl.usw.sealos.io", {
			method: "HEAD",
			httpsAgent,
			headers: {
				Referer: "https://brain.usw.sealos.io/",
			},
		});
		console.log(JSON.stringify(result.headers, null, 2));
	})();
}
