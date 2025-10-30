import { useQueryClient } from "@tanstack/react-query";
import type { TRPCQueryKey } from "@trpc/tanstack-react-query";

export interface InvalidationOptions {
	/**
	 * Maximum number of retry attempts (default: 0, meaning no retries)
	 * Set to a positive number to enable retries with exponential backoff
	 */
	maxRetries?: number;
	/**
	 * Initial delay in milliseconds before first invalidation (default: 500)
	 */
	initialDelay?: number;
	/**
	 * Maximum delay in milliseconds between retries (default: 10000)
	 * Used to cap exponential backoff
	 */
	maxDelay?: number;
	/**
	 * Multiplier for exponential backoff (default: 2)
	 * Delay = initialDelay * (multiplier ^ retryCount)
	 */
	backoffMultiplier?: number;
}

const DEFAULT_OPTIONS: Required<InvalidationOptions> = {
	maxRetries: 0,
	initialDelay: 500,
	maxDelay: 10000,
	backoffMultiplier: 2,
};

export const useInvalidateQueries = () => {
	const queryClient = useQueryClient();

	const invalidateQueries = (
		queryKeys: TRPCQueryKey[],
		options: InvalidationOptions = {},
	) => {
		const opts = { ...DEFAULT_OPTIONS, ...options };

		const performInvalidation = async () => {
			// Invalidate the specific query keys
			const invalidationPromises = queryKeys.map(async (queryKey) => {
				return queryClient.invalidateQueries({ queryKey: queryKey });
			});

			await Promise.all(invalidationPromises);
		};

		// First invalidation after initial delay
		setTimeout(() => {
			performInvalidation();

			// Retry with exponential backoff (only if maxRetries > 0)
			if (opts.maxRetries > 0) {
				let retryCount = 0;
				const scheduleRetry = () => {
					if (retryCount >= opts.maxRetries) {
						return;
					}

					const delay = Math.min(
						opts.initialDelay * opts.backoffMultiplier ** retryCount,
						opts.maxDelay,
					);

					setTimeout(() => {
						performInvalidation();
						retryCount++;
						scheduleRetry();
					}, delay);
				};

				scheduleRetry();
			}
		}, opts.initialDelay);
	};

	return { invalidateQueries };
};
