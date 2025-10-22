"use client";

import { createContext, use, useCallback } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type {
	Project,
	ProjectContext,
	projectMachine,
	Resource,
} from "./project.state";

interface ProjectContextValue {
	project: ProjectContext;
	state: StateFrom<typeof projectMachine>;
	send: (event: EventFrom<typeof projectMachine>) => void;
}

export const projectMachineContext = createContext<
	ProjectContextValue | undefined
>(undefined);

export function useProjectContext() {
	const ctx = use(projectMachineContext);
	if (!ctx) {
		throw new Error("useProjectContext must be used within ProjectAdapter");
	}
	return ctx;
}

export function useProjectState() {
	const { state } = useProjectContext();

	if (state.matches("failed")) {
		throw new Error("Project initialization failed");
	}

	// Directly expose the data fields
	return {
		project: state.context.project,
		allResources: state.context.allResources,
		activeResource: state.context.activeResource,
		isIdle: state.matches("idle"),
		isReady: state.matches("ready"),
		isFailed: state.matches("failed"),
	};
}

export function useProjectEvents() {
	const { send } = useProjectContext();

	return {
		setProject: useCallback(
			(project: Project) => send({ type: "SET_PROJECT", project }),
			[send],
		),
		clearProject: useCallback(() => send({ type: "CLEAR_PROJECT" }), [send]),
		setAllResources: useCallback(
			(resources: Resource[]) => send({ type: "SET_ALL_RESOURCES", resources }),
			[send],
		),
		addResource: useCallback(
			(resource: Resource) => send({ type: "ADD_RESOURCE", resource }),
			[send],
		),
		updateResource: useCallback(
			(resource: Resource) => send({ type: "UPDATE_RESOURCE", resource }),
			[send],
		),
		removeResource: useCallback(
			(resourceUid: string) => send({ type: "REMOVE_RESOURCE", resourceUid }),
			[send],
		),
		setActiveResource: useCallback(
			(resource: Resource) => send({ type: "SET_ACTIVE_RESOURCE", resource }),
			[send],
		),
		clearActiveResource: useCallback(
			() => send({ type: "CLEAR_ACTIVE_RESOURCE" }),
			[send],
		),
		fail: useCallback(() => send({ type: "FAIL" }), [send]),
		retry: useCallback(() => send({ type: "RETRY" }), [send]),
	};
}
