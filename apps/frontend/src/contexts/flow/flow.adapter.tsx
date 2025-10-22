"use client";

import type { ReactNode } from "react";
import { flowMachineContext } from "./flow.context";

export function FlowAdapter({ 
	children, 
	context 
}: { 
	children: ReactNode;
	context: React.ContextType<typeof flowMachineContext>;
}) {
	return (
		<flowMachineContext.Provider value={context}>
			{children}
		</flowMachineContext.Provider>
	);
}
