import type { Metadata } from "next";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/providers/app-sidebar-provider";

import "./globals.css";
import "@xyflow/react/dist/style.css";
import LoginPanel from "@/components/ui/login-panel";
import { getCurrentUser } from "@/database/actions/user-actions";

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
            <main>{children}</main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
