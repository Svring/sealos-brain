"use client";

import { useMachine } from "@xstate/react";
import type { ReactNode } from "react";
import { projectMachineContext } from "./project.context";
import type { ProjectContext } from "./project.state";
import { projectMachine } from "./project.state";

interface ProjectAdapterProps {
	children: ReactNode;
	projectContext: ProjectContext;
}

export function ProjectAdapter({
	children,
	projectContext,
}: ProjectAdapterProps) {
	const [state, send] = useMachine(projectMachine, {
		input: projectContext,
	});

	return (
		<projectMachineContext.Provider
			value={{
				project: state.context,
				state,
				send,
			}}
		>
			{children}
		</projectMachineContext.Provider>
	);
}
