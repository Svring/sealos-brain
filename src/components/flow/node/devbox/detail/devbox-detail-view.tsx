import React from "react";
import Image from "next/image";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { useSealosStore } from "@/store/sealos-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Play, Power, RotateCcw, Trash2, Link, Link2Off } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  devboxByNameOptions,
  sshConnectionInfoOptions,
} from "@/lib/sealos/devbox/devbox-query";
import { namespaceListOptions } from "@/lib/sealos/auth/auth-query";
import { getFirstNamespaceId } from "@/lib/sealos/auth/auth-transform";
import {
  startDevboxMutation,
  shutdownDevboxMutation,
  restartDevboxMutation,
  deleteDevboxMutation,
} from "@/lib/sealos/devbox/devbox-mutation";
import { toast } from "sonner";
import { usePanel } from "@/context/panel-provider";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import {
//   activateGalateaForDevbox,
//   cleanupGalateaFilesOnDevbox,
// } from "@/lib/sealos/devbox/devbox-ssh";

export default function DevboxDetail({ devboxName }: { devboxName: string }) {
  const { currentUser, regionUrl } = useSealosStore();
  const { closePanel } = usePanel();

  const { data: devbox, isLoading } = useQuery(
    devboxByNameOptions(currentUser, regionUrl, devboxName)
  );

  // SSH connection info query
  const { data: sshConnectionInfo } = useQuery(
    sshConnectionInfoOptions(currentUser, regionUrl, devboxName)
  );

  // Namespace query
  const { data: namespaceId } = useQuery(
    namespaceListOptions(currentUser, regionUrl, getFirstNamespaceId)
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

  const handleOpenIDE = async () => {
    try {
      if (!sshConnectionInfo || !devbox || !namespaceId) {
        toast.error("Required connection information not available");
        return;
      }

      const { base64PrivateKey, userName, workingDir, token } =
        sshConnectionInfo;
      const sshPort = devbox.sshPort;
      const idePrefix = "cursor://";
      const sealosDomain = regionUrl;

      const fullUri = `${idePrefix}labring.devbox-aio?sshDomain=${encodeURIComponent(
        `${userName}@${sealosDomain}`
      )}&sshPort=${encodeURIComponent(sshPort)}&base64PrivateKey=${encodeURIComponent(
        base64PrivateKey
      )}&sshHostLabel=${encodeURIComponent(
        `${sealosDomain}_${namespaceId}_${devboxName}`
      )}&workingDir=${encodeURIComponent(workingDir)}&token=${encodeURIComponent(token)}`;

      window.location.href = fullUri;
    } catch (error: any) {
      console.error("Failed to open IDE:", error);
      toast.error(error?.message || "Failed to open IDE");
    }
  };

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

  const handleControl = async () => {
    try {
      if (!sshConnectionInfo || !devbox) {
        toast.error("Required SSH or devbox info not available");
        return;
      }
      toast.loading("Activating Galatea...", { id: "galatea-activate" });
      const devboxInfo = {
        ssh_credentials: {
          host: regionUrl,
          port: devbox.sshPort,
          username: sshConnectionInfo.userName,
          privateKey: sshConnectionInfo.base64PrivateKey,
        },
        project_public_address: devbox.projectPublicAddress || "",
      };
      // await activateGalateaForDevbox(devboxInfo);
      toast.success("Galatea activated!", { id: "galatea-activate" });
    } catch (error: any) {
      console.error("Failed to activate Galatea:", error);
      toast.error(error?.message || "Failed to activate Galatea", {
        id: "galatea-activate",
      });
    }
  };

  const handleControlUpdate = async () => {
    try {
      if (!sshConnectionInfo || !devbox) {
        toast.error("Required SSH or devbox info not available");
        return;
      }
      toast.loading("Cleaning up Galatea...", { id: "galatea-cleanup" });
      const devboxInfo = {
        ssh_credentials: {
          host: regionUrl,
          port: devbox.sshPort,
          username: sshConnectionInfo.userName,
          privateKey: sshConnectionInfo.base64PrivateKey,
        },
        project_public_address: devbox.projectPublicAddress || "",
      };
      // await cleanupGalateaFilesOnDevbox(devboxInfo);
      toast.success("Galatea cleaned up!", { id: "galatea-cleanup" });
    } catch (error: any) {
      console.error("Failed to cleanup Galatea:", error);
      toast.error(error?.message || "Failed to cleanup Galatea", {
        id: "galatea-cleanup",
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleControl}>
                <Link className="w-4 h-4" />
                <span className="sr-only">Control</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Control</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleControlUpdate}
              >
                <Link2Off className="w-4 h-4" />
                <span className="sr-only">Clean Up Control</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clean Up Control</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleOpenIDE}
                disabled={!isRunning}
              >
                <Image
                  src="https://www.cursor.com/favicon.ico"
                  alt="Cursor"
                  width={32}
                  height={32}
                />
                <span className="sr-only">Open IDE</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open IDE</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => startDevbox(devboxName)}
                disabled={isRunning || isStarting}
              >
                <Play className="w-4 h-4" />
                <span className="sr-only">
                  {isStarting ? "Starting..." : "Start"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isStarting ? "Starting..." : "Start"}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  shutdownDevbox({ devboxName, shutdownMode: "Stopped" })
                }
                disabled={!isRunning || isShuttingDown}
              >
                <Power className="w-4 h-4" />
                <span className="sr-only">
                  {isShuttingDown ? "Shutting down..." : "Shutdown"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isShuttingDown ? "Shutting down..." : "Shutdown"}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => restartDevbox(devboxName)}
                disabled={!isRunning || isRestarting}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="sr-only">
                  {isRestarting ? "Restarting..." : "Restart"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isRestarting ? "Restarting..." : "Restart"}</p>
            </TooltipContent>
          </Tooltip>
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">
                      {isDeleting ? "Deleting..." : "Delete"}
                    </span>
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isDeleting ? "Deleting..." : "Delete"}</p>
              </TooltipContent>
            </Tooltip>
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
