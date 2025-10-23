/**
 * Composes the base URL for AI Proxy API
 * @param baseUrl - The base URL (region URL)
 * @returns The complete API base URL
 */
export function composeAiProxyBaseUrl(baseUrl: string): string {
	return `http://aiproxy-web.${baseUrl}/api`;
}

/**
 * Composes the base URL for AI Proxy Chat API
 * @param baseUrl - The base URL (region URL)
 * @returns The complete Chat API base URL
 */
export function composeAiProxyChatUrl(baseUrl: string): string {
	return `http://aiproxy.${baseUrl}/v1`;
}
