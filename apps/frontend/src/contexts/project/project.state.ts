"use client";

import { assign, createMachine } from "xstate";
import type { ResourceTarget } from "@/mvvm/k8s/models/k8s.model";
import type { InstanceObject } from "@/mvvm/sealos/instance/models/instance-object.model";

// Resource interface
export interface Resource {
	uid: string;
	target: ResourceTarget;
}

export interface Project {
	uid: string;
	target: ResourceTarget;
	object: InstanceObject;
}

export interface ProjectContext {
	project: Project | null;
	allResources: Resource[];
	activeResource: Resource | null;
}

export type ProjectEvent =
	| { type: "SET_PROJECT"; project: Project }
	| { type: "CLEAR_PROJECT" }
	| { type: "SET_ALL_RESOURCES"; resources: Resource[] }
	| { type: "ADD_RESOURCE"; resource: Resource }
	| { type: "UPDATE_RESOURCE"; resource: Resource }
	| { type: "REMOVE_RESOURCE"; resourceUid: string }
	| { type: "SET_ACTIVE_RESOURCE"; resource: Resource | null }
	| { type: "CLEAR_ACTIVE_RESOURCE" }
	| { type: "NOOP" }
	| { type: "FAIL" }
	| { type: "RETRY" };

export const projectMachine = createMachine({
	types: {} as {
		context: ProjectContext;
		events: ProjectEvent;
	},
	id: "project",
	initial: "idle",
	context: {
		project: null,
		allResources: [],
		activeResource: null,
	},
	states: {
		idle: {
			on: {
				SET_PROJECT: {
					target: "ready",
					actions: assign({ project: ({ event }) => event.project }),
				},
				FAIL: {
					target: "failed",
				},
			},
		},
		ready: {
			on: {
				SET_PROJECT: {
					actions: assign({ project: ({ event }) => event.project }),
				},
				CLEAR_PROJECT: {
					target: "idle",
					actions: assign({
						project: null,
						allResources: [],
						activeResource: null,
					}),
				},
				SET_ALL_RESOURCES: {
					actions: assign({ allResources: ({ event }) => event.resources }),
				},
				ADD_RESOURCE: {
					actions: assign({
						allResources: ({ context, event }) => [
							...context.allResources,
							event.resource,
						],
					}),
				},
				UPDATE_RESOURCE: {
					actions: assign({
						allResources: ({ context, event }) =>
							context.allResources.map((resource) =>
								resource.uid === event.resource.uid ? event.resource : resource,
							),
					}),
				},
				REMOVE_RESOURCE: {
					actions: assign({
						allResources: ({ context, event }) =>
							context.allResources.filter(
								(resource) => resource.uid !== event.resourceUid,
							),
						activeResource: ({ context, event }) =>
							context.activeResource?.uid === event.resourceUid
								? null
								: context.activeResource,
					}),
				},
				SET_ACTIVE_RESOURCE: {
					actions: assign({ activeResource: ({ event }) => event.resource }),
				},
				CLEAR_ACTIVE_RESOURCE: {
					actions: assign({ activeResource: null }),
				},
				FAIL: {
					target: "failed",
				},
			},
		},
		failed: {
			on: {
				SET_PROJECT: {
					target: "ready",
					actions: assign({ project: ({ event }) => event.project }),
				},
				RETRY: "idle",
			},
		},
	},
});
