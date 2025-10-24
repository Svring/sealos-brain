"use client";

import { CopilotBlock } from "@/blocks/copilot/copilot.block";
import { FlowBlock } from "@/blocks/flow/flow.block";
import { useCopilotState } from "@/contexts/actor/spawns/copilot/copilot.context";

export default function ProjectPage() {
	const { opened } = useCopilotState();

	return (
		<div className="h-full w-full overflow-hidden bg-background rounded-lg flex">
			{/* Left side - Flow */}
			<div className={`h-full transition-all duration-200 flex-1`}>
				<FlowBlock />
			</div>

			{/* Right side - Copilot */}
			{opened && (
				<div className={`${opened ? "w-[35%]" : "w-0"} h-full min-w-[28rem]`}>
					<CopilotBlock />
				</div>
			)}
		</div>
	);
}
