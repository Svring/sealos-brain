/**
 * Get the ID of the first namespace from the namespace list response
 */
export const getFirstNamespaceId = (rawData: any) => {
  const { namespaces } = rawData.data;
  return namespaces?.[0]?.id || "";
};
