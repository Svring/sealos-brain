import { useQuery } from "@tanstack/react-query";
import { customAlphabet } from "nanoid";
import Image from "next/image";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import type { DevboxFormValues } from "@/components/flow/node/devbox/create/schema/devbox-create-schema";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  templateRepositoryListOfficialOptions,
  templateRepositoryTemplateListOptions,
} from "@/lib/sealos/devbox/devbox-query";
import {
  transformTemplateList,
  transformTemplateRepositoryList,
} from "@/lib/sealos/devbox/devbox-transform";
import { Template } from "@/lib/sealos/devbox/schemas/template-list-schema";
import { useSealosStore } from "@/store/sealos-store";
import StepContainer from "../step-container";

// Define TemplateRepository type locally based on the schema
const TemplateRepositorySchema = z.object({
  kind: z.enum(["LANGUAGE", "FRAMEWORK", "OS", "SERVICE"]),
  iconId: z.string(),
  name: z.string(),
  uid: z.string().uuid(),
  description: z.string(),
  templateRepositoryTags: z.array(
    z.object({
      tag: z.object({
        uid: z.string().uuid(),
        type: z.enum(["OFFICIAL_CONTENT", "PROGRAMMING_LANGUAGE", "USE_CASE"]),
        name: z.string(),
        zhName: z.string(),
        enName: z.string(),
      }),
    })
  ),
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
      ? templateRepositoryTemplateListOptions(
          currentUser,
          regionUrl,
          {
            templateRepositoryUid: selectedRepoUid,
          },
          transformTemplateList
        )
      : {
          ...templateRepositoryTemplateListOptions(
            currentUser,
            regionUrl,
            {
              templateRepositoryUid: "",
            },
            transformTemplateList
          ),
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
    } catch {
      return [];
    }
  };

  let errorMsg: string | null = null;
  if (repoError) {
    errorMsg = String(repoError);
  } else if (templateError) {
    errorMsg = String(templateError);
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
        <h2 className="font-bold text-2xl tracking-tight">
          Choose Your Template
        </h2>
        <p className="mt-2 text-muted-foreground">
          Select a repository and a version to get started.
        </p>
      </div>
      {loadingRepos ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] justify-center gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              className="flex aspect-square w-[110px] flex-col items-center justify-center rounded-lg border bg-muted p-4"
              key={`skeleton-${index}`}
            >
              <Skeleton className="mb-2 h-12 w-12 rounded" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedRepos).map(([kind, repoList]) => (
            <div key={kind}>
              <h3 className="mb-4 font-semibold text-foreground text-lg">
                {kindLabels[kind as keyof typeof kindLabels] || kind}
              </h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] justify-center gap-2">
                {(repoList as TemplateRepository[]).map(
                  (repo: TemplateRepository) => (
                    <Card
                      className={`hover:-translate-y-1 flex aspect-square w-[88px] cursor-pointer flex-col items-center justify-center p-2 text-center transition-all hover:shadow-lg ${
                        selectedRepoUid === repo.uid
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "border hover:border-primary/50"
                      }`}
                      key={repo.uid}
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
                          <Image
                            alt={repo.name}
                            className="h-10 w-10"
                            src={`https://devbox.bja.sealos.run/images/${repo.iconId}.svg`}
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
          <div className="mb-8 text-center">
            <h2 className="font-bold text-xl tracking-tight">
              Select a Version
            </h2>
            <p className="mt-1 text-muted-foreground">
              Choose a specific version from the selected repository.
            </p>
          </div>
          {loadingTemplates ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="rounded-lg border bg-muted p-4" key={index}>
                  <Skeleton className="mb-2 h-5 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] justify-center gap-2">
              {Array.isArray(templates) && templates.length > 0 ? (
                templates.map((template) => (
                  <Card
                    className={`cursor-pointer p-2 transition-all hover:shadow-md ${
                      selectedTemplateUid === template.uid
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "border hover:border-primary/50"
                    }`}
                    key={template.uid}
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
                    <div className="mt-1 break-all text-muted-foreground text-sm">
                      {template.image}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-muted-foreground">
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
