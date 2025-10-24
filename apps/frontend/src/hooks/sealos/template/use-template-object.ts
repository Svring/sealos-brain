"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useTemplateObject = (name: string) => {
	const { template } = useTRPCClients();

	const query = useQuery(template.get.queryOptions(name));

	return query;
};
