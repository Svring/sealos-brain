"use client";

import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

interface PreviewContentProps {
  previewTab: string;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

export function PreviewContent({ previewTab, isDarkMode, setIsDarkMode }: PreviewContentProps) {
  return (
    <div className="flex-1 relative">
      {previewTab === "preview" ? (
        <div className="h-full bg-zinc-950 flex items-center justify-center relative">
          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 border-zinc-700 hover:bg-zinc-800"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Main Content */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-white">
              Next.js Starter
            </h1>
            <p className="text-zinc-400">
              Built with shadcn/ui and next-themes
            </p>
            <div className="text-sm text-zinc-400">
              Get started by editing{" "}
              <code className="bg-zinc-800 px-2 py-1 rounded text-zinc-300 font-mono">
                app/page.tsx
              </code>
            </div>
            <Button className="mt-4 bg-white text-black hover:bg-zinc-200">
              Button
            </Button>
          </div>
        </div>
      ) : (
        <div className="h-full bg-zinc-900 p-4">
          <pre className="text-sm text-zinc-300 font-mono">
            <code>{`import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="min-h-svh">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex min-h-svh items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold">Next.js Starter</h1>
          <p className="text-muted-foreground">Built with shadcn/ui and next-themes</p>
          <div className="text-sm">
            Get started by editing{" "}
            <code className="rounded bg-black/[.05] px-1 py-0.5 font-semibold dark:bg-white/[.06]">app/page.tsx</code>
          </div>
          <Button size="sm" className="mt-4">
            Button
          </Button>
        </div>
      </div>
    </div>
  )
}`}</code>
          </pre>
        </div>
      )}
    </div>
  );
} 