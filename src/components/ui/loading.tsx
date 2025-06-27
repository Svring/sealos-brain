import { cn } from "@/lib/utils";

export function Loading({
  className,
  text,
  fullPage,
}: {
  className?: string;
  text?: string;
  fullPage?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        fullPage ? "h-screen w-screen" : "h-full",
        className,
      )}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-foreground" />
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  );
}
