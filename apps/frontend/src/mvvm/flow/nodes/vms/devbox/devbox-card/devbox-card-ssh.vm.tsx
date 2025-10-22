"use client";

import { Check, Copy, Download, Terminal } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/utils/use-copy";

interface SshSectionProps {
	onSectionClick: () => void;
	isActive?: boolean;
}

// Body Content Component
const SshBodyContent: React.FC = () => {
	const { copyToClipboard, isCopied } = useCopy();

	// Dummy data
	const sshConfig = {
		user: "devbox",
		host: "ssh.cloud.sealos.io",
		port: "22022",
		keyName: "cloud.sealos.io_ns-abc123_dev-box-01",
		privateKey:
			"-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----",
	};

	const sshCommand = `ssh -i ${sshConfig.keyName} ${sshConfig.user}@${sshConfig.host} -p ${sshConfig.port}`;

	const handleDownloadKey = () => {
		const blob = new Blob([sshConfig.privateKey], {
			type: "text/plain",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = sshConfig.keyName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<div className="rounded-lg">
			<div className="space-y-3">
				<div className="flex items-center justify-between min-w-0 w-full rounded-lg p-2 px-3 bg-background-tertiary border border-border-primary">
					<span className="text-sm font-mono text-foreground flex-1 truncate mr-2">
						{sshCommand}
					</span>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 flex-shrink-0"
						onClick={() => copyToClipboard(sshCommand, "ssh-command")}
					>
						{isCopied("ssh-command") ? (
							<Check className="h-4 w-4 text-theme-green" />
						) : (
							<Copy className="h-4 w-4" />
						)}
					</Button>
				</div>

				<div className="space-y-2">
					<div className="text-xs text-muted-foreground">
						Connection Details:
					</div>
					<div className="grid grid-cols-2 gap-2 text-sm">
						<div className="flex flex-col gap-1">
							<span className="text-xs text-muted-foreground">User</span>
							<span className="font-mono text-sm">{sshConfig.user}</span>
						</div>
						<div className="flex flex-col gap-1">
							<span className="text-xs text-muted-foreground">Port</span>
							<span className="font-mono text-sm">{sshConfig.port}</span>
						</div>
						<div className="flex flex-col gap-1 col-span-2">
							<span className="text-xs text-muted-foreground">Host</span>
							<span className="font-mono text-sm truncate">
								{sshConfig.host}
							</span>
						</div>
					</div>
				</div>

				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="flex-1 text-sm"
						onClick={handleDownloadKey}
					>
						<Download className="h-4 w-4 mr-2" />
						Private Key
					</Button>
				</div>
			</div>
		</div>
	);
};

export const DevboxCardSsh: React.FC<SshSectionProps> & {
	BodyContent: React.FC;
} = ({ onSectionClick, isActive = false }) => {
	return (
		<button
			type="button"
			className={`p-2 border rounded-lg cursor-pointer hover:bg-background-tertiary transition-colors duration-200 ease-out w-full min-w-0 text-left ${
				isActive ? "bg-background-tertiary border-primary" : ""
			}`}
			onClick={onSectionClick}
		>
			<div className="flex items-center gap-2 min-w-0">
				<Terminal className="h-5 w-5 text-primary" />
				<div className="flex flex-col">
					<span className="font-medium text-sm">SSH</span>
					<span className="text-xs text-muted-foreground">Connection</span>
				</div>
			</div>
		</button>
	);
};

DevboxCardSsh.BodyContent = SshBodyContent;

export default DevboxCardSsh;
