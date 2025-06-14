import React, { useState, useEffect } from "react";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { useSealosStore } from "@/store/sealos-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useSealosDevbox } from "@/hooks/use-sealos-devbox";
import { devboxEvents } from "@/hooks/use-devbox-sidebar";
import { Play, Power, RotateCcw, Activity } from "lucide-react";
import { MonitorDataResult } from "@/lib/devbox/schemas/monitor-schema";

export default function DevboxDetail({ devboxName }: { devboxName: string }) {
  const { getDevboxByName } = useSealosStore();
  const { startDevbox, shutdownDevbox, restartDevbox, getMonitorData } = useSealosDevbox();
  
  const [monitorData, setMonitorData] = useState<{
    cpu?: MonitorDataResult[];
    memory?: MonitorDataResult[];
    disk?: MonitorDataResult[];
  }>({});
  const [loadingMonitor, setLoadingMonitor] = useState(false);

  const devboxData = getDevboxByName(devboxName);
  const devbox = devboxData?.devbox;
  const readyData = devboxData?.readyData;

  const handleStart = async () => {
    try {
      await startDevbox(devboxName);
      devboxEvents.emit('devbox-action-completed', { action: 'start', devboxName });
    } catch (error) {
      console.error("Failed to start devbox:", error);
    }
  };

  const handleShutdown = async () => {
    try {
      await shutdownDevbox(devboxName);
      devboxEvents.emit('devbox-action-completed', { action: 'shutdown', devboxName });
    } catch (error) {
      console.error("Failed to shutdown devbox:", error);
    }
  };

  const handleRestart = async () => {
    try {
      await restartDevbox(devboxName);
      devboxEvents.emit('devbox-action-completed', { action: 'restart', devboxName });
    } catch (error) {
      console.error("Failed to restart devbox:", error);
    }
  };

  const fetchMonitorData = async () => {
    if (!devboxName) return;
    
    setLoadingMonitor(true);
    try {
      const [cpuData, memoryData, diskData] = await Promise.allSettled([
        getMonitorData({
          queryName: devboxName,
          queryKey: 'cpu',
          step: '1m'
        }),
        getMonitorData({
          queryName: devboxName,
          queryKey: 'memory',
          step: '1m'
        }),
        getMonitorData({
          queryName: devboxName,
          queryKey: 'disk',
          step: '1m'
        })
      ]);

      setMonitorData({
        cpu: cpuData.status === 'fulfilled' ? cpuData.value : undefined,
        memory: memoryData.status === 'fulfilled' ? memoryData.value : undefined,
        disk: diskData.status === 'fulfilled' ? diskData.value : undefined,
      });
    } catch (error) {
      console.error("Failed to fetch monitor data:", error);
    } finally {
      setLoadingMonitor(false);
    }
  };

  if (!devbox) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Devbox Details</h2>
        </div>
        <p>Loading devbox data for: {devboxName}</p>
      </div>
    );
  }

  const isRunning = devbox.status?.phase === "Running";

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
                <span className="text-muted-foreground">Created</span>
                <span>
                  {new Date(
                    devbox.metadata?.creationTimestamp
                  ).toLocaleString()}
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
        <ScrollArea className="h-full">
          <div className="space-y-4">
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
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Template ID</span>
                  <span className="font-mono text-xs">
                    {devbox.spec?.templateID}
                  </span>
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

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Resource Allocation</CardTitle>
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
                <CardTitle>Network Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {devbox.spec?.config?.ports?.map((port: any, index: number) => (
                  <div key={index} className="space-y-3">
                    {index > 0 && <Separator />}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Port Name</span>
                      <span className="font-mono text-xs">{port.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Container Port</span>
                      <span className="font-mono text-xs">{port.containerPort}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Protocol</span>
                      <span className="font-mono text-xs">{port.protocol}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {devbox.spec?.config?.appPorts && devbox.spec.config.appPorts.length > 0 && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle>Application Ports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {devbox.spec.config.appPorts.map((port: any, index: number) => (
                    <div key={index} className="space-y-3">
                      {index > 0 && <Separator />}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-mono text-xs">{port.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Port</span>
                        <span className="font-mono text-xs">{port.port}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Target Port</span>
                        <span className="font-mono text-xs">{port.targetPort}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Protocol</span>
                        <span className="font-mono text-xs">{port.protocol}</span>
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
      id: "monitor",
      label: "Monitor",
      content: (
        <ScrollArea className="h-full">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Performance Metrics</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMonitorData}
                disabled={loadingMonitor}
                className="flex items-center gap-1"
              >
                <Activity className="w-4 h-4" />
                {loadingMonitor ? "Loading..." : "Refresh"}
              </Button>
            </div>
            
            {loadingMonitor ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                Loading monitor data...
              </div>
            ) : (
              <div className="grid gap-4">
                {/* CPU Metrics */}
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-sm">CPU Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {monitorData.cpu && monitorData.cpu.length > 0 ? (
                      <div className="space-y-2">
                        {monitorData.cpu.map((item, idx) => (
                          <div key={idx} className="text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{item.name}</span>
                              <span>{item.yData[item.yData.length - 1]}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">No CPU data available</div>
                    )}
                  </CardContent>
                </Card>

                {/* Memory Metrics */}
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {monitorData.memory && monitorData.memory.length > 0 ? (
                      <div className="space-y-2">
                        {monitorData.memory.map((item, idx) => (
                          <div key={idx} className="text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{item.name}</span>
                              <span>{item.yData[item.yData.length - 1]}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">No memory data available</div>
                    )}
                  </CardContent>
                </Card>

                {/* Disk Metrics */}
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Disk Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {monitorData.disk && monitorData.disk.length > 0 ? (
                      <div className="space-y-2">
                        {monitorData.disk.map((item, idx) => (
                          <div key={idx} className="text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{item.name}</span>
                              <span>{item.yData[item.yData.length - 1]}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">No disk data available</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      ),
    },
    {
      id: "release",
      label: "Release",
      content: (
        <ScrollArea className="h-full">
          <div className="text-center text-sm text-muted-foreground py-8">
            No release data available
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
            onClick={handleStart}
            disabled={isRunning}
            className="flex items-center gap-1"
          >
            <Play className="w-4 h-4" />
            Start
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShutdown}
            disabled={!isRunning}
            className="flex items-center gap-1"
          >
            <Power className="w-4 h-4" />
            Shutdown
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            disabled={!isRunning}
            className="flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </Button>
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
