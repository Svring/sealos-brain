import { useSealosDevbox } from "@/lib/devbox/devbox-query";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { DevboxFormValues } from "@/components/node/devbox/create/schema/devbox-create-schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { Template } from "@/lib/devbox/schemas/template-list-schema";
import { customAlphabet } from "nanoid";
import StepContainer from "../step-container";
import { useControlStore, type TemplateRepository, type PanelAction } from "@/store/control-store";

// Create a custom nanoid with lowercase alphabet and size 12
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 12);

const TemplateRepositorySchema = z.object({
  kind: z.enum(["LANGUAGE", "FRAMEWORK", "OS", "SERVICE"]),
  iconId: z.string(),
  name: z.string(),
  uid: z.string().uuid(),
  description: z.string(),
});

export default function StepATemplate() {
  const { templateRepositoryListOfficial, listTemplates } = useSealosDevbox();
  const { watch, setValue } = useFormContext<DevboxFormValues>();
  const { 
    panelData, 
    updateDevboxCreateStepA, 
    setDevboxCreateStep,
    registerPanelActions,
    clearPanelActions 
  } = useControlStore();

  // Local state for immediate UI updates
  const [repos, setRepos] = useState<TemplateRepository[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRepoUid = watch("templateRepositoryUid");
  const selectedTemplateUid = watch("templateUid");

  // Helper function to create network data from template appPorts
  const createNetworksFromAppPorts = (templateConfig: string) => {
    try {
      const config = JSON.parse(templateConfig);
      const appPorts = config.appPorts || [];
      const currentFormValues = watch();
      const devboxName = currentFormValues.name || "devbox-temp"; // Use temporary name if not set
      
      return appPorts.map((appPort: any) => ({
        networkName: `${devboxName}-${nanoid()}`,
        portName: nanoid(),
        port: appPort.port,
        protocol: "HTTP", // Default to HTTP, can be changed by user
        openPublicDomain: true, // Default to public for app ports
        publicDomain: `${nanoid()}.sealosbja.site`,
        customDomain: "",
        id: crypto.randomUUID(),
      }));
    } catch (error) {
      console.error("Failed to parse template config:", error);
      return [];
    }
  };

  // Register AI actions for this step
  useEffect(() => {
    const actions: Record<string, PanelAction> = {
      selectTemplateRepository: {
        name: "selectTemplateRepository",
        description: "Select a template repository by UID or name",
        parameters: [
          {
            name: "identifier",
            type: "string",
            description: "Repository UID or name to select",
            required: true,
          },
        ],
        handler: async (identifier: string) => {
          const repo = repos.find(r => r.uid === identifier || r.name === identifier);
          if (!repo) {
            throw new Error(`Repository not found: ${identifier}`);
          }
          
          console.log("🤖 AI Action - Repository selected:", repo);
          setValue("templateRepositoryUid", repo.uid, { shouldValidate: true });
          setValue("templateUid", "", { shouldValidate: true });
          setValue("image", "", { shouldValidate: true });
          setValue("templateConfig", "", { shouldValidate: true });
          setValue("networks", [], { shouldValidate: true });
          
          return `Selected repository: ${repo.name} (${repo.kind})`;
        },
      },
      selectTemplate: {
        name: "selectTemplate",
        description: "Select a template by UID or name from the currently selected repository",
        parameters: [
          {
            name: "identifier",
            type: "string",
            description: "Template UID or name to select",
            required: true,
          },
        ],
        handler: async (identifier: string) => {
          const template = templates.find(t => t.uid === identifier || t.name === identifier);
          if (!template) {
            throw new Error(`Template not found: ${identifier}`);
          }
          
          console.log("🤖 AI Action - Template selected:", template);
          setValue("templateUid", template.uid, { shouldValidate: true });
          setValue("image", template.image || "", { shouldValidate: true });
          setValue("templateConfig", template.config || "", { shouldValidate: true });
          
          if (template.config) {
            const networks = createNetworksFromAppPorts(template.config);
            setValue("networks", networks, { shouldValidate: true });
          }
          
          return `Selected template: ${template.name} with image ${template.image}`;
        },
      },
      listAvailableRepositories: {
        name: "listAvailableRepositories",
        description: "Get a list of all available template repositories",
        parameters: [],
        handler: async () => {
          return repos.map(repo => ({
            uid: repo.uid,
            name: repo.name,
            kind: repo.kind,
            description: repo.description,
            selected: repo.uid === selectedRepoUid
          }));
        },
      },
      listAvailableTemplates: {
        name: "listAvailableTemplates",
        description: "Get a list of templates for the currently selected repository",
        parameters: [],
        handler: async () => {
          if (!selectedRepoUid) {
            return { error: "No repository selected" };
          }
          return templates.map(template => ({
            uid: template.uid,
            name: template.name,
            image: template.image,
            selected: template.uid === selectedTemplateUid
          }));
        },
      },
    };

    registerPanelActions(actions);

    // Set current step in control store
    setDevboxCreateStep("template");

    return () => {
      // Don't clear actions on unmount as other steps might be registering actions
    };
  }, [repos, templates, selectedRepoUid, selectedTemplateUid, setValue, registerPanelActions, setDevboxCreateStep]);

  // Sync local state with control store
  useEffect(() => {
    console.log("🔄 Step A - Syncing data to control store:", {
      repositories: repos.length,
      templates: templates.length,
      selectedRepoUid,
      selectedTemplateUid,
      loadingRepos,
      loadingTemplates,
      error,
    });
    
    updateDevboxCreateStepA({
      repositories: repos,
      templates: templates,
      selectedRepoUid,
      selectedTemplateUid,
      loadingRepos,
      loadingTemplates,
      error,
    });
  }, [repos, templates, selectedRepoUid, selectedTemplateUid, loadingRepos, loadingTemplates, error, updateDevboxCreateStepA]);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        setLoadingRepos(true);
        setError(null);
        const data = await templateRepositoryListOfficial({});
        const repoData = data || [];
        setRepos(repoData);
        
        console.log("📋 Step A - Repositories loaded:", repoData.length);
      } catch (err) {
        console.error("Failed to fetch official template repositories", err);
        setError("Failed to load template repositories.");
      } finally {
        setLoadingRepos(false);
      }
    };
    fetchRepos();
  }, [templateRepositoryListOfficial]);

  useEffect(() => {
    if (!selectedRepoUid) {
      setTemplates([]);
      return;
    }

    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);
        setError(null);
        console.log(`🔍 Fetching templates for repository UID: ${selectedRepoUid}`);
        const data = await listTemplates({ templateRepositoryUid: selectedRepoUid });
        console.log("📋 Template list response:", data);
        const templateData = data || [];
        setTemplates(templateData);

        // Auto-select first template if none selected yet
        if (!selectedTemplateUid && Array.isArray(templateData) && templateData.length > 0) {
          const first = templateData[0];
          setValue("templateUid", first.uid, { shouldValidate: true });
          setValue("image", first.image || "", { shouldValidate: true });
          setValue("templateConfig", first.config || "", { shouldValidate: true });
          if (first.config) {
            const networks = createNetworksFromAppPorts(first.config);
            setValue("networks", networks, { shouldValidate: true });
          }
        }
      } catch (err) {
        console.error("Failed to fetch templates for repository", err);
        setError("Failed to load templates.");
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [selectedRepoUid, listTemplates, selectedTemplateUid, setValue]);

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  // Group repositories by kind
  const groupedRepos = repos.reduce((acc, repo) => {
    if (!acc[repo.kind]) {
      acc[repo.kind] = [];
    }
    acc[repo.kind].push(repo);
    return acc;
  }, {} as Record<string, TemplateRepository[]>);

  const kindLabels = {
    LANGUAGE: "Programming Languages",
    FRAMEWORK: "Frameworks",
    OS: "Operating Systems",
    SERVICE: "Services"
  };

  return (
    <StepContainer>
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Choose Your Template</h2>
        <p className="text-muted-foreground mt-2">Select a repository and a version to get started.</p>
      </div>
      
      {loadingRepos ? (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(110px,1fr))] justify-center">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="aspect-square w-[110px] flex flex-col items-center justify-center p-4 border rounded-lg bg-muted">
              <Skeleton className="h-12 w-12 rounded mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedRepos).map(([kind, repoList]) => (
            <div key={kind}>
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                {kindLabels[kind as keyof typeof kindLabels] || kind}
              </h3>
              <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(88px,1fr))] justify-center">
                {repoList.map((repo) => (
                  <Card
                    key={repo.uid}
                    className={`cursor-pointer w-[88px] aspect-square flex flex-col items-center justify-center p-2 text-center hover:shadow-lg transition-all hover:-translate-y-1 ${
                      selectedRepoUid === repo.uid 
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background" 
                        : "border hover:border-primary/50"
                    }`}
                    onClick={() => {
                      console.log("🔍 Step A - Repository selected:", repo);
                      setValue("templateRepositoryUid", repo.uid, {
                        shouldValidate: true,
                      });
                      setValue("templateUid", "", { shouldValidate: true });
                      setValue("image", "", { shouldValidate: true });
                      setValue("templateConfig", "", { shouldValidate: true });
                      setValue("networks", [], { shouldValidate: true });
                    }}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      {repo.iconId && (
                        <img
                          src={`https://devbox.bja.sealos.run/images/${repo.iconId}.svg`}
                          alt={repo.name}
                          className="w-10 h-10"
                        />
                      )}
                      <h3 className="font-medium text-sm leading-tight">
                        {repo.name}
                      </h3>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRepoUid && (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold tracking-tight">Select a Version</h2>
            <p className="text-muted-foreground mt-1">Choose a specific version from the selected repository.</p>
          </div>
          
          {loadingTemplates ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4 border rounded-lg bg-muted">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(88px,1fr))] justify-center">
              {Array.isArray(templates) && templates.length > 0 ? (
                templates.map((template) => (
                  <Card
                    key={template.uid}
                    className={`cursor-pointer p-2 transition-all hover:shadow-md ${
                      selectedTemplateUid === template.uid
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "border hover:border-primary/50"
                    }`}
                    onClick={() => {
                      console.log("🔍 Step A - Template selected:", template);
                      setValue("templateUid", template.uid, { shouldValidate: true });
                      if (template) {
                        setValue("image", template.image || "", { shouldValidate: true });
                        setValue("templateConfig", template.config || "", { shouldValidate: true });
                        
                        if (template.config) {
                          const networks = createNetworksFromAppPorts(template.config);
                          console.log("🔍 Step A - Auto-generated networks from template:", networks);
                          setValue("networks", networks, { shouldValidate: true });
                        }
                      }
                    }}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground mt-1 break-all">
                      {template.image}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground col-span-full">
                  No templates found for this repository.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </StepContainer>
  );
}
