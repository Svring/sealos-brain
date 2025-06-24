// Core Next.js and Type Imports
import type { Metadata } from "next";
import { Nunito } from "next/font/google";

// Provider Components
import { ThemeProvider } from "@/context/theme-provider";
import AppSidebar from "@/context/app-sidebar-provider";
import { PanelProvider } from "@/context/panel-provider";
import { SealosStoreHydrator } from "@/context/sealos-store-hydrator";
import { QueryProvider } from "@/context/query-provider";
import { SidebarProvider } from "@/components/ui/sidebar";

// UI Components
import LoginPanel from "@/components/ui/login-panel";
import { Toaster } from "@/components/ui/sonner";

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
        className={`${nunito.variable} font-nunito antialiased w-screen h-screen`}
      >
        <ThemeProvider>
          <QueryProvider>
            <SealosStoreHydrator user={user} />
            <PanelProvider>
              <SidebarProvider defaultOpen={false}>
                <AppSidebar />
                <main className="w-full h-screen">{children}</main>
                <Toaster />
              </SidebarProvider>
            </PanelProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
