import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DevboxTable } from "@/components/inventory/devbox/devbox-table";
import { DatabaseTable } from "@/components/inventory/database/database-table";
import { AppLaunchpadTable } from "@/components/inventory/applaunchpad/applaunchpad-table";
import { AIProxyTable } from "@/components/inventory/aiproxy/aiproxy-table";
import { CronJobTable } from "@/components/inventory/cronjob/cronjob-table";
import { ObjectStorageTable } from "@/components/inventory/objectstorage/objectstorage-table";

export default function InventoryPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">Manage your Sealos resources</p>
      </div>

      <Tabs defaultValue="devbox" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="devbox">Devbox</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="launchpad">Launchpad</TabsTrigger>
          <TabsTrigger value="ai-proxy">AI Proxy</TabsTrigger>
          <TabsTrigger value="cronjob">CronJob</TabsTrigger>
          <TabsTrigger value="objectstorage">Object Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="devbox" className="mt-6">
          <DevboxTable />
        </TabsContent>

        <TabsContent value="database" className="mt-6">
          <DatabaseTable />
        </TabsContent>

        <TabsContent value="launchpad" className="mt-6">
          <AppLaunchpadTable />
        </TabsContent>

        <TabsContent value="ai-proxy" className="mt-6">
          <AIProxyTable />
        </TabsContent>

        <TabsContent value="cronjob" className="mt-6">
          <CronJobTable />
        </TabsContent>

        <TabsContent value="objectstorage" className="mt-6">
          <ObjectStorageTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
