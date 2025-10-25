"use client";

import { useCallback } from "react";
import { useCopilotAdapterContext } from "@/contexts/actor/spawns/copilot/copilot.adapter";
import {
	useCopilotEvents,
	useCopilotState,
} from "@/contexts/actor/spawns/copilot/copilot.context";
import { useProjectState } from "@/contexts/actor/spawns/project/project.context";
import { getResourceIcon } from "@/lib/resource/utils/resource.utils";
import { HeaderView } from "../views/header.view";

export const Header = () => {
	const { close, setView: setViewType } = useCopilotEvents();
	const { project, activeResource } = useProjectState();
	const { metadata, threads, threadId } = useCopilotAdapterContext();
	const { view } = useCopilotState();

	// Determine title and icon based on metadata and active resource
	const getTitleAndIcon = useCallback(() => {
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
	}, [metadata, activeResource, project]);

	const { title, iconUrl } = getTitleAndIcon();

	// Empty function implementations
	const handleNewChat = () => {
		console.log("New chat clicked");
	};

	const handleClose = () => {
		close();
	};

	const handleFocusToggle = (pressed: boolean) => {
		console.log("Focus toggle:", pressed);
	};

	const handleThreadSelect = (threadId: string) => {
		console.log("Thread selected:", threadId);
	};

	const handleToggleView = () => {
		const newViewType = view.type === "chat" ? "info" : "chat";
		setViewType(newViewType);
	};

	return (
		<HeaderView
			title={title}
			iconUrl={iconUrl}
			currentView={view.type}
			onNewChat={handleNewChat}
			onClose={handleClose}
			onFocusToggle={handleFocusToggle}
			onThreadSelect={handleThreadSelect}
			onToggleView={handleToggleView}
			threads={threads}
			currentThreadId={threadId}
		/>
	);
};
