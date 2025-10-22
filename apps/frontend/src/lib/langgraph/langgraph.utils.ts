export async function checkGraphStatus(apiUrl: string): Promise<boolean> {
	try {
		const res = await fetch(`${apiUrl}/info`);
		return res.ok;
	} catch (e) {
		console.error(e);
		return false;
	}
}

export function composeMetadata(
	kubeconfigEncoded: string,
	projectUid?: string,
	resourceUid?: string,
): Record<string, string> {
	const metadata: Record<string, string> = {
		kubeconfigEncoded,
	};

	if (projectUid) {
		metadata.projectUid = projectUid;
	}

	if (resourceUid) {
		metadata.resourceUid = resourceUid;
	}

	return metadata;
}
