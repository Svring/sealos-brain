"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useDisclosure } from "@reactuses/core";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import TemplateStore from "@/mvvm/sealos/template/vms/template-store.vm";

export function useTemplateModal() {
	const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();

	const TemplateModal = () => (
		<Dialog onOpenChange={onOpenChange} open={isOpen}>
			<VisuallyHidden>
				<DialogTitle>Template Store</DialogTitle>
			</VisuallyHidden>
			<DialogContent className="h-[90vh] max-h-none w-[90vw] max-w-none p-4 pt-0 rounded-xl!">
				<TemplateStore />
			</DialogContent>
		</Dialog>
	);

	return {
		isOpen,
		openDialog: onOpen,
		closeDialog: onClose,
		TemplateModal,
	};
}
