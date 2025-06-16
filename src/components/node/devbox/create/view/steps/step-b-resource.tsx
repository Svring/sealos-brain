import { useQuery } from "@tanstack/react-query";
import { useSealosStore } from "@/store/sealos-store";
import { devboxQuotaOptions } from "@/lib/devbox/devbox-query";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { DevboxFormValues } from "@/components/node/devbox/create/schema/devbox-create-schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Cpu, MemoryStick } from "lucide-react";
import StepContainer from "../step-container";

interface QuotaItem {
  type: string;
  limit: number;
  used: number;
}

export default function StepBResource() {
  const { currentUser, regionUrl } = useSealosStore();
  const { watch, setValue } = useFormContext<DevboxFormValues>();
  const {
    data: quotaResponse,
    isLoading: loading,
    error,
  } = useQuery(devboxQuotaOptions(currentUser, regionUrl));
  const quotaData: QuotaItem[] = quotaResponse && Array.isArray(quotaResponse.quota) ? quotaResponse.quota : [];

  const cpuValue = watch("cpu") || 1000; // Default 1 CPU (1000m)
  const memoryValue = watch("memory") || 2048; // Default 2GB

  // CPU options in powers of 2: 1, 2, 4, 8, 16 cores (in millicores)
  const cpuOptions = [1000, 2000, 4000, 8000, 16000]; // 1, 2, 4, 8, 16 cores
  // Memory options in powers of 2: 2, 4, 8, 16, 32, 64 GB (in MB)
  const memoryOptions = [2048, 4096, 8192, 16384, 32768, 65536]; // 2, 4, 8, 16, 32, 64 GB

  // Find CPU and memory quota
  const cpuQuota = quotaData.find(q => q.type === "cpu");
  const memoryQuota = quotaData.find(q => q.type === "memory");

  // Calculate available resources
  const availableCpu = cpuQuota ? cpuQuota.limit - cpuQuota.used : 16; // Default to 16 cores if no quota
  const availableMemory = memoryQuota ? memoryQuota.limit - memoryQuota.used : 64; // Default to 64GB if no quota

  // Filter options based on available resources, but always show at least the first option
  const availableCpuOptions = cpuOptions.filter(cpu => cpu <= availableCpu * 1000);
  const availableMemoryOptions = memoryOptions.filter(memory => memory <= availableMemory * 1024);

  // Ensure we always have at least one option available
  const finalCpuOptions = availableCpuOptions.length > 0 ? availableCpuOptions : [cpuOptions[0]];
  const finalMemoryOptions = availableMemoryOptions.length > 0 ? availableMemoryOptions : [memoryOptions[0]];

  console.log("🔍 Debug quota data:", {
    quotaData,
    cpuQuota,
    memoryQuota,
    availableCpu,
    availableMemory,
    finalCpuOptions,
    finalMemoryOptions
  });

  const handleCpuSelect = (cpu: number) => {
    console.log("🔍 Step B - CPU selected:", cpu, "cores:", cpu / 1000);
    setValue("cpu", cpu, { shouldValidate: true });
  };

  const handleMemorySelect = (memory: number) => {
    console.log("🔍 Step B - Memory selected:", memory, "GB:", memory / 1024);
    setValue("memory", memory, { shouldValidate: true });
  };

  if (error) {
    return <div className="text-destructive">{String(error)}</div>;
  }

  return (
    <StepContainer>
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Configure Resources</h2>
        <p className="text-muted-foreground mt-2">Select CPU and memory for your devbox. Your available quota is shown below.</p>
      </div>
      
      {loading ? (
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
            <div className="pt-6 border-t space-y-8">
              <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          {quotaData.length > 0 && (
            <CardHeader>
              <CardTitle className="text-lg">Resource Quota</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-4">
                {quotaData.slice(0, 2).map((quota) => (
                  <div key={quota.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium capitalize flex items-center gap-2">
                        {quota.type === "cpu" ? <Cpu className="w-4 h-4" /> : <MemoryStick className="w-4 h-4" />}
                        {quota.type}
                      </span>
                      <span className="text-muted-foreground">
                        {quota.used} / {quota.limit} {quota.type === "cpu" ? "cores" : "GB"}
                      </span>
                    </div>
                    <Progress value={(quota.used / quota.limit) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardHeader>
          )}
          <CardContent className={quotaData.length > 0 ? "pt-6 border-t" : ""}>
            <div className="space-y-8">
              {/* CPU Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Label className="text-base font-medium flex items-center gap-2"><Cpu className="w-5 h-5" /> CPU Cores</Label>
                  <Badge variant="secondary" className="ml-auto">{(cpuValue / 1000)} cores selected</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {finalCpuOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleCpuSelect(option)}
                      className={`p-3 border-2 rounded-lg text-center transition-all hover:shadow-sm ${
                        cpuValue === option
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-muted-foreground/50"
                      }`}
                    >
                      <div className="text-lg font-bold">{option / 1000}</div>
                      <div className="text-xs text-muted-foreground">
                        {option / 1000 === 1 ? "core" : "cores"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Memory Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Label className="text-base font-medium flex items-center gap-2"><MemoryStick className="w-5 h-5" /> Memory</Label>
                  <Badge variant="secondary" className="ml-auto">{(memoryValue / 1024).toFixed(1)} GB selected</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {finalMemoryOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleMemorySelect(option)}
                      className={`p-3 border-2 rounded-lg text-center transition-all hover:shadow-sm ${
                        memoryValue === option
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-muted-foreground/50"
                      }`}
                    >
                      <div className="text-lg font-bold">{option / 1024}</div>
                      <div className="text-xs text-muted-foreground">GB</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </StepContainer>
  );
}
