import type { Metadata } from "next";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/providers/app-sidebar-provider";

import "./globals.css";
import '@xyflow/react/dist/style.css';


export const metadata: Metadata = {
  title: "Sealos Brain",
  description: "Sealos Brain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`$antialiased`}
      >
        <ThemeProvider
        >
          <SidebarProvider>
            <AppSidebar />
            <main>
              {children}
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
