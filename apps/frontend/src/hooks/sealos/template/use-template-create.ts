import { validateCreationByQuota } from "@sealos-brain/k8s/resources/quota/utils";
import { useMutation } from "@tanstack/react-query";
import { useQuota } from "@/hooks/k8s/use-quota";

export const useTemplateCreate = () => {
	const { data: quota } = useQuota();
};
