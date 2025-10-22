"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { CopilotTrialAdapter } from "@/contexts/copilot/copilot-trial.adapter";
import { searchThreads } from "@/lib/langgraph/langgraph.api";

interface LayoutProps {
	children: React.ReactNode;
}

const TokenComponent = ({ token }: { token: string }) => {
	const router = useRouter();
	useEffect(() => {
		const fetchData = async () => {
			const data = await searchThreads({ token });
			console.log(data);
			if (data.length > 0) {
				router.push(`/new?threadId=${data[0]?.thread_id}`);
			}
		};
		fetchData();
	}, [token, router]);

	return <div>Token component placeholder</div>;
};

export default function Layout({ children }: LayoutProps) {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	if (token) {
		return <TokenComponent token={token} />;
	}

	return <CopilotTrialAdapter>{children}</CopilotTrialAdapter>;
}
