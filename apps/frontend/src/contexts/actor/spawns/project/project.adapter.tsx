"use client";

import { useSelector } from "@xstate/react";
import type { ReactNode } from "react";
import { useCallback, useMemo } from "react";
import type { ActorRefFrom, EventFrom } from "xstate";
import { useActorSystem } from "../../actor.context";
import { projectMachineContext } from "./project.context";
import type { projectMachine } from "./project.state";

interface ProjectAdapterProps {
	children: ReactNode;
}

export function ProjectAdapter({ children }: ProjectAdapterProps) {
	const { actorSystemRef } = useActorSystem();

	const projectRef = useMemo(
		() =>
			actorSystemRef.system.get("project") as ActorRefFrom<
				typeof projectMachine
			>,
		[actorSystemRef],
	);

	const state = useSelector(projectRef, (s) => s);

	const send = useCallback(
		(event: EventFrom<typeof projectMachine>) => projectRef.send(event),
		[projectRef],
	);

	const value = useMemo(
		() => ({
			project: state.context,
			state,
			send,
		}),
		[state.context, state, send],
	);

	return (
		<projectMachineContext.Provider value={value}>
			{children}
		</projectMachineContext.Provider>
	);
}
