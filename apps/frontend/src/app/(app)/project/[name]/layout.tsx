"use client";

import { instanceParser } from "@sealos-brain/k8s/resources/instance/utils";
import { useParams } from "next/navigation";
import type React from "react";
import { useEffect, useMemo } from "react";
import { useProjectEvents } from "@/contexts/actor/spawns/project/project.context";
import { useInstanceObject } from "@/hooks/sealos/instance/use-instance-object";

interface LayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	const { name } = useParams();
	const { setProject } = useProjectEvents();
	const instanceTarget = useMemo(
		() => instanceParser.toTarget(name as string),
		[name],
	);

	const { data: instance } = useInstanceObject(instanceTarget);

	useEffect(() => {
		if (instance) {
			setProject({
				uid: instance.uid,
				target: instanceTarget,
				object: instance,
			});
		}
	}, [instance, setProject, instanceTarget]);

	return <>{children}</>;
}
