// import { useCopilotAction } from "@copilotkit/react-core";
// import { useSealosDevbox } from "@/hooks/use-sealos-devbox";
// import { useControlStore } from "@/store/control-store";
// import { useNodeView } from "@/components/node/node-view-provider";
// import { useReactFlow } from "@xyflow/react";
// import React from "react";

// type ShutdownModeType = "Stopped" | "Shutdown";

// /**
//  * Devbox Copilot Actions
//  * Extracted actions for better organization and reusability
//  */

// export function useStartDevboxAction() {
//   const { startDevbox } = useSealosDevbox();

//   useCopilotAction({
//     name: "startDevbox",
//     description: "Start a specific devbox by name",
//     available: "remote",
//     parameters: [
//       {
//         name: "devboxName",
//         type: "string",
//         description: "The name of the devbox to start",
//         required: true,
//       },
//     ],
//     handler: async ({ devboxName }) => {
//       try {
//         console.log(`Starting devbox: ${devboxName}`);
//         const result = await startDevbox(devboxName);
//         console.log(`Successfully started devbox: ${devboxName}`, result);
//         return `Successfully started devbox "${devboxName}". The devbox is now starting up and will be available shortly.`;
//       } catch (error: any) {
//         console.error(`Failed to start devbox: ${devboxName}`, error);
//         return `Failed to start devbox "${devboxName}": ${error.message}`;
//       }
//     },
//   });
// }

// export function useShutdownDevboxAction() {
//   const { shutdownDevbox } = useSealosDevbox();

//   useCopilotAction({
//     name: "shutdownDevbox",
//     description:
//       "Shutdown a specific devbox by name with optional shutdown mode",
//     available: "remote",
//     parameters: [
//       {
//         name: "devboxName",
//         type: "string",
//         description: "The name of the devbox to shutdown",
//         required: true,
//       },
//       {
//         name: "shutdownMode",
//         type: "string",
//         description: "The shutdown mode: 'Stopped' (default) or 'Shutdown'",
//         required: false,
//       },
//     ],
//     handler: async ({ devboxName, shutdownMode }) => {
//       try {
//         const mode = (shutdownMode as ShutdownModeType) || "Stopped";
//         console.log(`Shutting down devbox: ${devboxName} with mode: ${mode}`);
//         const result = await shutdownDevbox(devboxName, mode);
//         console.log(`Successfully shutdown devbox: ${devboxName}`, result);
//         return `Successfully shutdown devbox "${devboxName}" with mode "${mode}". The devbox has been ${mode.toLowerCase()}.`;
//       } catch (error: any) {
//         console.error(`Failed to shutdown devbox: ${devboxName}`, error);
//         return `Failed to shutdown devbox "${devboxName}": ${error.message}`;
//       }
//     },
//   });
// }

// export function useOpenDevboxCreateAction() {
//   const { showDetails } = useNodeView();
//   const { openPanel, updateDevboxCreateForm } = useControlStore();
//   const { setCenter, getZoom, setViewport } = useReactFlow();

//   useCopilotAction({
//     name: "openDevboxCreate",
//     description:
//       "Open the Devbox creation panel with optional pre-filled form data",
//     available: "remote",
//     parameters: [
//       {
//         name: "nodeId",
//         type: "string",
//         description: "Optional node ID to attach the creation to",
//         required: false,
//       },
//       {
//         name: "formData",
//         type: "object",
//         description: "Optional pre-filled form data",
//         required: false,
//         properties: [
//           {
//             name: "name",
//             type: "string",
//             description: "Devbox name",
//             required: false,
//           },
//           {
//             name: "templateId",
//             type: "string",
//             description: "Template ID to use",
//             required: false,
//           },
//           {
//             name: "cpu",
//             type: "number",
//             description: "Number of CPU cores",
//             required: false,
//           },
//           {
//             name: "memory",
//             type: "number",
//             description: "Memory in GB",
//             required: false,
//           },
//           {
//             name: "disk",
//             type: "number",
//             description: "Disk size in GB",
//             required: false,
//           },
//         ],
//       },
//     ],
//     handler: async ({ nodeId, formData }) => {
//       try {
//         const newNodeId = nodeId || `devbox-${Date.now()}`;

//         // Update control store with panel state and form data
//         openPanel({
//           type: "devbox-create",
//           nodeId: newNodeId,
//           formData: formData || {},
//         });

//         // Import DevboxCreateView dynamically to avoid circular dependencies
//         const DevboxCreateView = (
//           await import(
//             "@/components/node/devbox/create/view/devbox-create-view"
//           )
//         ).default;

//         // Create the DevboxCreateView component
//         const creationComponent = React.createElement(DevboxCreateView, {
//           onComplete: () => {
//             // This will be handled by the component itself
//           },
//         });

//         // Show the details panel using existing NodeViewProvider
//         showDetails(`devbox-create-${newNodeId}`, creationComponent);

//         // Position the viewport to show the panel nicely
//         const screenWidth = window.innerWidth;
//         const leftAreaCenter = screenWidth * 0.3;
//         const finalZoom = Math.max(Math.min(getZoom(), 1.0), 0.6);

//         setTimeout(() => {
//           const viewport = {
//             x: leftAreaCenter - (screenWidth / 2) * finalZoom,
//             y: window.innerHeight / 2 - (window.innerHeight / 2) * finalZoom,
//             zoom: finalZoom,
//           };
//           setViewport(viewport, { duration: 400 });
//         }, 100);

//         return `Opened the Devbox creation panel${formData ? " with pre-filled data" : ""}. You can now configure and create a new devbox.`;
//       } catch (error: any) {
//         console.error("Failed to open devbox create panel:", error);
//         return `Failed to open devbox creation panel: ${error.message}`;
//       }
//     },
//   });
// }

// export function useUpdateDevboxFormAction() {
//   const { updateDevboxCreateForm } = useControlStore();

//   useCopilotAction({
//     name: "updateDevboxForm",
//     description: "Update the devbox creation form fields",
//     available: "remote",
//     parameters: [
//       {
//         name: "name",
//         type: "string",
//         description: "Devbox name",
//         required: false,
//       },
//       {
//         name: "templateId",
//         type: "string",
//         description: "Template ID to use",
//         required: false,
//       },
//       {
//         name: "cpu",
//         type: "number",
//         description: "Number of CPU cores",
//         required: false,
//       },
//       {
//         name: "memory",
//         type: "number",
//         description: "Memory in GB",
//         required: false,
//       },
//       {
//         name: "disk",
//         type: "number",
//         description: "Disk size in GB",
//         required: false,
//       },
//     ],
//     handler: async (params) => {
//       try {
//         // Filter out undefined values
//         const updates = Object.entries(params)
//           .filter(([_, value]) => value !== undefined)
//           .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

//         if (Object.keys(updates).length === 0) {
//           return "No form fields to update. Please specify at least one field.";
//         }

//         updateDevboxCreateForm(updates);

//         const updatedFields = Object.keys(updates).join(", ");
//         return `Successfully updated devbox form fields: ${updatedFields}`;
//       } catch (error: any) {
//         console.error("Failed to update devbox form:", error);
//         return `Failed to update devbox form: ${error.message}`;
//       }
//     },
//   });
// }

// export function useGetPanelStateAction() {
//   const { getSerializableState, panelData, panelActions } = useControlStore();

//   useCopilotAction({
//     name: "getPanelState",
//     description:
//       "Get the current state of the active panel including data and available actions",
//     available: "remote",
//     parameters: [],
//     handler: async () => {
//       try {
//         const state = getSerializableState();
//         const availableActions = Object.keys(panelActions);

//         return {
//           currentPanel: state.panel,
//           panelData: state.panelData,
//           availableActions,
//           actionDescriptions: Object.values(panelActions).map((action) => ({
//             name: action.name,
//             description: action.description,
//             parameters: action.parameters,
//           })),
//         };
//       } catch (error: any) {
//         console.error("Failed to get panel state:", error);
//         return `Failed to get panel state: ${error.message}`;
//       }
//     },
//   });
// }

// export function useExecutePanelActionAction() {
//   const { panelActions } = useControlStore();

//   useCopilotAction({
//     name: "executePanelAction",
//     description: "Execute a specific panel action with given parameters",
//     available: "remote",
//     parameters: [
//       {
//         name: "actionName",
//         type: "string",
//         description: "Name of the action to execute",
//         required: true,
//       },
//       {
//         name: "parameters",
//         type: "object",
//         description: "Parameters to pass to the action",
//         required: false,
//       },
//     ],
//     handler: async ({
//       actionName,
//       parameters = {},
//     }: {
//       actionName: string;
//       parameters?: Record<string, any>;
//     }) => {
//       try {
//         const action = panelActions[actionName];
//         if (!action) {
//           const availableActions = Object.keys(panelActions);
//           return `Action "${actionName}" not found. Available actions: ${availableActions.join(", ")}`;
//         }

//         // Convert parameters object to array based on action parameter definitions
//         const paramArray = action.parameters.map(
//           (param) => parameters[param.name]
//         );

//         const result = await action.handler(...paramArray);
//         return result;
//       } catch (error: any) {
//         console.error(`Failed to execute panel action ${actionName}:`, error);
//         return `Failed to execute action "${actionName}": ${error.message}`;
//       }
//     },
//   });
// }

// export function useListTemplateRepositoriesAction() {
//   const { panelData } = useControlStore();

//   useCopilotAction({
//     name: "listTemplateRepositories",
//     description:
//       "Get a list of available template repositories in the current devbox creation panel",
//     available: "remote",
//     parameters: [],
//     handler: async () => {
//       try {
//         if (panelData.type !== "devbox-create") {
//           return "Devbox creation panel is not currently open";
//         }

//         const repositories = panelData.data.stepA.repositories;
//         const selectedRepoUid = panelData.data.stepA.selectedRepoUid;

//         return {
//           repositories: repositories.map((repo) => ({
//             uid: repo.uid,
//             name: repo.name,
//             kind: repo.kind,
//             description: repo.description,
//             selected: repo.uid === selectedRepoUid,
//           })),
//           loading: panelData.data.stepA.loadingRepos,
//           error: panelData.data.stepA.error,
//         };
//       } catch (error: any) {
//         console.error("Failed to list template repositories:", error);
//         return `Failed to list template repositories: ${error.message}`;
//       }
//     },
//   });
// }

// export function useListTemplatesAction() {
//   const { panelData } = useControlStore();

//   useCopilotAction({
//     name: "listTemplates",
//     description:
//       "Get a list of available templates for the selected repository in the current devbox creation panel",
//     available: "remote",
//     parameters: [],
//     handler: async () => {
//       try {
//         if (panelData.type !== "devbox-create") {
//           return "Devbox creation panel is not currently open";
//         }

//         const templates = panelData.data.stepA.templates;
//         const selectedTemplateUid = panelData.data.stepA.selectedTemplateUid;
//         const selectedRepoUid = panelData.data.stepA.selectedRepoUid;

//         if (!selectedRepoUid) {
//           return "No repository selected. Please select a repository first.";
//         }

//         return {
//           templates: templates.map((template) => ({
//             uid: template.uid,
//             name: template.name,
//             image: template.image,
//             selected: template.uid === selectedTemplateUid,
//           })),
//           loading: panelData.data.stepA.loadingTemplates,
//           error: panelData.data.stepA.error,
//         };
//       } catch (error: any) {
//         console.error("Failed to list templates:", error);
//         return `Failed to list templates: ${error.message}`;
//       }
//     },
//   });
// }

// /**
//  * Convenience hook to use all Devbox actions at once
//  */
// export function useDevboxActions() {
//   useStartDevboxAction();
//   useShutdownDevboxAction();
//   useOpenDevboxCreateAction();
//   useUpdateDevboxFormAction();
//   useGetPanelStateAction();
//   useExecutePanelActionAction();
//   useListTemplateRepositoriesAction();
//   useListTemplatesAction();
// }
