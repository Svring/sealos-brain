import type React from "react";
import { FlowAdapter } from "./flow.adapter";

interface FlowProviderProps {
	children: React.ReactNode;
	context: React.ContextType<typeof import("./flow.context").flowMachineContext>;
}

export function FlowProvider({ children, context }: FlowProviderProps) {
	return <FlowAdapter context={context}>{children}</FlowAdapter>;
}
