import type React from "react";
import { FlowAdapter } from "./flow.adapter";

interface FlowProviderProps {
	children: React.ReactNode;
}

export function FlowProvider({ children }: FlowProviderProps) {
	return <FlowAdapter>{children}</FlowAdapter>;
}
