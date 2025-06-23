import { AiproxyColumn } from "@/components/inventory/aiproxy/aiproxy-table-schema";
import { AIProxyNodeData } from "@/components/flow/node/aiproxy/aiproxy-node";

export function transformAIProxyTokensToTable(data: any): AiproxyColumn[] {
  // Handle nested response structure: { code: 200, data: { tokens: [...], total: 1 } }
  const responseData = data?.data || data;
  const tokens = responseData?.tokens;

  if (!tokens || !Array.isArray(tokens)) {
    return [];
  }

  return tokens.map((token: any) => ({
    id: token.id?.toString() || "",
    name: token.name || "Unnamed",
    status: token.status === 1 ? "Active" : "Inactive",
    token: token.key ? `${token.key.substring(0, 20)}...` : "N/A",
    count: token.request_count?.toString() || "0",
    charged: `$${(token.used_amount / 100000 || 0).toFixed(2)}`, // Convert from cents to dollars
    createdAt: token.created_at
      ? new Date(token.created_at).toLocaleDateString()
      : "N/A",
  }));
}

export function transformAIProxyTokensToNodes(data: any): AIProxyNodeData[] {
  // Handle nested response structure: { code: 200, data: { tokens: [...], total: 1 } }
  const responseData = data?.data || data;
  const tokens = responseData?.tokens;

  if (!tokens || !Array.isArray(tokens)) {
    return [];
  }

  return tokens.map((token: any) => ({
    id: token.id?.toString() || `aiproxy-${token.name}`,
    name: token.name || "Unnamed Token",
    key: token.key || "",
    status: token.status || 0,
    quota: token.quota || 0,
    used_amount: token.used_amount || 0,
    request_count: token.request_count || 0,
    created_at: token.created_at || Date.now(),
    expired_at: token.expired_at || -1,
    group: token.group,
  }));
}
