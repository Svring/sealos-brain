import {
	aiProxyClient,
	clusterClient,
	devboxClient,
	instanceClient,
	k8sClient,
	langgraphClient,
	launchpadClient,
	osbClient,
	templateClient,
} from "@/configs/query-trpc.config";

export const useTRPCClients = () => {
	const k8sTrpcClient = k8sClient.useTRPC();
	const instanceTrpcClient = instanceClient.useTRPC();
	const devboxTrpcClient = devboxClient.useTRPC();
	const clusterTrpcClient = clusterClient.useTRPC();
	const launchpadTrpcClient = launchpadClient.useTRPC();
	const langgraphTrpcClient = langgraphClient.useTRPC();
	const aiProxyTrpcClient = aiProxyClient.useTRPC();
	const osbTrpcClient = osbClient.useTRPC();
	const templateTrpcClient = templateClient.useTRPC();

	return {
		k8s: k8sTrpcClient,
		instance: instanceTrpcClient,
		devbox: devboxTrpcClient,
		cluster: clusterTrpcClient,
		launchpad: launchpadTrpcClient,
		langgraph: langgraphTrpcClient,
		aiProxy: aiProxyTrpcClient,
		osb: osbTrpcClient,
		template: templateTrpcClient,
	};
};
