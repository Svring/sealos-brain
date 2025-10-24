"use client";

import { createMachine } from "xstate";
import { copilotMachine } from "./spawns/copilot/copilot.state";
import { flowMachine } from "./spawns/flow/flow.state";
import { projectMachine } from "./spawns/project/project.state";

export type AppEvent = { type: "READY" };

export const actorSystemMachine = createMachine({
	types: {} as {
		events: AppEvent;
	},
	id: "app",
	initial: "ready",
	context: ({ spawn }) => {
		spawn(projectMachine, { systemId: "project" });
		spawn(copilotMachine, { systemId: "copilot" });
		spawn(flowMachine, { systemId: "flow" });
		return {};
	},
	states: {
		ready: {},
	},
});
