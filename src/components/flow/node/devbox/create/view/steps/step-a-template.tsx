import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { DevboxFormValues } from "@/components/flow/node/devbox/create/schema/devbox-create-schema";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Template } from "@/lib/sealos/devbox/schemas/template-list-schema";
import { customAlphabet } from "nanoid";
import StepContainer from "../step-container";
import { useQuery } from "@tanstack/react-query";
import { useSealosStore } from "@/store/sealos-store";
import {
  templateRepositoryListOfficialOptions,
  templateRepositoryTemplateListOptions,
} from "@/lib/sealos/devbox/devbox-query";
import { transformTemplateRepositoryList, transformTemplateList } from "@/lib/sealos/devbox/devbox-transform";
import { z } from "zod";

// Define TemplateRepository type locally based on the schema
const TemplateRepositorySchema = z.object({
  kind: z.enum(["LANGUAGE", "FRAMEWORK", "OS", "SERVICE"]),
  iconId: z.string(),
  name: z.string(),
  uid: z.string().uuid(),
  description: z.string(),
  templateRepositoryTags: z.array(z.object({
    tag: z.object({
      uid: z.string().uuid(),
      type: z.enum(["OFFICIAL_CONTENT", "PROGRAMMING_LANGUAGE", "USE_CASE"]),
      name: z.string(),
      zhName: z.string(),
      enName: z.string(),
    }),
  })),
});

type TemplateRepository = z.infer<typeof TemplateRepositorySchema>;

// Create a custom nanoid with lowercase alphabet and size 12
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz", 12);

export default function StepATemplate() {
  const { currentUser, regionUrl } = useSealosStore();
  const { watch, setValue } = useFormContext<DevboxFormValues>();

  // Query for repositories
  const {
    data: repos = [],
    isLoading: loadingRepos,
    error: repoError,
  } = useQuery(
    templateRepositoryListOfficialOptions(
      currentUser,
      regionUrl,
      transformTemplateRepositoryList
    )
  );

  // Query for templates (when a repo is selected)
  const selectedRepoUid = watch("templateRepositoryUid");
  const selectedTemplateUid = watch("templateUid");
  const {
    data: templates = [],
    isLoading: loadingTemplates,
    error: templateError,
  } = useQuery(
    selectedRepoUid
      ? templateRepositoryTemplateListOptions(currentUser, regionUrl, {
          templateRepositoryUid: selectedRepoUid,
        }, transformTemplateList)
      : {
          ...templateRepositoryTemplateListOptions(currentUser, regionUrl, {
            templateRepositoryUid: "",
          }, transformTemplateList),
          enabled: false,
        }
  );

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
        protocol: "HTTP",
        openPublicDomain: true,
        publicDomain: `${nanoid()}.sealosbja.site`,
        customDomain: "",
        id: crypto.randomUUID(),
      }));
    } catch (error) {
      console.error("Failed to parse template config:", error);
      return [];
    }
  };

  if (repoError || templateError) {
    return (
      <div className="text-destructive">
        {repoError
          ? String(repoError)
          : templateError
            ? String(templateError)
            : null}
      </div>
    );
  }

  // Group repositories by kind
  const groupedRepos = repos.reduce(
    (acc: Record<string, TemplateRepository[]>, repo: TemplateRepository) => {
      if (!acc[repo.kind]) {
        acc[repo.kind] = [];
      }
      acc[repo.kind].push(repo);
      return acc;
    },
    {} as Record<string, TemplateRepository[]>
  );

  const kindLabels = {
    LANGUAGE: "Programming Languages",
    FRAMEWORK: "Frameworks",
    OS: "Operating Systems",
    SERVICE: "Services",
  };

  return (
    <StepContainer>
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Choose Your Template
        </h2>
        <p className="text-muted-foreground mt-2">
          Select a repository and a version to get started.
        </p>
      </div>
      {loadingRepos ? (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(110px,1fr))] justify-center">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square w-[110px] flex flex-col items-center justify-center p-4 border rounded-lg bg-muted"
            >
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
                {(repoList as TemplateRepository[]).map(
                  (repo: TemplateRepository) => (
                    <Card
                      key={repo.uid}
                      className={`cursor-pointer w-[88px] aspect-square flex flex-col items-center justify-center p-2 text-center hover:shadow-lg transition-all hover:-translate-y-1 ${
                        selectedRepoUid === repo.uid
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "border hover:border-primary/50"
                      }`}
                      onClick={() => {
                        setValue("templateRepositoryUid", repo.uid, {
                          shouldValidate: true,
                        });
                        setValue("templateUid", "", { shouldValidate: true });
                        setValue("image", "", { shouldValidate: true });
                        setValue("templateConfig", "", {
                          shouldValidate: true,
                        });
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
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedRepoUid && (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold tracking-tight">
              Select a Version
            </h2>
            <p className="text-muted-foreground mt-1">
              Choose a specific version from the selected repository.
            </p>
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
                      setValue("templateUid", template.uid, {
                        shouldValidate: true,
                      });
                      if (template) {
                        setValue("image", template.image || "", {
                          shouldValidate: true,
                        });
                        setValue("templateConfig", template.config || "", {
                          shouldValidate: true,
                        });
                        if (template.config) {
                          const networks = createNetworksFromAppPorts(
                            template.config
                          );
                          setValue("networks", networks, {
                            shouldValidate: true,
                          });
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
