"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "@sealos-brain/shared/misc/utils";
import { ChevronDownIcon, Scan } from "lucide-react";
import type { ComponentProps } from "react";
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
import { SidebarTrigger as SidebarTriggerPrimitive } from "@/components/ui/sidebar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

// Root container
export const Root = ({
	className,
	asChild = false,
	children,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="control-root"
			className={cn("relative h-full w-full", className)}
			{...props}
		>
			{children}
		</Comp>
	);
};

// Overlay container for floating controls
export const Overlay = ({
	className,
	asChild = false,
	children,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="control-overlay"
			className={cn("absolute inset-0 z-50 pointer-events-none", className)}
			{...props}
		>
			{children}
		</Comp>
	);
};

// Content area
export const Content = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="control-content"
			className={cn("h-full w-full", className)}
			{...props}
		/>
	);
};

// Control pad with background blur
export const Pad = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="control-pad"
			className={cn(
				"absolute bg-background/30 backdrop-blur-lg rounded-lg transition-all duration-300 ease-in-out flex items-center gap-2",
				className,
			)}
			{...props}
		/>
	);
};

// Sidebar Trigger
export const SidebarTrigger = ({
	className,
	...props
}: ComponentProps<typeof SidebarTriggerPrimitive>) => {
	return (
		<SidebarTriggerPrimitive
			data-slot="control-sidebar-trigger"
			className={cn("pointer-events-auto", className)}
			{...props}
		/>
	);
};

// Project Breadcrumb
export const ProjectCrumb = ({
	className,
	asChild = false,
	project,
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
	project?: {
		name: string;
		displayName?: string;
	};
}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="control-project-crumb"
			className={cn("pointer-events-auto", className)}
			{...props}
		>
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
		</Comp>
	);
};

// Reset Flow Button
export const ResetFlow = ({
	className,
	asChild = false,
	onReset,
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
	onReset?: () => void;
}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="control-reset-flow"
			className={cn("pointer-events-auto", className)}
			{...props}
		>
			<TooltipProvider>
				<div className="flex items-center gap-1">
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
		</Comp>
	);
};
