import React, { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { DevboxFormValues } from "@/components/node/devbox/create/schema/devbox-create-schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Globe } from "lucide-react";
import { customAlphabet } from "nanoid";
import { Badge } from "@/components/ui/badge";
import StepContainer from "../step-container";
import { Separator } from "@/components/ui/separator";

// Create a custom nanoid with lowercase alphabet and size 12
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 12);

const PROTOCOL_OPTIONS = [
  { value: "HTTP", label: "HTTP" },
  { value: "GRPC", label: "GRPC" },
  { value: "WS", label: "WebSocket" },
] as const;

type ProtocolType = "HTTP" | "GRPC" | "WS";

export default function StepCNetwork() {
  const { control, formState: { errors }, watch, setValue } = useFormContext<DevboxFormValues>();

  const {
    fields: networks,
    append: appendNetwork,
    remove: removeNetwork,
    update: updateNetwork,
  } = useFieldArray({
    control,
    name: "networks",
  });

  const currentDevboxName = watch("name");

  const addNetwork = () => {
    const devboxName = watch("name") || "devbox-temp";
    
    const newNetwork = {
      networkName: `${devboxName}-${nanoid()}`,
      portName: nanoid(),
      port: 8080,
      protocol: "HTTP" as ProtocolType,
      openPublicDomain: false,
      publicDomain: "",
      customDomain: "",
      id: crypto.randomUUID(),
    };
    appendNetwork(newNetwork);
  };

  const togglePublicDomain = (index: number, checked: boolean) => {
    const currentNetwork = networks[index];
    const publicDomain = checked ? `${nanoid()}.sealosbja.site` : "";
    
    updateNetwork(index, {
      ...currentNetwork,
      openPublicDomain: checked,
      publicDomain: publicDomain,
      // Reset custom domain if public access is disabled
      customDomain: checked ? currentNetwork.customDomain : "",
    });
  };

  const getProtocolPrefix = (protocol: ProtocolType) => {
    switch (protocol) {
      case "HTTP": return "https://";
      case "GRPC": return "grpcs://";
      case "WS":   return "wss://";
      default:     return "https://";
    }
  };

  return (
    <StepContainer>
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Network Configuration</h2>
        <p className="text-muted-foreground mt-2">Expose ports for your applications and manage public access.</p>
      </div>
      
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Port Settings</CardTitle>
          <CardDescription>
            Define network ports and their visibility. You can add up to 5 ports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {networks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Globe className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No Ports Configured</h3>
                <p className="text-muted-foreground my-2 max-w-xs">Click below to expose a port from your container.</p>
                <Button onClick={addNetwork} variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Port
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {networks.map((network, index) => (
                  <div key={network.id} className="space-y-4">
                    {index > 0 && <Separator />}
                    <div className="flex justify-between items-center">
                       <Label className="text-base font-medium">Port Configuration</Label>
                       <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeNetwork(index)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Remove Port</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`port-${index}`} className="text-sm font-medium">Container Port</Label>
                        <Input
                          id={`port-${index}`}
                          type="number"
                          min="1"
                          max="65535"
                          value={network.port}
                          onChange={(e) => updateNetwork(index, { ...network, port: parseInt(e.target.value) || 0 })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Protocol</Label>
                        <Select
                          value={network.protocol}
                          onValueChange={(value: ProtocolType) => updateNetwork(index, { ...network, protocol: value })}
                        >
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PROTOCOL_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <Switch
                        id={`public-${index}`}
                        checked={network.openPublicDomain}
                        onCheckedChange={(checked) => togglePublicDomain(index, checked)}
                      />
                      <Label htmlFor={`public-${index}`} className="cursor-pointer">Enable Public Access</Label>
                    </div>

                    {network.openPublicDomain && (
                      <div className="pl-10 space-y-4">
                         <div>
                           <Label htmlFor={`public-domain-${index}`} className="text-sm font-medium">Public URL</Label>
                           <p id={`public-domain-${index}`} className="text-sm text-muted-foreground font-mono break-all mt-1">
                             {getProtocolPrefix(network.protocol)}{network.publicDomain}
                           </p>
                         </div>
                         <div>
                           <Label htmlFor={`custom-domain-${index}`} className="text-sm font-medium">Custom Domain (Optional)</Label>
                           <Input
                              id={`custom-domain-${index}`}
                              placeholder="e.g., my-app.mydomain.com"
                              value={network.customDomain}
                              onChange={(e) => updateNetwork(index, { ...network, customDomain: e.target.value })}
                              className="mt-1 font-mono"
                           />
                         </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {networks.length > 0 && networks.length < 5 && (
              <>
                <Separator />
                <div className="flex justify-center">
                  <Button variant="outline" onClick={addNetwork}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Port
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </StepContainer>
  );
}
