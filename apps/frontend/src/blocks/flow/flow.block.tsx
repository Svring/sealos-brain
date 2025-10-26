"use client";

import { instanceParser } from "@sealos-brain/k8s/resources/instance/utils";
import { composeMetadata } from "@sealos-brain/langgraph/utils";
import { ReactFlow } from "@xyflow/react";
import * as Control from "@/components/control/control.comp";
import FloatingConnectionLine from "@/components/flow/edges/floating-connection-line";
import * as Flow from "@/components/flow/flow.comp";
import { useCopilotEvents } from "@/contexts/actor/spawns/copilot/copilot.context";
import { useFlowContext } from "@/contexts/actor/spawns/flow/flow.context";
import { useProjectState } from "@/contexts/actor/spawns/project/project.context";
import { useAuthState } from "@/contexts/auth/auth.context";
import edgeTypes from "@/flow/constants/edge-types.constant";
import { FLOW_CONFIG } from "@/flow/constants/flow-config.constant";
import nodeTypes from "@/flow/constants/node-types.constant";
import { useFlow } from "@/hooks/flow/use-flow";

import "@xyflow/react/dist/style.css";

interface FlowBlockProps {
	name: string;
}

export function FlowBlock({ name }: FlowBlockProps) {
	const { state, send } = useFlowContext();
	const { project } = useProjectState();
	const { auth } = useAuthState();
	const { addChat } = useCopilotEvents();

	// Create instance target from name passed in
	const instance = instanceParser.toTarget(name);

	// Use flow hook with instance to get nodes and edges
	const { nodes, edges } = useFlow(instance);

	const handlePaneClick = () => {
		if (project?.uid && auth?.kubeconfigEncoded) {
			addChat({
				metadata: composeMetadata({
					kubeconfigEncoded: auth.kubeconfigEncoded,
					projectUid: project.uid,
					graphId: "project",
				}),
			});
		}
	};

	const handleEdgeClick = (event: React.MouseEvent) => {
		// TODO: Implement edge click logic
		console.log(event);
	};

	const handleReset = () => {
		// TODO: Implement reset logic
		console.log("Reset flow clicked");
	};

	const context = {
		nodes,
		edges,
		state,
		send,
	};

	return (
		<Control.Root>
			<Flow.Root context={context}>
				<Flow.Content>
					<ReactFlow
						connectionLineType={FLOW_CONFIG.connectionLineType}
						connectionLineComponent={FloatingConnectionLine}
						edges={edges}
						edgeTypes={edgeTypes}
						nodeTypes={nodeTypes}
						fitView
						zoomOnDoubleClick={false}
						fitViewOptions={FLOW_CONFIG.fitViewOptions}
						nodes={nodes}
						panOnScroll
						panOnDrag
						zoomOnScroll
						zoomOnPinch
						snapToGrid
						snapGrid={FLOW_CONFIG.snapGrid}
						proOptions={FLOW_CONFIG.proOptions}
						onPaneClick={handlePaneClick}
						onEdgeClick={handleEdgeClick}
						className="h-full w-full"
					/>
				</Flow.Content>
			</Flow.Root>

			<Control.Overlay>
				<Control.Pad className="top-2 left-2">
					<Control.SidebarTrigger />
					<Control.ProjectCrumb
						project={{
							name: project?.object?.name || "",
							displayName:
								project?.object?.displayName ||
								project?.object?.name ||
								"Unknown Project",
						}}
					/>
				</Control.Pad>
				<Control.Pad className="top-2 right-2">
					<Control.ResetFlow onReset={handleReset} />
				</Control.Pad>
			</Control.Overlay>
		</Control.Root>
	);
}
