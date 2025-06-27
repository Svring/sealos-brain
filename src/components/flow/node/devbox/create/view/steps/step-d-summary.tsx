import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { DevboxFormValues } from "@/components/flow/node/devbox/create/schema/devbox-create-schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Server,
  Network,
  Settings,
  Cpu,
  MemoryStick,
  Globe,
  Lock,
  AlertCircle,
  Edit,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import StepContainer from "../step-container";

export default function StepDSummary() {
  const {
    watch,
    getValues,
    register,
    formState: { errors },
  } = useFormContext<DevboxFormValues>();

  // Watch all form values
  const formData = watch();

  useEffect(() => {
    console.log("🔍 Step D - Complete form data:", formData);
    console.log("🔍 Step D - Form values (getValues):", getValues());
  }, [formData, getValues]);

  const getProtocolPrefix = (protocol: string) => {
    switch (protocol) {
      case "HTTP":
        return "https://";
      case "GRPC":
        return "grpcs://";
      case "WS":
        return "wss://";
      default:
        return "https://";
    }
  };

  // Validation checks
  const isTemplateValid = !!(
    formData.templateRepositoryUid && formData.templateUid
  );
  const isResourceValid = !!(formData.cpu && formData.memory);
  const isNameValid = !!(formData.name && formData.name.length >= 3);
  const isConfigurationReady =
    isTemplateValid && isResourceValid && isNameValid;

  return (
    <StepContainer>
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Review & Create</h2>
        <p className="text-muted-foreground mt-2">
          Confirm your configuration and give your devbox a name.
        </p>
      </div>

      <div className="space-y-6">
        {/* Devbox Name Input */}
        <Card className="shadow-sm border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Devbox Name
            </CardTitle>
            <CardDescription>
              Choose a unique and memorable name for your devbox.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="devbox-name">Name</Label>
              <Input
                id="devbox-name"
                {...register("name")}
                placeholder="Enter devbox name"
                className="text-lg font-medium"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Name must be at least 3 characters long and will be used for
                network generation
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Single Summary Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Configuration Summary</CardTitle>
            <CardDescription>
              Review the details of your new devbox below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Template Section */}
            <div>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                <Settings className="w-5 h-5" /> Template
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Repository</div>
                  <div className="font-mono bg-muted p-2 rounded mt-1 text-muted-foreground">
                    {formData.templateRepositoryUid || "Not selected"}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Template</div>
                  <div className="font-mono bg-muted p-2 rounded mt-1 text-muted-foreground">
                    {formData.templateUid || "Not selected"}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Resource Section */}
            <div>
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                <Server className="w-5 h-5" /> Resources
              </h3>
              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Cpu className="w-5 h-5" />
                    <span className="font-medium">CPU</span>
                  </div>
                  <div className="text-4xl font-bold text-primary">
                    {formData.cpu ? formData.cpu / 1000 : 1}
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">
                      {formData.cpu
                        ? formData.cpu / 1000 === 1
                          ? "core"
                          : "cores"
                        : "core"}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {formData.cpu || 1000}m
                    </Badge>
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <MemoryStick className="w-5 h-5" />
                    <span className="font-medium">Memory</span>
                  </div>
                  <div className="text-4xl font-bold text-primary">
                    {formData.memory
                      ? (formData.memory / 1024).toFixed(1)
                      : "2.0"}
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">GB</div>
                    <Badge variant="secondary" className="text-xs">
                      {formData.memory || 2048} MB
                    </Badge>
                  </div>
                </div>
              </div>

              {formData.gpu?.type && (
                <div className="mt-6 pt-6 border-t">
                  <div className="text-center space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      GPU
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formData.gpu.amount || 0}
                    </div>
                    <Badge variant="outline">{formData.gpu.type}</Badge>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Network Section */}
            <div>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                <Network className="w-5 h-5" /> Network
              </h3>
              {!formData.networks || formData.networks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    No public ports configured
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your devbox will only be accessible internally
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.networks.map((network, index) => (
                    <div
                      key={network.id || index}
                      className="p-4 border rounded-lg bg-muted/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono">
                            :{network.port}
                          </Badge>
                          <Badge variant="secondary">{network.protocol}</Badge>
                          {network.openPublicDomain ? (
                            <Badge className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              Public
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Lock className="w-3 h-3" />
                              Internal
                            </Badge>
                          )}
                        </div>
                      </div>

                      {network.openPublicDomain && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            Public URL
                          </div>
                          <div className="font-mono text-sm p-2 bg-background rounded border">
                            {getProtocolPrefix(network.protocol)}
                            {network.customDomain || network.publicDomain}
                          </div>
                          {network.customDomain && (
                            <div className="text-xs text-muted-foreground">
                              Custom domain configured
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Debug Information (Collapsible) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuration Data</CardTitle>
            <CardDescription>Complete form data for debugging</CardDescription>
          </CardHeader>
          <CardContent>
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                View raw configuration data
              </summary>
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <pre className="text-xs font-mono overflow-x-auto">
                  {JSON.stringify({ devboxForm: formData }, null, 2)}
                </pre>
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
    </StepContainer>
  );
}
