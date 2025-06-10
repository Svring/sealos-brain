import React from "react";
import { AnimatedTabs } from "@/components/ui/animated-tabs"

export default function DevboxDetails({ devbox, readyData }: { devbox?: any; readyData?: any }) {
  if (!devbox) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Devbox Details</h2>
        <p>This is the detailed view for the Devbox node.</p>
      </div>
    );
  }

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Name:</span>
                <span className="text-white font-medium">{devbox.metadata?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Namespace:</span>
                <span className="text-white">{devbox.metadata?.namespace}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Phase:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  devbox.status?.phase === 'Running' ? 'bg-green-600 text-green-100' :
                  devbox.status?.phase === 'Shutdown' ? 'bg-red-600 text-red-100' :
                  'bg-yellow-600 text-yellow-100'
                }`}>
                  {devbox.status?.phase}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">State:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  devbox.spec?.state === 'Running' ? 'bg-green-600 text-green-100' :
                  devbox.spec?.state === 'Shutdown' ? 'bg-red-600 text-red-100' :
                  'bg-yellow-600 text-yellow-100'
                }`}>
                  {devbox.spec?.state}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Created:</span>
                <span className="text-white">{new Date(devbox.metadata?.creationTimestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Template ID:</span>
                <span className="text-white font-mono text-sm">{devbox.spec?.templateID}</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "configuration",
      label: "Configuration",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Container Configuration</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Image:</span>
                <span className="text-white font-mono text-sm">{devbox.spec?.image}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">User:</span>
                <span className="text-white">{devbox.spec?.config?.user}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Working Directory:</span>
                <span className="text-white font-mono text-sm">{devbox.spec?.config?.workingDir}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Squash:</span>
                <span className="text-white">{devbox.spec?.squash ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
          
          {devbox.spec?.config?.releaseCommand && (
            <div>
              <h4 className="text-md font-medium text-white mb-2">Release Command</h4>
              <div className="bg-gray-800 p-3 rounded-lg">
                <code className="text-green-400 text-sm">
                  {devbox.spec.config.releaseCommand.join(' ')}
                </code>
              </div>
            </div>
          )}
          
          {devbox.spec?.config?.releaseArgs && devbox.spec.config.releaseArgs.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-white mb-2">Release Arguments</h4>
              <div className="bg-gray-800 p-3 rounded-lg">
                <code className="text-green-400 text-sm">
                  {devbox.spec.config.releaseArgs.join(' ')}
                </code>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "resources",
      label: "Resources",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Resource Allocation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-300 text-sm">CPU</div>
                <div className="text-white text-xl font-bold">{devbox.spec?.resource?.cpu}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-300 text-sm">Memory</div>
                <div className="text-white text-xl font-bold">{devbox.spec?.resource?.memory}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Network Configuration</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Network Type:</span>
                <span className="text-white">{devbox.spec?.network?.type}</span>
              </div>
              {devbox.status?.network?.nodePort > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Node Port:</span>
                  <span className="text-white font-mono">{devbox.status.network.nodePort}</span>
                </div>
              )}
            </div>
          </div>
          
          {devbox.spec?.config?.ports && devbox.spec.config.ports.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-white mb-2">Container Ports</h4>
              <div className="space-y-2">
                {devbox.spec.config.ports.map((port: any, index: number) => (
                  <div key={index} className="bg-gray-800 p-3 rounded-lg flex justify-between">
                    <span className="text-gray-300">{port.name || `Port ${index + 1}`}</span>
                    <span className="text-white font-mono">{port.containerPort}/{port.protocol}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "services",
      label: "Services",
      content: (
        <div className="space-y-4">
          {readyData && readyData.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold text-white mb-3">Service Status</h3>
              <div className="space-y-3">
                {readyData.map((service: any, index: number) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Service {index + 1}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        service.ready ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
                      }`}>
                        {service.ready ? 'Ready' : 'Not Ready'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">URL:</span>
                        <a 
                          href={service.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-400 hover:text-blue-300 underline font-mono text-sm"
                        >
                          {service.url}
                        </a>
                      </div>
                      {service.error && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Error:</span>
                          <span className="text-red-400 text-sm">{service.error}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">No service data available</div>
              <div className="text-gray-500 text-sm">Services information will appear here when available</div>
            </div>
          )}
          
          {devbox.spec?.config?.appPorts && devbox.spec.config.appPorts.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-white mb-2">Application Ports</h4>
              <div className="space-y-2">
                {devbox.spec.config.appPorts.map((port: any, index: number) => (
                  <div key={index} className="bg-gray-800 p-3 rounded-lg flex justify-between">
                    <span className="text-gray-300">{port.name}</span>
                    <span className="text-white font-mono">{port.port}:{port.targetPort}/{port.protocol}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "status",
      label: "Status",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Current Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Phase:</span>
                <span className="text-white">{devbox.status?.phase}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Generation:</span>
                <span className="text-white">{devbox.metadata?.generation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Resource Version:</span>
                <span className="text-white font-mono text-sm">{devbox.metadata?.resourceVersion}</span>
              </div>
            </div>
          </div>
          
          {devbox.status?.state?.running && (
            <div>
              <h4 className="text-md font-medium text-white mb-2">Running State</h4>
              <div className="bg-green-900 bg-opacity-30 p-3 rounded-lg">
                <div className="text-green-300">Started at: {new Date(devbox.status.state.running.startedAt).toLocaleString()}</div>
              </div>
            </div>
          )}
          
          {devbox.status?.lastState?.terminated && (
            <div>
              <h4 className="text-md font-medium text-white mb-2">Last Terminated State</h4>
              <div className="bg-red-900 bg-opacity-30 p-3 rounded-lg space-y-2">
                <div className="text-red-300">Exit Code: {devbox.status.lastState.terminated.exitCode}</div>
                <div className="text-red-300">Reason: {devbox.status.lastState.terminated.reason}</div>
                <div className="text-red-300">Started: {new Date(devbox.status.lastState.terminated.startedAt).toLocaleString()}</div>
                <div className="text-red-300">Finished: {new Date(devbox.status.lastState.terminated.finishedAt).toLocaleString()}</div>
              </div>
            </div>
          )}
          
          {devbox.status?.commitHistory && devbox.status.commitHistory.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-white mb-2">Commit History</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {devbox.status.commitHistory.map((commit: any, index: number) => (
                  <div key={index} className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white font-medium">Commit {index + 1}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        commit.status === 'Success' ? 'bg-green-600 text-green-100' :
                        commit.status === 'Pending' ? 'bg-yellow-600 text-yellow-100' :
                        'bg-red-600 text-red-100'
                      }`}>
                        {commit.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="text-gray-300">Node: <span className="text-white">{commit.node}</span></div>
                      <div className="text-gray-300">Pod: <span className="text-white">{commit.pod}</span></div>
                      <div className="text-gray-300">Time: <span className="text-white">{new Date(commit.time).toLocaleString()}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Devbox Details</h2>
      <AnimatedTabs tabs={tabs} defaultTab="overview" className="w-full max-w-none" />
    </div>
  );
}
