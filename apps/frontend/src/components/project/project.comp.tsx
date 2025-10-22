"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import type { ComponentProps } from "react";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { projectMachineContext } from "@/contexts/project/project.context";
import { cn } from "@/lib/utils";

const cardVariants = cva(
	"relative flex w-full cursor-pointer rounded-lg border bg-background-tertiary text-left shadow-sm flex-col p-4 py-3 transition-all duration-200 hover:brightness-120 ease-out",
	{
		variants: {
			size: {
				default: "min-h-[160px]",
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

// Project Root - Only provides context
export const Root = ({
	className,
	asChild = false,
	context,
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
	context: React.ContextType<typeof projectMachineContext>;
}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<projectMachineContext.Provider value={context}>
			<Comp data-slot="project-root" className={cn(className)} {...props} />
		</projectMachineContext.Provider>
	);
};

// Dashboard Root
export const Dashboard = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="project-dashboard"
			className={cn("flex h-full w-full flex-col items-center p-8", className)}
			{...props}
		/>
	);
};

// Dashboard Header
export const DashboardHeader = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="project-dashboard-header"
			className={cn(
				"mb-6 w-full max-w-4xl flex items-center justify-between",
				className,
			)}
			{...props}
		/>
	);
};

// Dashboard Header Title
export const DashboardHeaderTitle = ({
	className,
	asChild = false,
	title = "Projects",
	...props
}: ComponentProps<"h1"> & {
	asChild?: boolean;
	title?: string;
}) => {
	const Comp = asChild ? Slot : "h1";
	return (
		<Comp
			data-slot="project-dashboard-header-title"
			className={cn("text-lg font-semibold", className)}
			{...props}
		>
			{title}
		</Comp>
	);
};

// Dashboard Header Search Bar
export const DashboardHeaderSearchBar = ({
	className,
	asChild = false,
	searchValue,
	onSearchChange,
	placeholder = "Search...",
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
	searchValue?: string;
	onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="project-dashboard-header-search"
			className={cn("relative", className)}
			{...props}
		>
			<Input
				className="h-8 w-36 pl-8 bg-background-tertiary"
				placeholder={placeholder}
				value={searchValue}
				onChange={onSearchChange}
			/>
			<Search
				className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
				size={16}
			/>
		</Comp>
	);
};

// Dashboard Header New Button
export const DashboardHeaderNew = ({
	className,
	asChild = false,
	onCreateClick,
	...props
}: ComponentProps<"button"> & {
	asChild?: boolean;
	onCreateClick?: () => void;
}) => {
	const Comp = asChild ? Slot : Button;
	return (
		<Comp
			data-slot="project-dashboard-header-new"
			size="sm"
			variant="outline"
			onClick={onCreateClick}
			className={cn("h-8 w-8 p-0 bg-background-tertiary", className)}
			{...props}
		>
			<Plus size={16} />
		</Comp>
	);
};

// Dashboard Content
export const DashboardContent = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="project-dashboard-content"
			className={cn("w-full max-w-4xl", className)}
			{...props}
		/>
	);
};

// Card
export const Card = ({
	className,
	size = "default",
	asChild = false,
	...props
}: ComponentProps<"div"> &
	VariantProps<typeof cardVariants> & {
		asChild?: boolean;
	}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="project-card"
			data-size={size}
			className={cn(cardVariants({ size, className }))}
			{...props}
		/>
	);
};

// Card Header
export const CardHeader = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="project-card-header"
			className={cn("flex w-full gap-2", className)}
			{...props}
		/>
	);
};

// Card Title
export const CardTitle = ({
	className,
	asChild = false,
	displayName,
	name,
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
	displayName?: string;
	name?: string;
}) => {
	const Comp = asChild ? Slot : "div";

	return (
		<Comp
			data-slot="project-card-title"
			className={cn(
				"flex flex-col items-start space-x-1 min-w-0 group flex-1",
				className,
			)}
			{...props}
		>
			<p className="text-foreground truncate transition-colors">
				{displayName || name || "Unknown Project"}
			</p>
			{displayName && displayName !== name && (
				<p className="text-xs text-muted-foreground">{name}</p>
			)}
		</Comp>
	);
};

// Card Menu
export const CardMenu = ({
	className,
	asChild = false,
	children,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="project-card-menu"
			className={cn("flex flex-row items-start gap-2 flex-shrink-0", className)}
			{...props}
		>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="w-6 h-6 rounded hover:bg-muted cursor-pointer flex items-center justify-center"
					>
						<MoreHorizontal className="h-4 w-4" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="bg-background-tertiary">
					{children}
				</DropdownMenuContent>
			</DropdownMenu>
		</Comp>
	);
};

// Card Footer
export const CardFooter = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="project-card-footer"
			className={cn("mt-auto flex justify-between items-center", className)}
			{...props}
		/>
	);
};

// Card Date
export const CardDate = ({
	className,
	asChild = false,
	format = "short",
	date,
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
	format?: "short" | "long" | "relative";
	date?: string;
}) => {
	const Comp = asChild ? Slot : "div";

	const formatDate = (date: string) => {
		const d = new Date(date);
		switch (format) {
			case "long":
				return d.toLocaleDateString(undefined, {
					year: "numeric",
					month: "long",
					day: "numeric",
				});
			case "relative": {
				// Simple relative time
				const now = new Date();
				const diff = now.getTime() - d.getTime();
				const days = Math.floor(diff / (1000 * 60 * 60 * 24));
				if (days === 0) return "Today";
				if (days === 1) return "Yesterday";
				if (days < 7) return `${days} days ago`;
				return d.toLocaleDateString();
			}
			default:
				return d.toLocaleDateString();
		}
	};

	return (
		<Comp
			data-slot="project-card-date"
			className={cn(
				"absolute bottom-5 left-4 text-xs text-muted-foreground",
				className,
			)}
			{...props}
		>
			{date ? formatDate(date) : "Unknown Date"}
		</Comp>
	);
};

// Card Widget
export const CardWidget = ({
	className,
	asChild = false,
	avatarUrls = [],
	numPeople = 0,
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
	avatarUrls?: string[];
	numPeople?: number;
}) => {
	const Comp = asChild ? Slot : "div";

	return (
		<Comp
			data-slot="project-card-widget"
			className={cn(
				"scale-75 origin-right absolute bottom-4 right-4",
				className,
			)}
			{...props}
		>
			{avatarUrls.length > 0 && (
				<AvatarCircles
					numPeople={numPeople > 0 ? numPeople : undefined}
					avatarUrls={avatarUrls}
					disableLink
				/>
			)}
		</Comp>
	);
};

// Loading State
export const Loading = ({
	className,
	asChild = false,
	message = "Loading...",
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
	message?: string;
}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="project-loading"
			className={cn(
				"flex flex-col items-center py-12 text-center",
				className,
			)}
			{...props}
		>
			<Spinner className="h-8 w-8" />
			<p className="text-sm text-muted-foreground mt-2">{message}</p>
		</Comp>
	);
};

// Empty State
export const Empty = ({
	className,
	asChild = false,
	type = "no-projects",
	searchTerm,
	onCreateProject,
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
	type?: "no-projects" | "search-empty";
	searchTerm?: string;
	onCreateProject?: () => void;
}) => {
	const Comp = asChild ? Slot : "div";

	if (type === "search-empty") {
		return (
			<Comp
				data-slot="project-empty"
				className={cn(
					"flex flex-col items-center py-12 text-center",
					className,
				)}
				{...props}
			>
				<h3 className="text-lg font-medium text-muted-foreground mb-2">
					No projects found
				</h3>
				<p className="text-sm text-muted-foreground">
					No projects match "{searchTerm}". Try a different search term.
				</p>
			</Comp>
		);
	}

	return (
		<Comp
			data-slot="project-empty"
			className={cn("flex flex-col items-center py-12 text-center", className)}
			{...props}
		>
			<h3 className="text-lg font-medium text-muted-foreground mb-2">
				No projects yet
			</h3>
			<p className="text-sm text-muted-foreground mb-4">
				Create your first project to get started.
			</p>
			{onCreateProject && (
				<Button
					onClick={onCreateProject}
					className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
				>
					Create Project
				</Button>
			)}
		</Comp>
	);
};
