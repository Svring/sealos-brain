"use client";

import { useSelector } from "@xstate/react";
import type { ReactNode } from "react";
import { useCallback, useMemo } from "react";
import type { ActorRefFrom, EventFrom } from "xstate";
import { useActorSystem } from "@/contexts/actor/actor.context";
import { flowMachineContext } from "./flow.context";
import type { flowMachine } from "./flow.state";

export function FlowAdapter({ children }: { children: ReactNode }) {
	const { actorSystemRef } = useActorSystem();
	const flowRef = useMemo(
		() => actorSystemRef.system.get("flow") as ActorRefFrom<typeof flowMachine>,
		[actorSystemRef],
	);

	const state = useSelector(flowRef, (s) => s);

	const send = useCallback(
		(event: EventFrom<typeof flowMachine>) => flowRef.send(event),
		[flowRef],
	);

	const value = useMemo(
		() => ({
			nodes: state.context.nodes,
			edges: state.context.edges,
			state,
			send,
		}),
		[state.context.nodes, state.context.edges, state, send],
	);

	return (
		<flowMachineContext.Provider value={value}>
			{children}
		</flowMachineContext.Provider>
	);
}
