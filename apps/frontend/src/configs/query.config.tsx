// app/providers.tsx
"use client";

import {
	isServer,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import TRPCConfig from "./query-trpc.config";

function makeQueryClient() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: 1,
				staleTime: 20 * 1000, // Shorter stale time - 20 seconds
				gcTime: 3 * 60 * 1000, // Keep in cache for 5 minutes
			},
			mutations: {
				retry: 1,
			},
		},
	});

	return queryClient;
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
	if (isServer) {
		// Server: always make a new query client
		return makeQueryClient();
	} else {
		if (!browserQueryClient) browserQueryClient = makeQueryClient();
		return browserQueryClient;
	}
}

export default function QueryConfig({
	children,
}: {
	children: React.ReactNode;
}) {
	const queryClient = getQueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<TRPCConfig queryClient={queryClient}>{children}</TRPCConfig>
		</QueryClientProvider>
	);
}
