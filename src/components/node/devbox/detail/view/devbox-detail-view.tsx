import React from "react";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { useSealosStore } from "@/store/sealos-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Play, Power, RotateCcw, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { devboxByNameOptions } from "@/lib/devbox/devbox-query";
import {
  startDevboxMutation,
  shutdownDevboxMutation,
  restartDevboxMutation,
  deleteDevboxMutation,
} from "@/lib/devbox/devbox-mutation";
import { toast } from "sonner";
import { usePanel } from "@/components/node/panel-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DevboxDetail({ devboxName }: { devboxName: string }) {
  const { currentUser, regionUrl } = useSealosStore();
  const { closePanel } = usePanel();

  const { data: devbox, isLoading } = useQuery(
    devboxByNameOptions(currentUser, regionUrl, devboxName)
  );

  // Mutation hooks
  const { mutateAsync: startDevbox, isPending: isStarting } =
    startDevboxMutation(currentUser, regionUrl);
  const { mutateAsync: shutdownDevbox, isPending: isShuttingDown } =
    shutdownDevboxMutation(currentUser, regionUrl);
  const { mutateAsync: restartDevbox, isPending: isRestarting } =
    restartDevboxMutation(currentUser, regionUrl);
  const { mutateAsync: deleteDevbox, isPending: isDeleting } =
    deleteDevboxMutation(currentUser, regionUrl);

  const handleDelete = async () => {
    try {
      toast.loading("Deleting devbox...", { id: "delete-devbox" });
      await deleteDevbox(devboxName);
      toast.success("Devbox deleted successfully!", { id: "delete-devbox" });
      closePanel();
    } catch (error: any) {
      console.error("Failed to delete devbox:", error);
      toast.error(error?.message || "Failed to delete devbox", {
        id: "delete-devbox",
      });
    }
  };

  if (isLoading || !devbox) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Devbox Details</h2>
        </div>
        <p>Loading devbox data for: {devboxName}</p>
      </div>
    );
  }

  const isRunning = devbox.status.value === "Running";
  const templateConfig =
    typeof devbox.templateConfig === "string"
      ? JSON.parse(devbox.templateConfig)
      : devbox.templateConfig;

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
                <span className="font-medium">{devbox.name}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="flex items-center gap-2">
                  <span
                    className="rounded px-2 py-0.5 text-xs"
                    style={{
                      color: devbox.status.color,
                      background: devbox.status.backgroundColor,
                    }}
                  >
                    {devbox.status.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({devbox.status.value})
                  </span>
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(devbox.createTime).toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Image</span>
                <span className="font-mono text-xs">{devbox.image}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Icon</span>
                <span className="font-mono text-xs">{devbox.iconId}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Template</span>
                <span>{devbox.templateName}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Repository</span>
                <span>{devbox.templateRepositoryName}</span>
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
        <ScrollArea className="h-full">
          <div className="space-y-4">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Container Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">User</span>
                  <span>{templateConfig.user}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Working Dir</span>
                  <span className="font-mono text-xs">
                    {templateConfig.workingDir}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Release Command</span>
                  <span className="font-mono text-xs">
                    {templateConfig.releaseCommand?.join(" ")}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Release Args</span>
                  <span className="font-mono text-xs">
                    {templateConfig.releaseArgs?.join(" ")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      ),
    },
    {
      id: "network",
      label: "Network",
      content: (
        <ScrollArea className="h-full">
          <div className="space-y-4">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Networks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {devbox.networks.map((net: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Port Name</span>
                      <span className="font-mono text-xs">{net.portName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Port</span>
                      <span className="font-mono text-xs">{net.port}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Protocol</span>
                      <span className="font-mono text-xs">{net.protocol}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Network Name
                      </span>
                      <span className="font-mono text-xs">
                        {net.networkName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Public Domain
                      </span>
                      <span className="font-mono text-xs">
                        {net.publicDomain}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Custom Domain
                      </span>
                      <span className="font-mono text-xs">
                        {net.customDomain}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Ports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {templateConfig.ports.map((port: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-mono text-xs">{port.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Container Port
                      </span>
                      <span className="font-mono text-xs">
                        {port.containerPort}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Protocol</span>
                      <span className="font-mono text-xs">{port.protocol}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            {templateConfig.appPorts.length > 0 && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle>Application Ports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {templateConfig.appPorts.map((port: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-mono text-xs">{port.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Port</span>
                        <span className="font-mono text-xs">{port.port}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Target Port
                        </span>
                        <span className="font-mono text-xs">
                          {port.targetPort}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Protocol</span>
                        <span className="font-mono text-xs">
                          {port.protocol}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      ),
    },
    {
      id: "resource",
      label: "Resource",
      content: (
        <ScrollArea className="h-full">
          <div className="space-y-4">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">CPU</span>
                  <span className="font-bold text-lg">{devbox.cpu}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Memory</span>
                  <span className="font-bold text-lg">{devbox.memory}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">GPU</span>
                  <span className="font-mono text-xs">
                    {devbox.gpu.type} ({devbox.gpu.amount})
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Used CPU</span>
                  <span className="font-mono text-xs">
                    {devbox.usedCpu.xData.join(", ")} {devbox.usedCpu.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Used Memory</span>
                  <span className="font-mono text-xs">
                    {devbox.usedMemory.xData.join(", ")}{" "}
                    {devbox.usedMemory.name}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      ),
    },
    {
      id: "advanced",
      label: "Advanced",
      content: (
        <ScrollArea className="h-full">
          <div className="space-y-4">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Advanced Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">SSH Port</span>
                  <span className="font-mono text-xs">{devbox.sshPort}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Paused</span>
                  <span>{devbox.isPause ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Last Terminated Reason
                  </span>
                  <span>{devbox.lastTerminatedReason}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Devbox Details</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => startDevbox(devboxName)}
            disabled={isRunning || isStarting}
            className="flex items-center gap-1"
          >
            <Play className="w-4 h-4" />
            {isStarting ? "Starting..." : "Start"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              shutdownDevbox({ devboxName, shutdownMode: "Stopped" })
            }
            disabled={!isRunning || isShuttingDown}
            className="flex items-center gap-1"
          >
            <Power className="w-4 h-4" />
            {isShuttingDown ? "Shutting down..." : "Shutdown"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => restartDevbox(devboxName)}
            disabled={!isRunning || isRestarting}
            className="flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            {isRestarting ? "Restarting..." : "Restart"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                className="flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Devbox</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the devbox "{devbox.name}"?
                  This action cannot be undone and will permanently remove all
                  data associated with this devbox.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Devbox
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <AnimatedTabs
          tabs={tabs}
          defaultTab="overview"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
