"use client";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

interface DevboxToolConfigProps {
	children: ReactNode;
}

export function DevboxToolConfig({ children }: DevboxToolConfigProps) {
	return (
		<>
			{children}
			<TanStackDevtools
				plugins={[
					FormDevtoolsPlugin(),
					{
						name: "TanStack Query",
						render: <ReactQueryDevtoolsPanel />,
					},
				]}
			/>
		</>
	);
}
