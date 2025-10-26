"use client";

import type { Message } from "@langchain/langgraph-sdk";
import { useStream } from "@langchain/langgraph-sdk/react";
import { useAuthState } from "@/contexts/auth/auth.context";
import { useLangGraphState } from "@/contexts/langgraph/langgraph.context";

interface UseStreamContextProps {
	apiUrl: string;
	assistantId: string;
	threadId?: string;
}

export function useStreamContext({
	apiUrl,
	assistantId,
	threadId,
}: UseStreamContextProps) {
	const { graphState } = useLangGraphState();
	const { auth } = useAuthState();

	const { submit, isLoading, stop, messages, interrupt, joinStream } =
		useStream({
			apiUrl,
			assistantId,
			threadId,
			messagesKey: "messages",
			reconnectOnMount: true,
		});

	const submitWithContext = (data: { messages: Message[] }) => {
		return submit(
			{
				apiKey: graphState.apiKey,
				kubeconfigEncoded: auth?.kubeconfigEncoded,
				messages: data.messages,
			},
			{
				optimisticValues(prev) {
					const prevMessages = prev.messages ?? [];
					// @ts-expect-error Suppress iterable type error for newMessages
					const newMessages = [...prevMessages, ...data.messages];
					return { ...prev, messages: newMessages };
				},
			},
		);
	};

	return {
		submitWithContext,
		isLoading,
		stop,
		messages,
		interrupt,
		joinStream,
	};
}
