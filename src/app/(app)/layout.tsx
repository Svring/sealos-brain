// Types and metadata
import type { Metadata } from "next";
import { Nunito } from "next/font/google";

// Component imports
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/providers/app-sidebar-provider";
import { PanelProvider } from "@/components/node/panel-provider";
import { SealosStoreHydrator } from "@/components/providers/sealos-store-hydrator";
import LoginPanel from "@/components/ui/login-panel";
import { CopilotKit } from "@copilotkit/react-core";
import QueryProvider from "@/components/providers/query-provider";

// Database actions
import { getCurrentUser } from "@/database/actions/user-actions";

// Styles
import "./globals.css";
import "@xyflow/react/dist/style.css";
import "@copilotkit/react-ui/styles.css";

// Environment variables
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
              <AppSidebar />
              <CopilotKit
                runtimeUrl={runtimeUrl}
                publicApiKey={publicApiKey}
                agent={agentName}
              >
                <PanelProvider>
                  <main>{children}</main>
                </PanelProvider>
              </CopilotKit>
            </QueryProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
