"use client";

import type { Interrupt, Message, Thread } from "@langchain/langgraph-sdk";
import { useMount } from "@reactuses/core";
import { searchThreads } from "@sealos-brain/langgraph/api";
import { useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { createContext, use, useState } from "react";
import { useLangGraphState } from "@/contexts/langgraph/langgraph.context";
import { useCopilotMount } from "@/hooks/copilot/use-copilot-mount";
import { useCreateThread } from "@/hooks/langgraph/use-create-thread";
import { useSearchThreads } from "@/hooks/langgraph/use-search-threads";
import { useStreamContext } from "@/hooks/langgraph/use-stream-context";

interface CopilotAdapterContextValue {
	threads: Thread[];
	threadId: string;
	metadata?: Record<string, string>;
	setThreadId: (threadId: string) => void;
	createNewThread: () => void;
	submitWithContext: (data: { messages: Message[] }) => void;
	isLoading: boolean;
	stop: () => void;
	messages: Message[];
	hasMessages: boolean;
	interrupt: Interrupt<unknown> | undefined;
	joinStream: (runId: string) => Promise<void>;
	isMounting: boolean;
}

export const copilotAdapterContext = createContext<
	CopilotAdapterContextValue | undefined
>(undefined);

interface CopilotAdapterProps {
	children: ReactNode;
	metadata: Record<string, string>;
}

export function CopilotAdapter({ children, metadata }: CopilotAdapterProps) {
	const [threadId, setThreadId] = useQueryState("threadId");
	const [isMounting, setIsMounting] = useState(true);
	const { deploymentUrl } = useLangGraphState();

	// Handle mount logic (health check and route setting)
	// useCopilotMount({ metadata });

	// Search threads based on metadata
	const { data: threads } = useSearchThreads(metadata);
	const { mutate: createThread } = useCreateThread();

	// Create new thread function
	const createNewThread = () => {
		createThread(
			{ metadata },
			{
				onSuccess: (data) => {
					setThreadId(data.thread_id);
					setIsMounting(false);
				},
			},
		);
	};

	useMount(() => {
		const getThreads = async () => {
			const threads = await searchThreads(deploymentUrl, metadata);
			if (threads && threads.length > 0 && threads[0]?.thread_id) {
				setThreadId(threads[0].thread_id);
				setIsMounting(false);
			} else {
				createNewThread();
			}
		};
		getThreads();
	});

	// Use stream context hook
	const {
		submitWithContext,
		isLoading,
		stop,
		messages,
		interrupt,
		joinStream,
	} = useStreamContext({
		apiUrl: deploymentUrl,
		assistantId: metadata.graphId ?? "",
		threadId: threadId ?? undefined,
	});

	return (
		<copilotAdapterContext.Provider
			value={{
				threads: (threads ?? []).map((thread) => ({
					...thread,
					metadata: thread.metadata ?? {},
				})),
				threadId: threadId ?? "",
				metadata,
				setThreadId,
				createNewThread,
				submitWithContext,
				isLoading,
				stop,
				messages,
				hasMessages: messages && messages.length > 0,
				interrupt,
				joinStream,
				isMounting,
			}}
		>
			{children}
		</copilotAdapterContext.Provider>
	);
}

export function useCopilotAdapterContext() {
	const ctx = use(copilotAdapterContext);
	if (!ctx) {
		throw new Error(
			"useCopilotAdapterContext must be used within CopilotAdapter",
		);
	}
	return ctx;
}
