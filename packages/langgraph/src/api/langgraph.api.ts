"use server";

import { Client, type Metadata, type Thread } from "@langchain/langgraph-sdk";

const createClient = (apiUrl: string) => {
	return new Client({
		apiUrl,
	});
};

export const createThread = async ({
	apiUrl,
	graphId,
	metadata,
	supersteps,
}: {
	apiUrl: string;
	graphId: string;
	metadata: Metadata;
	supersteps?: Array<{
		updates: Array<{
			values: Record<string, unknown>;
			asNode: string;
		}>;
	}>;
}) => {
	const client = createClient(apiUrl);

	const createOptions: {
		metadata: Metadata;
		graphId: string;
		supersteps?: Array<{
			updates: Array<{
				values: Record<string, unknown>;
				asNode: string;
			}>;
		}>;
	} = {
		metadata,
		graphId,
	};

	// Add supersteps if provided
	if (supersteps) {
		createOptions.supersteps = supersteps;
	}

	return await client.threads.create(createOptions);
};

export const listThreads = async (apiUrl: string) => {
	const client = createClient(apiUrl);
	return await client.threads.search({ limit: 10 });
};

export const getThread = async (apiUrl: string, threadId: string) => {
	const client = createClient(apiUrl);
	return await client.threads.get(threadId);
};

export const updateThreadState = async (
	apiUrl: string,
	threadId: string,
	values: Record<string, unknown>,
) => {
	const client = createClient(apiUrl);
	return await client.threads.updateState(threadId, { values });
};

export const deleteThread = async (apiUrl: string, threadId: string) => {
	const client = createClient(apiUrl);
	return await client.threads.delete(threadId);
};

export const patchThread = async (
	apiUrl: string,
	threadId: string,
	metadata: Metadata,
) => {
	try {
		const response = await fetch(`${apiUrl}/threads/${threadId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				metadata: metadata,
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		return result;
	} catch (error) {
		console.error("[patchThread] Error patching thread", error);
		throw error;
	}
};

export const searchThreads = async (
	apiUrl: string,
	metadata: Record<string, unknown>,
): Promise<Thread[]> => {
	const client = createClient(apiUrl);

	console.log("metadata", metadata);

	const res = await client.threads
		.search({
			metadata,
			sortBy: "updated_at",
			sortOrder: "desc",
			limit: 20,
		})
		.then((res) => {
			return res.filter((obj) => obj.values);
		});

	console.log(
		"res",
		res.map((obj) => {
			return {
				threadId: obj.thread_id,
				projectUid: obj.metadata?.projectUid,
				resourceUid: obj.metadata?.resourceUid,
			};
		}),
	);

	return res;
};

export const getThreadState = async (apiUrl: string, threadId: string) => {
	const client = createClient(apiUrl);
	return await client.threads.getState(threadId);
};
