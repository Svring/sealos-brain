import { NodeSSH } from 'node-ssh';

export interface DevboxSSHConfig {
	host: string;
	port: number;
	username: string;
	privateKey: string;
	passphrase?: string;
}

export interface FileInfo {
	name: string;
	type: 'file' | 'directory';
	size: number;
	modifyTime: number;
	accessTime: number;
	rights: {            // 权限信息
		user: string;
		group: string;
		other: string;
	};
	owner: number;
	group: number;
}

export interface DirectoryListOptions {
	path: string;
	recursive?: boolean;
	includeHidden?: boolean;
}

export class DevboxSSHError extends Error {
	constructor(
		message: string,
		public operation: string,
		public originalError?: unknown
	) {
		super(message);
		this.name = 'DevboxSSHError';
	}
}

function handleError(error: unknown, operation: string): never {
	const message = error instanceof Error ? error.message : 'Unknown error occurred';
	throw new DevboxSSHError(`Devbox SSH ${operation} failed: ${message}`, operation, error);
}

export async function connectDevboxSSH(config: DevboxSSHConfig): Promise<NodeSSH> {
	try {
		const ssh = new NodeSSH();
		await ssh.connect(config);
		return ssh;
	} catch (error) {
		handleError(error, 'connection');
	}
}

export async function readFile(ssh: NodeSSH, filePath: string): Promise<string> {
	try {
		const result = await ssh.execCommand(`cat "${filePath}"`);
		if (result.code !== 0) {
			throw new Error(result.stderr);
		}
		return result.stdout;
	} catch (error) {
		handleError(error, 'readFile');
	}
}

export async function writeFile(ssh: NodeSSH, filePath: string, content: string): Promise<void> {
	try {
		const escapedContent = content.replace(/"/g, '\\"');
		const result = await ssh.execCommand(`echo "${escapedContent}" > "${filePath}"`);
		if (result.code !== 0) {
			throw new Error(result.stderr);
		}
	} catch (error) {
		handleError(error, 'writeFile');
	}
}

export async function listDirectory(ssh: NodeSSH, dirPath: string): Promise<FileInfo[]> {
	try {
		const result = await ssh.execCommand(`ls -la "${dirPath}"`);
		if (result.code !== 0) {
			throw new Error(result.stderr);
		}

		const lines = result.stdout.split('\n').filter(line => line.trim());
		const files: FileInfo[] = [];

		for (const line of lines) {
			const parts = line.trim().split(/\s+/);
			if (parts.length >= 9) {
				const permissions = parts[0] || '';
				const size = parseInt(parts[4] || '0') || 0;
				const date = parts[5] || '';
				const time = parts[6] || '';
				const name = parts.slice(8).join(' ');

				files.push({
					name,
					type: permissions.startsWith('d') ? 'directory' : 'file',
					size,
					modifyTime: new Date(`${date} ${time}`).getTime(),
					accessTime: new Date(`${date} ${time}`).getTime(),
					rights: {
						user: permissions.slice(1, 4),
						group: permissions.slice(4, 7),
						other: permissions.slice(7, 10)
					},
					owner: 0,
					group: 0
				});
			}
		}

		return files;
	} catch (error) {
		handleError(error, 'listDirectory');
	}
}
//执行命令并返回结果
export async function executeCommand(ssh: NodeSSH, command: string): Promise<string> {
	try {
		const result = await ssh.execCommand(command);
		if (result.code !== 0) {
			throw new Error(result.stderr);
		}
		return result.stdout;
	} catch (error) {
		handleError(error, 'executeCommand');
	}
}

export async function deleteFile(ssh: NodeSSH, filePath: string): Promise<void> {
	try {
		await ssh.execCommand(`rm "${filePath}"`);
	} catch (error) {
		handleError(error, 'deleteFile');
	}
}

export async function createDirectory(ssh: NodeSSH, dirPath: string): Promise<void> {
	try {
		await ssh.execCommand(`mkdir -p "${dirPath}"`);
	} catch (error) {
		handleError(error, 'createDirectory');
	}
}

export async function deleteDirectory(ssh: NodeSSH, dirPath: string): Promise<void> {
	try {
		await ssh.execCommand(`rm -rf "${dirPath}"`);
	} catch (error) {
		handleError(error, 'deleteDirectory');
	}
}

export async function fileExists(ssh: NodeSSH, filePath: string): Promise<boolean> {
	try {
		const result = await ssh.execCommand(`test -e "${filePath}"`);
		return result.code === 0;
	} catch (error) {
		return false;
	}
}

export async function getFileInfo(ssh: NodeSSH, filePath: string): Promise<FileInfo> {
	try {
		const result = await ssh.execCommand(`stat -c "%n %s %Y %X %A %U %G" "${filePath}"`);
		if (result.code !== 0) {
			throw new Error(result.stderr);
		}

		const parts = result.stdout.trim().split(' ');
		if (parts.length < 7) {
			throw new Error('Invalid stat output');
		}

		const name = parts[0] || '';
		const size = parseInt(parts[1] || '0') || 0;
		const modifyTime = parseInt(parts[2] || '0') * 1000;
		const accessTime = parseInt(parts[3] || '0') * 1000;
		const permissions = parts[4] || '';

		return {
			name,
			type: permissions.startsWith('d') ? 'directory' : 'file',
			size,
			modifyTime,
			accessTime,
			rights: {
				user: permissions.slice(1, 4),
				group: permissions.slice(4, 7),
				other: permissions.slice(7, 10)
			},
			owner: 0,
			group: 0
		};
	} catch (error) {
		handleError(error, 'getFileInfo');
	}
}

export async function renameFile(ssh: NodeSSH, oldPath: string, newPath: string): Promise<void> {
	try {
		await ssh.execCommand(`mv "${oldPath}" "${newPath}"`);
	} catch (error) {
		handleError(error, 'renameFile');
	}
}

export async function copyFile(ssh: NodeSSH, sourcePath: string, destPath: string): Promise<void> {
	try {
		await ssh.execCommand(`cp "${sourcePath}" "${destPath}"`);
	} catch (error) {
		handleError(error, 'copyFile');
	}
}

export async function disconnectDevboxSSH(ssh: NodeSSH): Promise<void> {
	ssh.dispose();
}

export default {
	connectDevboxSSH,
	disconnectDevboxSSH,
	readFile,
	writeFile,
	deleteFile,
	listDirectory,
	createDirectory,
	deleteDirectory,
	fileExists,
	getFileInfo,
	renameFile,
	copyFile,
	executeCommand,
	DevboxSSHError
};