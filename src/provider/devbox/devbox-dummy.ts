export const dummyDevboxData = {
  data: [
    [
      {
        apiVersion: "devbox.sealos.io/v1alpha1",
        kind: "Devbox",
        metadata: {
          creationTimestamp: "2025-04-25T03:41:25Z",
          finalizers: ["devbox.sealos.io/finalizer"],
          generation: 5,
          name: "devbox",
          namespace: "ns-gapyo0ig",
          resourceVersion: "2566138621",
          uid: "30629d6a-782a-484a-b687-1b9bf86eed07",
        },
        spec: {
          affinity: {
            nodeAffinity: {
              requiredDuringSchedulingIgnoredDuringExecution: {
                nodeSelectorTerms: [
                  {
                    matchExpressions: [
                      {
                        key: "devbox.sealos.io/node",
                        operator: "Exists",
                      },
                    ],
                  },
                ],
              },
            },
          },
          config: {
            appPorts: [
              {
                name: "dgwmoetcnkzt",
                port: 3000,
                protocol: "TCP",
                targetPort: 3000,
              },
            ],
            ports: [
              {
                containerPort: 22,
                name: "devbox-ssh-port",
                protocol: "TCP",
              },
            ],
            releaseArgs: ["/home/devbox/project/entrypoint.sh"],
            releaseCommand: ["/bin/bash", "-c"],
            user: "devbox",
            workingDir: "/home/devbox/project",
          },
          image: "ghcr.io/labring-actions/devbox/next.js-14.2.5:c71eb28",
          network: {
            extraPorts: [
              {
                containerPort: 3000,
                protocol: "TCP",
              },
            ],
            type: "NodePort",
          },
          resource: {
            cpu: "2",
            memory: "4Gi",
          },
          squash: false,
          state: "Shutdown",
          templateID: "fec7b38d-a8bc-4904-84d4-ce19efeb7015",
          tolerations: [
            {
              effect: "NoSchedule",
              key: "devbox.sealos.io/node",
              operator: "Exists",
            },
          ],
        },
        status: {
          commitHistory: [
            {
              containerID:
                "containerd://c2884b59512a73c08cf165302f067d6f4c312bd9f3df09e8c5935bbc38bf5c3a",
              image:
                "hub.bja.sealos.run/ns-gapyo0ig/devbox:p4lf9-2025-05-27-215852",
              node: "bja-devbox-node-000",
              pod: "devbox-blt2x",
              predicatedStatus: "Success",
              status: "Success",
              time: "2025-05-27T21:58:52Z",
            },
          ],
          lastState: {
            terminated: {
              containerID:
                "containerd://c2884b59512a73c08cf165302f067d6f4c312bd9f3df09e8c5935bbc38bf5c3a",
              exitCode: 143,
              finishedAt: "2025-06-09T08:04:46Z",
              reason: "Error",
              startedAt: "2025-05-27T22:02:41Z",
            },
          },
          network: {
            nodePort: 0,
            tailnet: "",
            type: "NodePort",
          },
          phase: "Shutdown",
          state: {},
        },
      },
      {
        uid: "fec7b38d-a8bc-4904-84d4-ce19efeb7015",
        templateRepository: {
          iconId: "next.js",
        },
      },
    ],
    [
      {
        apiVersion: "devbox.sealos.io/v1alpha1",
        kind: "Devbox",
        metadata: {
          creationTimestamp: "2025-05-27T10:46:16Z",
          finalizers: ["devbox.sealos.io/finalizer"],
          generation: 10,
          name: "dummy-for-aim",
          namespace: "ns-gapyo0ig",
          resourceVersion: "2564497421",
          uid: "fdf211f8-4aa5-45f5-9fa6-4443d905cfa3",
        },
        spec: {
          affinity: {
            nodeAffinity: {
              requiredDuringSchedulingIgnoredDuringExecution: {
                nodeSelectorTerms: [
                  {
                    matchExpressions: [
                      {
                        key: "devbox.sealos.io/node",
                        operator: "Exists",
                      },
                    ],
                  },
                ],
              },
            },
          },
          config: {
            appPorts: [
              {
                name: "pvqvxtpuxcyr",
                port: 3000,
                protocol: "TCP",
                targetPort: 3000,
              },
            ],
            ports: [
              {
                containerPort: 22,
                name: "devbox-ssh-port",
                protocol: "TCP",
              },
            ],
            releaseArgs: ["/home/devbox/project/entrypoint.sh"],
            releaseCommand: ["/bin/bash", "-c"],
            user: "devbox",
            workingDir: "/home/devbox/project",
          },
          image: "ghcr.io/labring-actions/devbox/next.js-14.2.5:c71eb28",
          network: {
            extraPorts: [
              {
                containerPort: 3000,
                protocol: "TCP",
              },
            ],
            type: "NodePort",
          },
          resource: {
            cpu: "2",
            memory: "4Gi",
          },
          squash: false,
          state: "Running",
          templateID: "fec7b38d-a8bc-4904-84d4-ce19efeb7015",
          tolerations: [
            {
              effect: "NoSchedule",
              key: "devbox.sealos.io/node",
              operator: "Exists",
            },
          ],
        },
        status: {
          commitHistory: [
            {
              containerID:
                "containerd://a13eed53d8abd46e27e09c8aab828e901df6dfab5e4f06c815ab055d667b82a3",
              image:
                "hub.bja.sealos.run/ns-gapyo0ig/dummy-for-aim:4j95z-2025-06-09-031815",
              node: "bja-devbox-node-001",
              pod: "dummy-for-aim-nm6z9",
              predicatedStatus: "Success",
              status: "Pending",
              time: "2025-06-09T03:18:15Z",
            },
          ],
          lastState: {
            terminated: {
              containerID:
                "containerd://c1271e959c866cae7abfa1811a4e48a3aebec51e007ae8627a4c7a54f501ae71",
              exitCode: 143,
              finishedAt: "2025-06-09T03:00:41Z",
              reason: "Error",
              startedAt: "2025-06-09T02:17:13Z",
            },
          },
          network: {
            nodePort: 40277,
            tailnet: "",
            type: "NodePort",
          },
          phase: "Running",
          state: {
            running: {
              startedAt: "2025-06-09T03:18:16Z",
            },
          },
        },
      },
      {
        uid: "fec7b38d-a8bc-4904-84d4-ce19efeb7015",
        templateRepository: {
          iconId: "next.js",
        },
      },
    ],
  ],
};

// Extract individual devboxes for easier use
export const dummyDevboxes = dummyDevboxData.data
  .map((pair) => pair.find((item) => item.kind === "Devbox"))
  .filter(Boolean);

// First devbox for single use cases
export const firstDummyDevbox = dummyDevboxes[0];
