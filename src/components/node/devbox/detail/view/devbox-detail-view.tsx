import React from "react";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { useSealosStore } from "@/store/sealos-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function DevboxDetail({ devboxName }: { devboxName: string }) {
  const { getDevboxByName } = useSealosStore();

  const devboxData = getDevboxByName(devboxName);
  const devbox = devboxData?.devbox;
  const readyData = devboxData?.readyData; // This might be null, we'll handle it

  if (!devbox) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Devbox Details</h2>
        <p>Loading devbox data for: {devboxName}</p>
      </div>
    );
  }

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{devbox.metadata?.name}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Namespace</span>
                <span>{devbox.metadata?.namespace}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phase</span>
                <Badge
                  variant={
                    devbox.status?.phase === "Running"
                      ? "default"
                      : devbox.status?.phase === "Shutdown"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {devbox.status?.phase}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">State</span>
                <Badge
                  variant={
                    devbox.spec?.state === "Running"
                      ? "default"
                      : devbox.spec?.state === "Shutdown"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {devbox.spec?.state}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>
                  {new Date(
                    devbox.metadata?.creationTimestamp
                  ).toLocaleString()}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Template ID</span>
                <span className="font-mono text-xs">
                  {devbox.spec?.templateID}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "configuration",
      label: "Configuration",
      content: (
        <ScrollArea className="h-full pr-4">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Container Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Image</span>
                <span className="font-mono text-xs">{devbox.spec?.image}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">User</span>
                <span>{devbox.spec?.config?.user}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Working Dir</span>
                <span className="font-mono text-xs">
                  {devbox.spec?.config?.workingDir}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Squash</span>
                <span>{devbox.spec?.squash ? "Yes" : "No"}</span>
              </div>
              {devbox.spec?.config?.releaseCommand && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground block mb-1">
                      Release Command
                    </span>
                    <code className="bg-card/50 rounded p-2 block font-mono text-xs">
                      {devbox.spec.config.releaseCommand.join(" ")}
                    </code>
                  </div>
                </>
              )}
              {devbox.spec?.config?.releaseArgs &&
                devbox.spec.config.releaseArgs.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground block mb-1">
                        Release Args
                      </span>
                      <code className="bg-card/50 rounded p-2 block font-mono text-xs">
                        {devbox.spec.config.releaseArgs.join(" ")}
                      </code>
                    </div>
                  </>
                )}
            </CardContent>
          </Card>
        </ScrollArea>
      ),
    },
    {
      id: "resources",
      label: "Resources",
      content: (
        <div className="grid gap-4">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Allocation</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-card rounded p-3 flex flex-col items-center">
                <span className="text-muted-foreground">CPU</span>
                <span className="font-bold text-lg">
                  {devbox.spec?.resource?.cpu}
                </span>
              </div>
              <div className="bg-card rounded p-3 flex flex-col items-center">
                <span className="text-muted-foreground">Memory</span>
                <span className="font-bold text-lg">
                  {devbox.spec?.resource?.memory}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Network</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type</span>
                <span>{devbox.spec?.network?.type}</span>
              </div>
              {devbox.status?.network?.nodePort && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Node Port</span>
                    <span className="font-mono text-xs">
                      {devbox.status.network.nodePort}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "services",
      label: "Services",
      content: (
        <ScrollArea className="h-full pr-4">
          {readyData && readyData.length > 0 ? (
            readyData.map((service: any, idx: number) => (
              <Card key={idx} className="mb-4 bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Service {idx + 1}
                  </CardTitle>
                  <Badge variant={service.ready ? "default" : "destructive"}>
                    {service.ready ? "Ready" : "Not Ready"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">URL</span>
                    <a
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-primary font-mono text-xs"
                    >
                      {service.url}
                    </a>
                  </div>
                  {service.error && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Error</span>
                      <span className="text-destructive text-xs">
                        {service.error}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              No service data available
            </div>
          )}
        </ScrollArea>
      ),
    },
    {
      id: "status",
      label: "Status",
      content: (
        <ScrollArea className="h-full pr-4">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phase</span>
                <span>{devbox.status?.phase}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Generation</span>
                <span>{devbox.metadata?.generation}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Resource Version</span>
                <span className="font-mono text-xs">
                  {devbox.metadata?.resourceVersion}
                </span>
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Devbox Details</h2>
      <AnimatedTabs
        tabs={tabs}
        defaultTab="overview"
        className="w-full max-w-none"
      />
    </div>
  );
}
