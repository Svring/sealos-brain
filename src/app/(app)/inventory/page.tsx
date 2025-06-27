import React, { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/components/ui/loading";

const DevboxTable = React.lazy(() =>
  import("@/components/inventory/devbox/devbox-table").then((module) => ({
    default: module.DevboxTable,
  }))
);
const DatabaseTable = React.lazy(() =>
  import("@/components/inventory/database/database-table").then((module) => ({
    default: module.DatabaseTable,
  }))
);
const ObjectStorageTable = React.lazy(() =>
  import("@/components/inventory/objectstorage/objectstorage-table").then(
    (module) => ({ default: module.ObjectStorageTable })
  )
);
const AppLaunchpadTable = React.lazy(() =>
  import("@/components/inventory/applaunchpad/applaunchpad-table").then(
    (module) => ({ default: module.AppLaunchpadTable })
  )
);
const AIProxyTable = React.lazy(() =>
  import("@/components/inventory/aiproxy/aiproxy-table").then((module) => ({
    default: module.AIProxyTable,
  }))
);
const CronJobTable = React.lazy(() =>
  import("@/components/inventory/cronjob/cronjob-table").then((module) => ({
    default: module.CronJobTable,
  }))
);

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
          <TabsTrigger value="objectstorage">Object Storage</TabsTrigger>
          <TabsTrigger value="launchpad">Launchpad</TabsTrigger>
          <TabsTrigger value="ai-proxy">AI Proxy</TabsTrigger>
          <TabsTrigger value="cronjob">CronJob</TabsTrigger>
        </TabsList>

        <Suspense fallback={<Loading text="Loading inventory..." />}>
          <TabsContent value="devbox">
            <DevboxTable />
          </TabsContent>

          <TabsContent value="database">
            <DatabaseTable />
          </TabsContent>

          <TabsContent value="objectstorage">
            <ObjectStorageTable />
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
        </Suspense>
      </Tabs>
    </div>
  );
}
