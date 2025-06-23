import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Box, Database, Code, Globe, Settings, Zap, Clock, HardDrive } from "lucide-react";
import { usePanel } from "@/context/panel-provider";
import DevboxCreateView from "@/components/flow/node/devbox/create/view/devbox-create-view";

interface NodeCreateViewProps {
  onCreateNode: (nodeType: string) => void;
}

const nodeTypes = [
  {
    id: "devbox",
    title: "DevBox",
    description: "Create a new development environment",
    icon: Box,
    color: "bg-blue-500",
  },
  {
    id: "database",
    title: "Database",
    description: "Set up a database instance",
    icon: Database,
    color: "bg-green-500",
  },
  {
    id: "aiproxy",
    title: "AI Proxy",
    description: "Manage AI proxy tokens and access",
    icon: Zap,
    color: "bg-purple-500",
  },
  {
    id: "cronjob",
    title: "Cron Job",
    description: "Schedule automated tasks",
    icon: Clock,
    color: "bg-orange-500",
  },
  {
    id: "objectstorage",
    title: "Object Storage",
    description: "Manage object storage buckets",
    icon: HardDrive,
    color: "bg-indigo-500",
  },
];

export default function NodeCreateView({ onCreateNode }: NodeCreateViewProps) {
  const { openPanel } = usePanel();
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Create New Node</h2>
        <p className="text-muted-foreground mt-2">
          Choose the type of node you want to create
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {nodeTypes.map((nodeType) => (
          <Card
            key={nodeType.id}
            className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-2 hover:border-primary/50"
            onClick={() => {
              if (nodeType.id === "devbox") {
                openPanel(
                  "devbox-create",
                  <DevboxCreateView onComplete={() => {}} />
                );
              } else {
                onCreateNode(nodeType.id);
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-lg ${nodeType.color} flex items-center justify-center text-white`}
                >
                  <nodeType.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{nodeType.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {nodeType.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          More node types coming soon...
        </p>
      </div>
    </div>
  );
}
