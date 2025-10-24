import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type React from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DevboxToolConfig } from "@/configs/devbox-tool.config";
import QueryConfig from "@/configs/query.config";
import { ActorProvider } from "@/contexts/actor/actor.provider";
import { CopilotProvider } from "@/contexts/actor/spawns/copilot/copilot.provider";
import { FlowProvider } from "@/contexts/actor/spawns/flow/flow.provider";
import { ProjectProvider } from "@/contexts/actor/spawns/project/project.provider";
import { AuthProvider } from "@/contexts/auth/auth.provider";
import { EnvProvider } from "@/contexts/env/env.provider";
import { LangGraphProvider } from "@/contexts/langgraph/langgraph.provider";
import { ProxyProvider } from "@/contexts/proxy/proxy.provider";

import "@/styles/globals.css";

export const metadata: Metadata = {
	title: "Sealos Brain",
	description: "Sealos Brain",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{process.env.MODE === "development" ? (
					<script src="https://unpkg.com/react-scan/dist/auto.global.js" />
				) : null}
			</head>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<NuqsAdapter>
						<EnvProvider>
							<AuthProvider>
								<QueryConfig>
									<DevboxToolConfig>
										<ProxyProvider>
											<LangGraphProvider>
												<ActorProvider>
													<CopilotProvider>
														<ProjectProvider>
															<FlowProvider>
																<SidebarProvider defaultOpen={false}>
																	<AppSidebar />
																	<SidebarInset>
																		<main className="h-full w-full">
																			{children}
																		</main>
																	</SidebarInset>
																</SidebarProvider>
															</FlowProvider>
														</ProjectProvider>
													</CopilotProvider>
												</ActorProvider>
											</LangGraphProvider>
										</ProxyProvider>
									</DevboxToolConfig>
								</QueryConfig>
							</AuthProvider>
						</EnvProvider>
					</NuqsAdapter>
				</ThemeProvider>
			</body>
		</html>
	);
}
