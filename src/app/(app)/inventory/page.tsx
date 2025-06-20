import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DevboxTable } from "@/components/inventory/devbox/devbox-table";
import { DatabaseTable } from "@/components/inventory/database/database-table";

export default function InventoryPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">Manage your Sealos resources</p>
      </div>

      <Tabs defaultValue="devbox" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="devbox">Devbox</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="launchpad">Launchpad</TabsTrigger>
          <TabsTrigger value="ai-proxy">AI Proxy</TabsTrigger>
        </TabsList>

        <TabsContent value="devbox" className="mt-6">
          <DevboxTable />
        </TabsContent>

        <TabsContent value="database" className="mt-6">
          <DatabaseTable />
        </TabsContent>

        <TabsContent value="launchpad" className="mt-6">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">
              Launchpad Applications
            </h2>
            <p className="text-muted-foreground">
              Monitor and control your deployed applications.
            </p>
            {/* Add Launchpad content here */}
          </div>
        </TabsContent>

        <TabsContent value="ai-proxy" className="mt-6">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">AI Proxy Services</h2>
            <p className="text-muted-foreground">
              Configure and monitor your AI proxy endpoints.
            </p>
            {/* Add AI Proxy content here */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
