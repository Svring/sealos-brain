"use client";

import { ChevronDownIcon, Scan } from "lucide-react";
import type { ReactNode } from "react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface OverlayControlProps {
	children: ReactNode;
	project?: {
		name: string;
		displayName?: string;
	};
	onReset?: () => void;
}

export const OverlayControlView = ({
	children,
	project,
	onReset,
}: OverlayControlProps) => {
	return (
		<div className="relative h-full w-full">
			{children}

			{/* Floating control buttons overlay */}
			<div className="absolute top-2 left-2 z-50 flex items-center gap-2">
				<SidebarTrigger />

				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href="/project">Project</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<DropdownMenu>
								<DropdownMenuTrigger className="flex items-center gap-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5">
									<BreadcrumbPage className="hover:underline cursor-pointer">
										{project?.displayName?.slice(0, 12)}
										{project?.displayName &&
											project.displayName.length > 12 &&
											"..."}
									</BreadcrumbPage>
									<ChevronDownIcon />
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start">
									<DropdownMenuItem>Project 1</DropdownMenuItem>
									<DropdownMenuItem>Project 2</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			{/* Right side floating actions */}
			<div className="absolute top-2 right-2 z-40 bg-background/30 backdrop-blur-lg rounded-lg transition-all duration-300 ease-in-out">
				<TooltipProvider>
					<div className="flex items-center gap-1">
						{/* Reset Button */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={onReset}
								>
									<Scan className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Reset</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</TooltipProvider>
			</div>
		</div>
	);
};
