import { getRegionUrlFromKubeconfig } from "@sealos-brain/k8s/shared/utils";
import { err, ok, ResultAsync } from "neverthrow";
import type { Auth } from "@/contexts/auth/auth.state";

// Helper function to derive auth from kubeconfig
export function deriveAuth(
	kubeconfigEncoded: string,
	appToken: string,
): ResultAsync<Auth, Error> {
	return ResultAsync.fromPromise(
		getRegionUrlFromKubeconfig(decodeURIComponent(kubeconfigEncoded)),
		(error) =>
			new Error(`Failed to extract regionUrl from kubeconfig: ${error}`),
	).andThen((regionUrl) => {
		if (!regionUrl) {
			return err(new Error("Failed to extract regionUrl from kubeconfig"));
		}
		const auth: Auth = { kubeconfigEncoded, appToken, regionUrl };
		return ok(auth);
	});
}
