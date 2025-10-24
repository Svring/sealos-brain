"use client";

import { instanceParser } from "@sealos-brain/k8s/resources/instance/utils";
import { ReactFlow } from "@xyflow/react";
import * as Control from "@/components/control/control.comp";
import FloatingConnectionLine from "@/components/flow/edges/floating-connection-line";
import * as Flow from "@/components/flow/flow.comp";
import { useAuthState } from "@/contexts/auth/auth.context";
import { useCopilotEvents } from "@/contexts/copilot/copilot.context";
import { useFlowContext } from "@/contexts/flow/flow.context";
import { useProjectState } from "@/contexts/project/project.context";
import { FLOW_CONFIG } from "@/flow/constants/flow-config.constant";
import edgeTypes from "@/flow/models/edge.types";
import { useFlow } from "@/hooks/flow/use-flow";
import nodeTypes from "@/models/flow/nodes/node.types";

import "@xyflow/react/dist/style.css";

export function FlowBlock() {
	const { state, send } = useFlowContext();
	const { project } = useProjectState();
	const { auth } = useAuthState();
	const { addChat } = useCopilotEvents();

	// Create instance target from project name using instanceParser
	const instance = instanceParser.toTarget(project?.object?.name || "");

	// Use flow hook with instance to get nodes and edges
	const { nodes, edges } = useFlow(instance);

	const handlePaneClick = () => {
		if (project?.uid && auth?.kubeconfigEncoded) {
			addChat({
				metadata: {
					kubeconfigEncoded: auth.kubeconfigEncoded,
					projectUid: project.uid,
				},
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
