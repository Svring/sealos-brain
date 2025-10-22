import type React from "react";
import { ProxyAdapter } from "./proxy.adapter";

interface ProxyProviderProps {
	children: React.ReactNode;
}

export function ProxyProvider({ children }: ProxyProviderProps) {
	return <ProxyAdapter>{children}</ProxyAdapter>;
}
