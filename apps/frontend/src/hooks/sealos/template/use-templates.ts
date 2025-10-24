"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/trpc/hooks/use-trpc-clients";

export const useTemplates = () => {
	const { template } = useTRPCClients();

	const query = useQuery(template.list.queryOptions());

  console.log("query", query);

	return query;
};
