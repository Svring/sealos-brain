import type { Metadata } from "next";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/providers/app-sidebar-provider";

import "./globals.css";
import "@xyflow/react/dist/style.css";
import "@copilotkit/react-ui/styles.css";

import LoginPanel from "@/components/ui/login-panel";
import { getCurrentUser } from "@/database/actions/user-actions";

import { CopilotKit } from "@copilotkit/react-core";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <html lang="en">
        <body className={`h-screen w-screen antialiased dark`}>
          <LoginPanel />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`$antialiased`}>
        <ThemeProvider>
          <SidebarProvider>
            <AppSidebar />
            <CopilotKit
              runtimeUrl={runtimeUrl}
              publicApiKey={publicApiKey}
              agent={agentName}
            >
              <main>{children}</main>
            </CopilotKit>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
