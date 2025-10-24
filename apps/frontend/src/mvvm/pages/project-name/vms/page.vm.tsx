"use client";

import { instanceParser } from "@sealos-brain/k8s/resources/instance/utils";
import { useParams } from "next/navigation";
import { useFlow } from "@/hooks/flow/use-flow";
import { PageView } from "../views/page.view";

export const Page = () => {
	const { name } = useParams();

	// Create instance target from name using instanceParser
	const instance = instanceParser.toTarget(name as string);

	// Use flow hook with instance
	const { nodes, edges } = useFlow(instance);

	return <PageView nodes={nodes} edges={edges} />;
};
