import type { Metadata } from "next";
import { Nunito } from "next/font/google";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/providers/app-sidebar-provider";
import { NodeViewProvider } from "@/components/node/node-view-provider";
import { SealosStoreHydrator } from "@/components/providers/sealos-store-hydrator";

import "./globals.css";
import "@xyflow/react/dist/style.css";
import "@copilotkit/react-ui/styles.css";

import LoginPanel from "@/components/ui/login-panel";
import { getCurrentUser } from "@/database/actions/user-actions";

import { CopilotKit } from "@copilotkit/react-core";

import QueryProvider from "@/components/providers/query-provider";

// Where CopilotKit will proxy requests to. If you're using Copilot Cloud, this environment variable will be empty.
const runtimeUrl = process.env.NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL;
// When using Copilot Cloud, all we need is the publicApiKey.
const publicApiKey = process.env.NEXT_PUBLIC_COPILOT_API_KEY;
// The name of the agent that we'll be using.
const agentName = process.env.NEXT_PUBLIC_COPILOTKIT_AGENT_NAME;

export const metadata: Metadata = {
  title: "Sealos Brain",
  description: "Sealos Brain",
};

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const user = await getCurrentUser();

  if (!user) {
    return (
      <html lang="en">
        <body
          className={`${nunito.variable} h-screen w-screen font-nunito antialiased dark`}
        >
          <LoginPanel />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${nunito.variable} font-nunito antialiased`}>
        <ThemeProvider>
          <SidebarProvider>
            <QueryProvider>
              {/* Hydrate the store with current user before any components that depend on it */}
              <SealosStoreHydrator user={user} />
              <AppSidebar />
              <CopilotKit
                runtimeUrl={runtimeUrl}
                publicApiKey={publicApiKey}
                agent={agentName}
              >
                <NodeViewProvider>
                  <main>{children}</main>
                </NodeViewProvider>
              </CopilotKit>
            </QueryProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
