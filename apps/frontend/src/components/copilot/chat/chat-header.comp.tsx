"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "@sealos-brain/shared/misc/utils";
import {
	ChevronRight,
	History as HistoryIcon,
	Info,
	Loader2,
	Plus,
} from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCopilotAdapterContext } from "@/contexts/actor/spawns/copilot/copilot.adapter";
import {
	useCopilotEvents,
	useCopilotState,
} from "@/contexts/actor/spawns/copilot/copilot.context";
import { useProjectState } from "@/contexts/actor/spawns/project/project.context";
import { getResourceIcon } from "@/lib/resource/utils/resource.utils";

// Header section
export const Header = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="chat-header"
			className={cn("flex items-center justify-between p-2", className)}
			{...props}
		/>
	);
};

// Title with icon and info
export const Title = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
}) => {
	const Comp = asChild ? Slot : "div";
	const { project, activeResource } = useProjectState();
	const { metadata } = useCopilotAdapterContext();

	// Determine title and icon based on metadata and active resource
	const getTitleAndIcon = () => {
		// If metadata contains resourceUid, use the active resource's target
		if (metadata?.resourceUid && activeResource) {
			const target = activeResource.target;
			return {
				title: target.name,
				iconUrl: getResourceIcon(target),
			};
		}

		// Otherwise, use project
		if (project?.target) {
			return {
				title: project.target.name,
				iconUrl: getResourceIcon(project.target),
			};
		}

		// Fallback for project object
		if (project?.object) {
			return {
				title: project.object.displayName || project.object.name || "Chat",
				iconUrl: "/sealos-brain-icon-grayscale.svg",
			};
		}

		return {
			title: "Chat",
			iconUrl: null,
		};
	};

	const { title, iconUrl } = getTitleAndIcon();

	return (
		<Comp
			data-slot="chat-title"
			className={cn(
				"flex items-center gap-2 min-w-0 border rounded-md px-2 py-1",
				className,
			)}
			{...props}
		>
			{iconUrl && (
				<img
					src={iconUrl}
					alt=""
					className="h-5 w-5 flex-shrink-0 rounded-sm"
				/>
			)}
			<h2 className="truncate flex-1 max-w-[12ch]">{title}</h2>
			<Info className="h-4 w-4 flex-shrink-0" />
		</Comp>
	);
};

// View toggle (Chat/Info)
export const ViewToggle = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"button"> & {
	asChild?: boolean;
}) => {
	const Comp = asChild ? Slot : Button;
	const { setView: setViewType } = useCopilotEvents();
	const { view } = useCopilotState();

	const handleToggle = () => {
		const newViewType = view.type === "chat" ? "info" : "chat";
		setViewType(newViewType);
	};

	return (
		<Comp
			data-slot="chat-view-toggle"
			variant="ghost"
			size="sm"
			className={cn("h-7 px-2 text-sm rounded-l-none border-l-0", className)}
			onClick={handleToggle}
			{...props}
		>
			<span className={view.type === "chat" ? "" : "text-muted-foreground"}>
				Chat
			</span>
			<span className="text-muted-foreground"> / </span>
			<span className={view.type === "info" ? "" : "text-muted-foreground"}>
				Info
			</span>
		</Comp>
	);
};

// New chat button
export const NewChat = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"button"> & {
	asChild?: boolean;
}) => {
	const Comp = asChild ? Slot : Button;
	const { createNewThread, isLoading } = useCopilotAdapterContext();

	return (
		<Comp
			data-slot="chat-new-chat"
			onClick={createNewThread}
			size="icon"
			variant="ghost"
			className={cn("h-8 w-8 transition-none", className)}
			disabled={isLoading}
			{...props}
		>
			<Plus className="h-4 w-4" />
		</Comp>
	);
};

// History dropdown
export const History = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
}) => {
	const Comp = asChild ? Slot : "div";
	const { threads, threadId, setThreadId } = useCopilotAdapterContext();

	return (
		<Comp data-slot="chat-history" className={cn("", className)} {...props}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 transition-none"
					>
						<HistoryIcon className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="max-w-xs">
					{threads.length > 0 ? (
						<div className="max-h-80 overflow-y-auto space-y-1">
							{threads.map((thread) => (
								<DropdownMenuItem
									key={thread.thread_id}
									onClick={() => setThreadId(thread.thread_id)}
									className={cn(
										"p-2 cursor-pointer",
										thread.thread_id === threadId &&
											"bg-muted/50 border rounded-md",
									)}
								>
									<div className="flex items-center justify-between w-full gap-2">
										<div className="flex-1 min-w-0">
											<div className="text-sm font-medium truncate">
												{((thread.metadata as Record<string, unknown>)
													?.title as string) ||
													`Thread ${thread.thread_id.slice(0, 8)}`}
											</div>
											{thread.updated_at && (
												<div className="text-xs text-muted-foreground">
													{new Date(thread.updated_at).toLocaleDateString()}
												</div>
											)}
										</div>
									</div>
								</DropdownMenuItem>
							))}
						</div>
					) : (
						<div className="p-2 text-sm text-muted-foreground">
							No chat history
						</div>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</Comp>
	);
};

// Close button
export const Close = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"button"> & {
	asChild?: boolean;
}) => {
	const Comp = asChild ? Slot : Button;
	const { close } = useCopilotEvents();
	return (
		<Comp
			data-slot="chat-close"
			onClick={close}
			size="icon"
			variant="ghost"
			className={cn("h-8 w-8 transition-none", className)}
			{...props}
		>
			<ChevronRight className="h-4 w-4" />
		</Comp>
	);
};
