export function queryDebugLog(label: string, params: Record<string, any>) {
  console.log(`[${label}] Query running`, params);
}
