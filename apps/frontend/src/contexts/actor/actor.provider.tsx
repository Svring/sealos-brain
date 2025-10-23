"use client";

import { useActorRef } from "@xstate/react";
import type React from "react";
import { actorSystemContext } from "./actor.context";
import { actorSystemMachine } from "./actor.state";

interface ActorProviderProps {
	children: React.ReactNode;
}

export function ActorProvider({ children }: ActorProviderProps) {
	const appRef = useActorRef(actorSystemMachine);

	return (
		<actorSystemContext.Provider value={{ actorSystemRef: appRef }}>
			{children}
		</actorSystemContext.Provider>
	);
}
