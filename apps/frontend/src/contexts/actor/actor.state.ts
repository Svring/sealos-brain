"use client";

import { createMachine } from "xstate";
import { copilotMachine } from "../copilot/copilot.state";
import { flowMachine } from "../flow/flow.state";
import { projectMachine } from "../project/project.state";

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
