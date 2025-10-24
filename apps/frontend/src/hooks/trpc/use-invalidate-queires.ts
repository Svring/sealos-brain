import { useQueryClient } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useInvalidateQueries = () => {
	const queryClient = useQueryClient();
	const { instance } = useTRPCClients();

	const invalidateQueries = (
		queryKeys: any[],
		invalidateProjectResources = false,
	) => {
		const performInvalidation = async () => {
			if (invalidateProjectResources) {
				queryClient.invalidateQueries({
					queryKey: instance.resources.queryKey(),
				});
			}
			// Then invalidate the specific query keys
			const invalidationPromises = queryKeys.map(async (queryKey) => {
				return queryClient.invalidateQueries({ queryKey: queryKey });
			});

			await Promise.all(invalidationPromises);
		};

		performInvalidation();
		setTimeout(performInvalidation, 2000);
		setTimeout(performInvalidation, 6000);
	};

	return { invalidateQueries };
};
