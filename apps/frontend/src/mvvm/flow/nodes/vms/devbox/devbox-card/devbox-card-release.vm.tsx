"use client";

import { GitBranch, GitCommit } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";

interface ReleaseSectionProps {
	onSectionClick: () => void;
	isActive?: boolean;
}

// Body Content Component
const ReleaseBodyContent: React.FC = () => {
	// Dummy data
	const releases = [
		{
			version: "v1.2.3",
			tag: "stable",
			date: "2025-10-15",
			time: "14:30",
			status: "active",
		},
		{
			version: "v1.2.2",
			tag: "stable",
			date: "2025-10-14",
			time: "10:15",
			status: "inactive",
		},
		{
			version: "v1.2.1",
			tag: "stable",
			date: "2025-10-13",
			time: "16:45",
			status: "inactive",
		},
		{
			version: "v1.2.0",
			tag: "stable",
			date: "2025-10-12",
			time: "09:20",
			status: "inactive",
		},
	];

	return (
		<div className="w-full rounded-lg space-y-3">
			<div className="space-y-2">
				{releases.map((release) => (
					<div
						key={release.version}
						className={`border rounded-lg p-3 ${
							release.status === "active"
								? "border-primary bg-primary/5"
								: "border-border-primary"
						}`}
					>
						<div className="flex items-start justify-between">
							<div className="flex items-start gap-2 flex-1">
								<GitCommit className="h-4 w-4 mt-0.5 flex-shrink-0" />
								<div className="flex flex-col gap-1">
									<div className="flex items-center gap-2">
										<span className="font-mono font-semibold text-sm">
											{release.version}
										</span>
										{release.status === "active" && (
											<span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
												Active
											</span>
										)}
									</div>
									<span className="text-xs text-muted-foreground">
										{release.date} at {release.time}
									</span>
								</div>
							</div>
							{release.status !== "active" && (
								<Button variant="outline" size="sm" className="h-7 text-xs">
									Rollback
								</Button>
							)}
						</div>
					</div>
				))}
			</div>

			<Button variant="outline" size="sm" className="w-full">
				Create New Release
			</Button>
		</div>
	);
};

export const DevboxCardRelease: React.FC<ReleaseSectionProps> & {
	BodyContent: React.FC;
} = ({ onSectionClick, isActive = false }) => {
	// Dummy data
	const releasesCount = 4;

	return (
		<button
			type="button"
			className={`p-2 border rounded-lg cursor-pointer hover:bg-background-tertiary transition-colors duration-200 ease-out w-full min-w-0 text-left ${
				isActive ? "bg-background-tertiary border-primary" : ""
			}`}
			onClick={onSectionClick}
		>
			<div className="flex items-center gap-2 min-w-0">
				<GitBranch className="h-5 w-5 text-primary" />
				<div className="flex flex-col">
					<span className="font-medium text-sm">Releases</span>
					<span className="text-xs text-muted-foreground">
						{releasesCount} releases
					</span>
				</div>
			</div>
		</button>
	);
};

DevboxCardRelease.BodyContent = ReleaseBodyContent;

export default DevboxCardRelease;
