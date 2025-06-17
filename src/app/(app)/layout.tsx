// Core Next.js and Type Imports
import type { Metadata } from "next";
import { Nunito } from "next/font/google";

// Provider Components
import { ThemeProvider } from "@/context/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/context/app-sidebar-provider";
import { PanelProvider } from "@/context/panel-provider";
import { SealosStoreHydrator } from "@/context/sealos-store-hydrator";
import { CopilotStateProvider } from "@/context/copilot-state-provider";
import { QueryProvider } from "@/context/query-provider";

// UI Components
import LoginPanel from "@/components/ui/login-panel";
import { Toaster } from "@/components/ui/sonner";

// Third-Party Library Components
import { CopilotKit } from "@copilotkit/react-core";

// Database Actions
import { getCurrentUser } from "@/database/actions/user-actions";

// Styles
import "./globals.css";
import "@xyflow/react/dist/style.css";
import "@copilotkit/react-ui/styles.css";

// Environment Variables
const runtimeUrl = process.env.NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL;
const publicApiKey = process.env.NEXT_PUBLIC_COPILOT_API_KEY;
const agentName = process.env.NEXT_PUBLIC_COPILOTKIT_AGENT_NAME;

// Metadata configuration
export const metadata: Metadata = {
  title: "Sealos Brain",
  description: "Sealos Brain",
};

// Font configuration
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400"],
});

// Layout component
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  // Unauthenticated state
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

  // Authenticated state
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-nunito antialiased`}>
        <ThemeProvider>
          <SidebarProvider>
            <QueryProvider>
              <SealosStoreHydrator user={user} />
              <PanelProvider>
                <CopilotKit
                  runtimeUrl={runtimeUrl}
                  publicApiKey={publicApiKey}
                  agent={agentName}
                >
                  <CopilotStateProvider>
                    <AppSidebar />
                    <main>{children}</main>
                    <Toaster />
                  </CopilotStateProvider>
                </CopilotKit>
              </PanelProvider>
            </QueryProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
