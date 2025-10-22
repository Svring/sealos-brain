"use client";

interface NodeTitleProps {
  resourceType: string;
  name: string;
  iconURL: string;
}

export default function NodeTitle({
  resourceType,
  name,
  iconURL,
}: NodeTitleProps) {
  return (
    <div className="flex items-center gap-2 truncate font-medium flex-1 min-w-0">
      <div className="flex flex-col items-start">
        <span className="flex items-center gap-2">
          <img
            src={iconURL}
            alt={`Icon`}
            width={24}
            height={24}
            className="rounded-lg h-9 w-9 flex-shrink-0 p-1 bg-muted"
          />
          <span className="flex flex-col min-w-0">
            <span className="text-xs text-muted-foreground leading-none capitalize">
              {resourceType}
            </span>
            <span className="text-lg font-bold text-foreground leading-tight truncate">
              {name.length > 8 ? `${name.slice(0, 15)}...` : name}
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}
