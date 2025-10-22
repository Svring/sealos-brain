import { useMutation } from "@tanstack/react-query";
import { useQuota } from "@/hooks/k8s/use-quota";
import { validateCreationByQuota } from "@/lib/sealos/quota/quota.utils";

export const useTemplateCreate = () => {
	const { data: quota } = useQuota();
};
