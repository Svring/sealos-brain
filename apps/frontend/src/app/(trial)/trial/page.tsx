"use client";

import { motion } from "framer-motion";
import { useQueryState } from "nuqs";
import { useEffect, useRef } from "react";
import { Hero } from "@/components/ui/hero";
import { useCopilotTrialAdapterContext } from "@/contexts/copilot/copilot-trial.adapter";
import { MessagesView } from "@/mvvm/copilot/views/messages.view";
import { InputBox } from "@/mvvm/copilot/vms/input-box.vm";

const SIGNIN_URL = "https://usw.sealos.io/signin";

export default function Page() {
	// Get copilot trial adapter context
	const {
		submitWithContext,
		isLoading,
		messages,
		hasMessages,
		threadId,
		token,
	} = useCopilotTrialAdapterContext();
	const [query] = useQueryState("query");
	const hasSubmitted = useRef(false);

	// Submit query as message after 1 second delay (only once)
	useEffect(() => {
		if (query?.trim() && threadId && !hasSubmitted.current) {
			const interval = setTimeout(() => {
				hasSubmitted.current = true;
				submitWithContext({
					messages: [{ type: "human", content: decodeURIComponent(query) }],
				});
			}, 1000);

			return () => clearTimeout(interval);
		}
	}, [query, threadId, submitWithContext]);

	const handleSubmit = (message: string) => {};

	const handleStop = () => {};

	const handleRegisterClick = () => {
		window.open(`${SIGNIN_URL}?token=${token}`, "_blank");
	};

	return (
		<div className="h-full w-full flex flex-col overflow-hidden">
			<div className="flex-1 flex flex-col min-h-0 h-full">
				{/* Hero overlays the content area and fades out when messages exist */}
				{!hasMessages && (
					<motion.div
						initial={{ opacity: 0, y: 0 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.5, ease: "easeOut" }}
						className="flex-shrink-0"
					>
						<Hero
							heroTitle="Sealos Brain"
							subtitle="Let development get back to basics - focus on writing code, and let the cloud handle the rest."
							titleClassName="text-4xl md:text-5xl font-extrabold"
							subtitleClassName="text-md md:text-lg max-w-[600px]"
							actionsClassName="mt-2"
						/>
					</motion.div>
				)}

				{/* Messages area - only visible when there are messages */}
				{hasMessages && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="flex-1 flex flex-col min-h-0"
					>
						<div className="flex-1 overflow-y-auto py-8">
							<div className="max-w-3xl mx-auto w-full">
								<MessagesView messages={messages} isLoading={isLoading} />
							</div>
						</div>
					</motion.div>
				)}

				{/* Chat Input - flows naturally in the column */}
				<motion.div
					layout
					initial={!hasMessages ? { y: 0, opacity: 0 } : false}
					animate={{ y: 0, opacity: 1 }}
					transition={{
						delay: hasMessages ? 0 : 0.2,
						duration: hasMessages ? 0.4 : 0.4,
						ease: [0.45, 0, 0.55, 1],
					}}
					className={`flex-shrink-0 ${hasMessages ? "pb-8" : "py-0"}`}
				>
					<div className="container mx-auto relative max-w-3xl">
						{hasMessages ? (
							<div
								onClick={handleRegisterClick}
								className="rounded-lg border bg-background-secondary p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-150 flex items-center justify-center min-h-[100px] hover:bg-background-tertiary cursor-pointer"
							>
								<span className="text-lg">Register to proceed...</span>
							</div>
						) : (
							<InputBox
								className="max-w-3xl min-h-[140px]"
								exhibition={!hasMessages}
								onSend={handleSubmit}
								onStop={handleStop}
								isLoading={isLoading}
								disableInput={true}
								disableSend={true}
								placeholder="Please register to proceed..."
							/>
						)}
					</div>
				</motion.div>
			</div>
		</div>
	);
}
