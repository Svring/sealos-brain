"use client";

import type { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { useAuthState } from "@/contexts/auth/auth.context";
import type { AiProxyRouter } from "@/trpc/ai-proxy.trpc";
import type { ClusterRouter } from "@/trpc/cluster.trpc";
import type { DevboxRouter } from "@/trpc/devbox.trpc";
import type { InstanceRouter } from "@/trpc/instance.trpc";
import type { K8sRouter } from "@/trpc/k8s.trpc";
import type { LanggraphRouter } from "@/trpc/langgraph.trpc";
import type { LaunchpadRouter } from "@/trpc/launchpad.trpc";
import type { OsbRouter } from "@/trpc/osb.trpc";
import type { TemplateRouter } from "@/trpc/template.trpc";

export const k8sClient = createTRPCContext<K8sRouter>();
export const instanceClient = createTRPCContext<InstanceRouter>();
export const devboxClient = createTRPCContext<DevboxRouter>();
export const clusterClient = createTRPCContext<ClusterRouter>();
export const launchpadClient = createTRPCContext<LaunchpadRouter>();
export const langgraphClient = createTRPCContext<LanggraphRouter>();
export const aiProxyClient = createTRPCContext<AiProxyRouter>();
export const osbClient = createTRPCContext<OsbRouter>();
export const templateClient = createTRPCContext<TemplateRouter>();

interface TRPCConfigProps {
	children: React.ReactNode;
	queryClient: QueryClient;
}

export default function TRPCConfig({ children, queryClient }: TRPCConfigProps) {
	const { auth } = useAuthState();

	const [k8sTrpcClient] = useState(() =>
		createTRPCClient<K8sRouter>({
			links: [
				httpBatchLink({
					url: "/api/trpc/k8s",
					maxURLLength: 6000,
					headers: () => ({
						kubeconfigEncoded: auth.kubeconfigEncoded,
					}),
				}),
			],
		}),
	);

	const [instanceTrpcClient] = useState(() =>
		createTRPCClient<InstanceRouter>({
			links: [
				httpBatchLink({
					url: "/api/trpc/instance",
					maxURLLength: 6000,
					headers: () => ({
						kubeconfigEncoded: auth.kubeconfigEncoded,
					}),
				}),
			],
		}),
	);

	const [devboxTrpcClient] = useState(() =>
		createTRPCClient<DevboxRouter>({
			links: [
				httpBatchLink({
					url: "/api/trpc/devbox",
					maxURLLength: 6000,
					headers: () => ({
						kubeconfigEncoded: auth.kubeconfigEncoded,
					}),
				}),
			],
		}),
	);

	const [clusterTrpcClient] = useState(() =>
		createTRPCClient<ClusterRouter>({
			links: [
				httpBatchLink({
					url: "/api/trpc/cluster",
					maxURLLength: 6000,
					headers: () => ({
						kubeconfigEncoded: auth.kubeconfigEncoded,
					}),
				}),
			],
		}),
	);

	const [launchpadTrpcClient] = useState(() =>
		createTRPCClient<LaunchpadRouter>({
			links: [
				httpBatchLink({
					url: "/api/trpc/launchpad",
					maxURLLength: 6000,
					headers: () => ({
						kubeconfigEncoded: auth.kubeconfigEncoded,
					}),
				}),
			],
		}),
	);

	const [langgraphTrpcClient] = useState(() =>
		createTRPCClient<LanggraphRouter>({
			links: [
				httpBatchLink({
					url: "/api/trpc/langgraph",
					maxURLLength: 6000,
					headers: () => ({
						kubeconfigEncoded: auth.kubeconfigEncoded,
					}),
				}),
			],
		}),
	);

	const [aiProxyTrpcClient] = useState(() =>
		createTRPCClient<AiProxyRouter>({
			links: [
				httpBatchLink({
					url: "/api/trpc/ai-proxy",
					maxURLLength: 6000,
					headers: () => ({
						kubeconfigEncoded: auth.kubeconfigEncoded,
						appToken: auth.appToken,
					}),
				}),
			],
		}),
	);

	const [osbTrpcClient] = useState(() =>
		createTRPCClient<OsbRouter>({
			links: [
				httpBatchLink({
					url: "/api/trpc/osb",
					maxURLLength: 6000,
					headers: () => ({
						kubeconfigEncoded: auth.kubeconfigEncoded,
					}),
				}),
			],
		}),
	);

	const [templateTrpcClient] = useState(() =>
		createTRPCClient<TemplateRouter>({
			links: [
				httpBatchLink({
					url: "/api/trpc/template",
					maxURLLength: 6000,
					headers: () => ({
						kubeconfigEncoded: auth.kubeconfigEncoded,
					}),
				}),
			],
		}),
	);

	return (
		<k8sClient.TRPCProvider
			trpcClient={k8sTrpcClient}
			queryClient={queryClient}
		>
			<instanceClient.TRPCProvider
				trpcClient={instanceTrpcClient}
				queryClient={queryClient}
			>
				<devboxClient.TRPCProvider
					trpcClient={devboxTrpcClient}
					queryClient={queryClient}
				>
					<clusterClient.TRPCProvider
						trpcClient={clusterTrpcClient}
						queryClient={queryClient}
					>
						<launchpadClient.TRPCProvider
							trpcClient={launchpadTrpcClient}
							queryClient={queryClient}
						>
							<langgraphClient.TRPCProvider
								trpcClient={langgraphTrpcClient}
								queryClient={queryClient}
							>
								<aiProxyClient.TRPCProvider
									trpcClient={aiProxyTrpcClient}
									queryClient={queryClient}
								>
									<osbClient.TRPCProvider
										trpcClient={osbTrpcClient}
										queryClient={queryClient}
									>
										<templateClient.TRPCProvider
											trpcClient={templateTrpcClient}
											queryClient={queryClient}
										>
											{children}
										</templateClient.TRPCProvider>
									</osbClient.TRPCProvider>
								</aiProxyClient.TRPCProvider>
							</langgraphClient.TRPCProvider>
						</launchpadClient.TRPCProvider>
					</clusterClient.TRPCProvider>
				</devboxClient.TRPCProvider>
			</instanceClient.TRPCProvider>
		</k8sClient.TRPCProvider>
	);
}
