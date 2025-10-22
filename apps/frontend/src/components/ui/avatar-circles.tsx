"use client";

import React from "react";

import { cn } from "@/lib/utils";

interface AvatarCirclesProps {
	className?: string;
	numPeople?: number;
	avatarUrls: string[];
	disableLink?: boolean;
}

const AvatarCircles = ({
	numPeople,
	className,
	avatarUrls,
	disableLink = false,
}: AvatarCirclesProps) => {
	return (
		<div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
			{avatarUrls.map((url) => (
				<img
					key={url}
					className="h-10 w-10 rounded-lg border-2 border-white dark:border-border bg-background-tertiary p-1"
					src={url}
					width={40}
					height={40}
					alt="Avatar"
				/>
			))}
			{numPeople &&
				numPeople > 0 &&
				(disableLink ? (
					<div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-white bg-black text-center font-medium text-white hover:bg-gray-600 dark:border-border dark:bg-background-tertiary dark:text-foreground">
						+{numPeople}
					</div>
				) : (
					<a
						className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-border dark:bg-background-tertiary dark:text-foreground"
						href="/"
					>
						+{numPeople}
					</a>
				))}
		</div>
	);
};

export { AvatarCircles };
