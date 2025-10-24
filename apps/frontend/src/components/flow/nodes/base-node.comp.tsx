"use client";

import { Slot } from "@radix-ui/react-slot";
import type { ResourceTarget } from "@sealos-brain/k8s/shared/models";
import {
	CLUSTER_DEFAULT_ICON,
	CLUSTER_ICON_BASE_URL,
} from "@sealos-brain/sealos/cluster/constants";
import {
	DEVBOX_DEFAULT_ICON,
	DEVBOX_ICON_BASE_URL,
} from "@sealos-brain/sealos/devbox/constants";
import { LAUNCHPAD_DEFAULT_ICON } from "@sealos-brain/sealos/launchpad/constants";
import { OBJECTSTORAGE_DEFAULT_ICON } from "@sealos-brain/sealos/osb/constants";
import { cn } from "@sealos-brain/shared/misc/utils";
import { Position, Handle as ReactFlowHandle } from "@xyflow/react";
import { cva, type VariantProps } from "class-variance-authority";
import { MoreHorizontal, Square } from "lucide-react";
import Image from "next/image";
import type { ComponentProps } from "react";
import { createContext, useContext, useMemo } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useResourceObject } from "@/hooks/shared/resource/use-resource-object";
import type { ResourceObject } from "@/lib/resource/models/resource-object.model";

const baseNodeVariants = cva(
	"relative cursor-pointer rounded-xl border bg-background-tertiary p-5 text-card-foreground hover:brightness-120 flex flex-col",
	{
		variants: {
			size: {
				default: "h-50 w-70",
				flat: "h-14 w-70",
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

type BaseNodeContextProps = {
	target: ResourceTarget;
	object: ResourceObject;
};

const BaseNodeContext = createContext<BaseNodeContextProps>({
	target: {} as ResourceTarget,
	object: {} as ResourceObject,
});

export const useBaseNode = () => {
	const context = useContext(BaseNodeContext);
	if (!context) {
		throw new Error("useBaseNode must be used within a BaseNode Root");
	}
	return context;
};

export type RootProps = {
	target: ResourceTarget;
	children: React.ReactNode;
};

export const Root = ({ target, children }: RootProps) => {
	const { data: object } = useResourceObject(target);

	return (
		<BaseNodeContext.Provider
			value={{ target, object: object || ({} as ResourceObject) }}
		>
			{children}
		</BaseNodeContext.Provider>
	);
};

export type VesselProps = ComponentProps<"div"> &
	VariantProps<typeof baseNodeVariants> & {
		asChild?: boolean;
		onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
	};

export const Vessel = ({
	className,
	size = "default",
	asChild = false,
	children,
	onClick,
	...props
}: VesselProps) => {
	const Comp = asChild ? Slot : "div";
	const { target, object } = useBaseNode();
	const { isLoading, isError, error } = useResourceObject(target);

	// Show loading state
	if (isLoading) {
		return (
			<Comp
				data-slot="base-node-vessel"
				data-size={size}
				className={cn(baseNodeVariants({ size, className }))}
				{...props}
			>
				<div className="flex items-center justify-center h-full">
					<Spinner className="h-4 w-4" />
				</div>
			</Comp>
		);
	}

	// Show error state
	if (isError) {
		return (
			<Comp
				data-slot="base-node-vessel"
				data-size={size}
				className={cn(baseNodeVariants({ size, className }))}
				{...props}
			>
				<div className="flex items-center justify-center h-full text-red-500 text-sm">
					Error: {error?.message || "Failed to load resource"}
				</div>
			</Comp>
		);
	}

	// Show no data state
	if (!object) {
		return (
			<Comp
				data-slot="base-node-vessel"
				data-size={size}
				className={cn(baseNodeVariants({ size, className }))}
				{...props}
			>
				<div className="flex items-center justify-center h-full text-muted-foreground text-sm">
					No data available
				</div>
			</Comp>
		);
	}

	return (
		<Comp
			data-slot="base-node-vessel"
			data-size={size}
			className={cn(baseNodeVariants({ size, className }))}
			onClick={(e) => {
				console.log("Vessel clicked");
				onClick?.(e);
			}}
			{...props}
		>
			{children}
		</Comp>
	);
};

export const Header = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="base-node-header"
			className={cn("flex items-center justify-between", className)}
			{...props}
		/>
	);
};

export const Content = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="base-node-content"
			className={cn("flex flex-1 items-start gap-2 mt-4 px-1", className)}
			{...props}
		/>
	);
};

export const Footer = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="base-node-footer"
			className={cn("mt-auto flex justify-between items-center", className)}
			{...props}
		/>
	);
};

export const Title = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
}) => {
	const Comp = asChild ? Slot : "div";
	const { target, object } = useBaseNode();

	// Get resource type and name from context
	const resourceType = target.resourceType || object.resourceType;
	const name = target.name || object.name;

	// Determine iconURL based on resource type and object properties
	const iconURL = useMemo(() => {
		switch (resourceType) {
			case "devbox":
				// Use runtime from devbox object
				if ("runtime" in object && typeof object.runtime === "string") {
					return `${DEVBOX_ICON_BASE_URL}/${object.runtime}.svg`;
				}
				return DEVBOX_DEFAULT_ICON;
			case "cluster":
				// Use type from cluster object
				if ("type" in object && typeof object.type === "string") {
					return `${CLUSTER_ICON_BASE_URL}/${object.type}.svg`;
				}
				return CLUSTER_DEFAULT_ICON;
			case "deployment":
			case "statefulset":
				// Launchpad resources use default icon
				return LAUNCHPAD_DEFAULT_ICON;
			case "objectstoragebucket":
				// OSB resources use default icon
				return OBJECTSTORAGE_DEFAULT_ICON;
			default:
				// Fallback to launchpad default
				return LAUNCHPAD_DEFAULT_ICON;
		}
	}, [resourceType, object]);

	return (
		<Comp
			data-slot="base-node-title"
			className={cn(
				"flex items-center gap-2 truncate font-medium flex-1 min-w-0",
				className,
			)}
			{...props}
		>
			<div className="flex flex-col items-start">
				<span className="flex items-center gap-2">
					<Image
						src={iconURL}
						alt={`Icon`}
						width={24}
						height={24}
						className="rounded-lg h-9 w-9 shrink-0 p-1 bg-muted"
					/>
					<span className="flex flex-col min-w-0">
						<span className="text-xs text-muted-foreground leading-none capitalize">
							{resourceType}
						</span>
						<span className="text-lg font-bold text-foreground leading-tight truncate">
							{name.length > 8 ? `${name.slice(0, 15)}...` : name}
						</span>
					</span>
				</span>
			</div>
		</Comp>
	);
};

export const Menu = ({
	className,
	asChild = false,
	children,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="base-node-menu"
			className={cn("flex flex-row items-center gap-2 shrink-0", className)}
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
				<DropdownMenuContent
					align="start"
					className="rounded-xl bg-background-tertiary"
				>
					{children}
				</DropdownMenuContent>
			</DropdownMenu>
		</Comp>
	);
};

const statusVariants = cva("h-3 w-3", {
	variants: {
		variant: {
			running: "fill-theme-green text-theme-green",
			stopped: "fill-theme-purple text-theme-purple",
			stopping: "fill-theme-purple text-theme-purple",
			shutdown: "fill-theme-purple text-theme-purple",
			error: "fill-theme-red text-theme-red",
			abnormal: "fill-theme-red text-theme-red",
			deleting: "fill-theme-yellow text-theme-yellow",
			restarting: "fill-theme-yellow text-theme-yellow",
			pending: "fill-theme-gray text-theme-gray",
		},
	},
	defaultVariants: {
		variant: "pending",
	},
});

export const Status = ({
	className,
	asChild = false,
	onClick,
	...props
}: ComponentProps<"button"> & {
	asChild?: boolean;
	onClick?: (e: React.MouseEvent) => void;
}) => {
	const Comp = asChild ? Slot : "button";
	const { object } = useBaseNode();

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (onClick) {
			onClick(e);
		}
	};

	const computedStatus = useMemo(() => {
		if ("status" in object && typeof object.status === "string") {
			return object.status;
		}
		return "Pending";
	}, [object]);

	// Map status to variant
	const statusVariant = useMemo(() => {
		const status = computedStatus.toLowerCase();
		switch (status) {
			case "running":
				return "running";
			case "stopped":
			case "stopping":
			case "shutdown":
				return "stopped";
			case "error":
			case "abnormal":
				return "error";
			case "deleting":
			case "restarting":
				return "deleting";
			default:
				return "pending";
		}
	}, [computedStatus]);

	return (
		<Comp data-slot="base-node-status" {...props}>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						className={cn(
							"flex items-center gap-2 border border-dashed border-transparent hover:border-muted-foreground/50 rounded px-1 py-0.5 transition-colors cursor-pointer",
							className,
						)}
						onClick={handleClick}
					>
						<Square className={statusVariants({ variant: statusVariant })} />
						<span className="text-sm">{computedStatus}</span>
					</button>
				</TooltipTrigger>
				<TooltipContent>
					<p className="text-sm">Click to analyze status</p>
				</TooltipContent>
			</Tooltip>
		</Comp>
	);
};

export const Widget = ({
	className,
	asChild = false,
	icon: Icon,
	onClick,
	disabled = false,
	tooltip,
	...props
}: ComponentProps<"button"> & {
	asChild?: boolean;
	icon: React.ComponentType<{ className?: string }>;
	onClick?: (e: React.MouseEvent) => void;
	disabled?: boolean;
	tooltip?: string;
}) => {
	const Comp = asChild ? Slot : "button";

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (onClick && !disabled) {
			onClick(e);
		}
	};

	const buttonContent = (
		<button
			className={cn(
				"p-1 border-2 rounded-full transition-colors",
				disabled
					? "border-muted-foreground/20 cursor-not-allowed opacity-50"
					: "border-muted-foreground/20 hover:border-muted-foreground/40 cursor-pointer",
			)}
			onClick={handleClick}
			type="button"
			disabled={disabled}
		>
			<Icon
				className={cn(
					"h-4 w-4",
					disabled ? "text-theme-gray" : "text-theme-green",
				)}
			/>
		</button>
	);

	return (
		<Comp data-slot="base-node-widget" className={cn("", className)} {...props}>
			{tooltip ? (
				<Tooltip>
					<TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
					<TooltipContent>
						<p className="text-sm">{tooltip}</p>
					</TooltipContent>
				</Tooltip>
			) : (
				buttonContent
			)}
		</Comp>
	);
};

export const Handle = ({
	position = Position.Top,
	type = "source",
	id,
	...props
}: ComponentProps<typeof ReactFlowHandle> & {
	position?: Position;
	type?: "source" | "target";
}) => {
	return <ReactFlowHandle position={position} type={type} id={id} {...props} />;
};
