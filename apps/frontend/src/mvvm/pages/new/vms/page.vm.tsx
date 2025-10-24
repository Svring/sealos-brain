"use client";

import { useCopilotAdapterContext } from "@/contexts/copilot/copilot.adapter";
import { useTemplateModal } from "@/hooks/sealos/template/use-template-modal";
import { PageView } from "../views/page.view";

export const Page = () => {
	// Get copilot adapter context
	const { submitWithContext, isLoading, stop, messages, hasMessages } =
		useCopilotAdapterContext();

	// Get template modal hook
	const { openDialog, TemplateModal } = useTemplateModal();

	const handleSubmit = (message: string) => {
		submitWithContext({
			messages: [{ type: "human", content: message }],
		});
	};

	const handleStop = () => {
		stop();
	};

	const handleOpenTemplate = () => {
		openDialog();
	};

	return (
		<>
			<PageView
				messages={messages}
				isLoading={isLoading}
				hasMessages={hasMessages}
				onSubmit={handleSubmit}
				onStop={handleStop}
				onOpenTemplate={handleOpenTemplate}
			/>
			<TemplateModal />
		</>
	);
};
