// Core Next.js and Type Imports
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
// UI Components
import LoginPanel from "@/components/ui/login-panel";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import AppSidebar from "@/context/app-sidebar-provider";
import { PanelProvider } from "@/context/panel-provider";
import { QueryProvider } from "@/context/query-provider";
import { SealosStoreHydrator } from "@/context/sealos-store-hydrator";
// Provider Components
import { ThemeProvider } from "@/context/theme-provider";

// Database Actions
import { getCurrentUser } from "@/database/actions/user-actions";

// Styles
import "./globals.css";
import "@xyflow/react/dist/style.css";
import "@copilotkit/react-ui/styles.css";

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
          className={`${nunito.variable} h-screen w-screen font-nunito antialiased`}
        >
          <LoginPanel />
        </body>
      </html>
    );
  }

  // Authenticated state
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} h-screen w-screen font-nunito antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            <SealosStoreHydrator user={user} />
            <PanelProvider>
              <SidebarProvider defaultOpen={false}>
                <AppSidebar />
                <main className="h-screen w-full">{children}</main>
                <Toaster />
              </SidebarProvider>
            </PanelProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
