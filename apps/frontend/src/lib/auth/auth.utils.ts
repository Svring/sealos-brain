import type { Auth } from "@/contexts/auth/auth.state";
import { getRegionUrlFromKubeconfig } from "@/lib/k8s/k8s-server.utils";

// Helper function to handle auth computation and state updates
export async function handleAuthComputation(
	kubeconfigEncoded: string,
	appToken: string,
	send: (event: { type: "SET_AUTH"; auth: Auth } | { type: "FAIL" }) => void,
) {
	try {
		const regionUrl = await getRegionUrlFromKubeconfig(decodeURIComponent(kubeconfigEncoded));
		if (!regionUrl) {
			throw new Error("Failed to extract regionUrl from kubeconfig");
		}
		
		const auth: Auth = { kubeconfigEncoded, appToken, regionUrl };
		send({ type: "SET_AUTH", auth });
	} catch (error) {
		console.error("Failed to compute regionUrl:", error);
		send({ type: "FAIL" });
	}
}
