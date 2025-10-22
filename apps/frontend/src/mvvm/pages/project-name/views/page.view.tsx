"use client";

import type { Edge, Node } from "@xyflow/react";
import { useCopilotState } from "@/contexts/copilot/copilot.context";
import { OverlayControl } from "../vms/overlay-control.vm";
import { ProjectCopilot } from "../vms/project-copilot.vm";
import { ProjectFlow } from "../vms/project-flow.vm";

interface PageViewProps {
	nodes: Node[];
	edges: Edge[];
}

export const PageView = ({ nodes, edges }: PageViewProps) => {
	const { opened } = useCopilotState();

	return (
		<div className="h-full w-full overflow-hidden bg-background rounded-lg flex">
			{/* Left side - Flow */}
			<div className={`h-full transition-all duration-200 flex-1`}>
				<OverlayControl>
					<ProjectFlow nodes={nodes} edges={edges} />
				</OverlayControl>
			</div>

			{/* Right side - Copilot */}
			{opened && (
				<div className={`${opened ? "w-[35%]" : "w-0"} h-full min-w-[28rem]`}>
					<ProjectCopilot />
				</div>
			)}
		</div>
	);
};
