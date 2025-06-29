"use client";

interface PreviewContentProps {
  url: string;
  refreshKey: number;
}

export function PreviewContent({ url, refreshKey }: PreviewContentProps) {
  return (
    <div className="relative flex-1">
      <div className="relative h-full bg-background">
        {/* Website Preview */}
        {url ? (
          <iframe
            className="h-full w-full border-0"
            key={refreshKey}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
            src={url}
            title="Website Preview"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="font-medium text-lg">No Preview Available</p>
              <p className="mt-2 text-sm">
                Select a devbox from the chat panel to preview its website
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
