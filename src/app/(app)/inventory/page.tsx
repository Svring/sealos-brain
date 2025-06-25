import { AIProxyTable } from "@/components/inventory/aiproxy/aiproxy-table";
import { AppLaunchpadTable } from "@/components/inventory/applaunchpad/applaunchpad-table";
import { CronJobTable } from "@/components/inventory/cronjob/cronjob-table";
import { DatabaseTable } from "@/components/inventory/database/database-table";
import { DevboxTable } from "@/components/inventory/devbox/devbox-table";
import { ObjectStorageTable } from "@/components/inventory/objectstorage/objectstorage-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InventoryPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="font-bold text-3xl">Inventory</h1>
        <p className="text-muted-foreground">Manage your Sealos resources</p>
      </div>

      <Tabs className="w-full" defaultValue="devbox">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="devbox">Devbox</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="launchpad">Launchpad</TabsTrigger>
          <TabsTrigger value="ai-proxy">AI Proxy</TabsTrigger>
          <TabsTrigger value="cronjob">CronJob</TabsTrigger>
          <TabsTrigger value="objectstorage">Object Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="devbox">
          <DevboxTable />
        </TabsContent>

        <TabsContent value="database">
          <DatabaseTable />
        </TabsContent>

        <TabsContent value="launchpad">
          <AppLaunchpadTable />
        </TabsContent>

        <TabsContent value="ai-proxy">
          <AIProxyTable />
        </TabsContent>

        <TabsContent value="cronjob">
          <CronJobTable />
        </TabsContent>

        <TabsContent value="objectstorage">
          <ObjectStorageTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
