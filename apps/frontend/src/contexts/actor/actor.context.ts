"use client";

import { createContext, use } from "react";
import type { ActorRefFrom } from "xstate";
import type { actorSystemMachine } from "./actor.state";

export type ActorSystemRef = ActorRefFrom<typeof actorSystemMachine>;

interface ActorSystemContextValue {
	actorSystemRef: ActorSystemRef;
}

export const actorSystemContext = createContext<
	ActorSystemContextValue | undefined
>(undefined);

export function useActorSystem() {
	const ctx = use(actorSystemContext);
	if (!ctx) {
		throw new Error("useActorSystem must be used within ActorProvider");
	}
	return ctx;
}
