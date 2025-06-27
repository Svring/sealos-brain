import axios from "axios";
import { customAlphabet } from "nanoid";
import type { DevboxFormValues } from "@/components/flow/node/devbox/create/schema/devbox-create-schema";
import type { User } from "@/payload-types";
import { DEVBOX_TEMPLATES } from "./devbox-constant";

// Create a custom nanoid with lowercase alphabet and size 12
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz", 12);
const nanoid8 = customAlphabet("abcdefghijklmnopqrstuvwxyz", 8);

// Regex patterns defined at top level for performance
const DEVBOX_NAME_REGEX = /^[a-z0-9-]+$/;

interface Repository {
  name: string;
  uid: string;
}

interface Template {
  name: string;
  uid: string;
  image: string;
  config?: string;
}

interface TemplateResponse {
  templateRepositoryList?: Repository[];
}

interface TemplateListResponse {
  templateList?: Template[];
}

interface AppPort {
  port: number;
}

interface TemplateConfig {
  appPorts?: AppPort[];
}

// Helper to get headers from currentUser
function getDevboxHeaders(currentUser: User | null) {
  return {
    Authorization:
      currentUser?.tokens?.find((t) => t.type === "kubeconfig")?.value || "",
    "Authorization-Bearer":
      currentUser?.tokens?.find((t) => t.type === "custom")?.value || "",
  };
}

/**
 * Generate DevboxForm from template name
 * This utility function handles the logic of finding templates and generating form data
 */
export async function generateDevboxFormFromTemplate(
  templateName: string,
  currentUser: User | null,
  regionUrl: string,
  options?: {
    devboxName?: string;
    cpu?: number;
    memory?: number;
    enablePublicDomain?: boolean;
  }
): Promise<DevboxFormValues> {
  const headers = getDevboxHeaders(currentUser);

  // Step 1: Fetch official template repositories
  const reposResponse = await axios.get<TemplateResponse>(
    `/api/sealos/devbox/templateRepository/listOfficial?regionUrl=${regionUrl}`,
    { headers }
  );

  const repos = reposResponse.data?.templateRepositoryList || [];
  if (!repos.length) {
    throw new Error("No template repositories found");
  }

  // Step 2: Find repository by name and get its first template
  let targetTemplate: Template | null = null;
  let targetRepo: Repository | null = null;

  // First try to find by repository name
  const foundRepo = repos.find(
    (repo: Repository) => repo.name.toLowerCase() === templateName.toLowerCase()
  );

  if (foundRepo) {
    try {
      const templatesResponse = await axios.get<TemplateListResponse>(
        `/api/sealos/devbox/templateRepository/template/list?regionUrl=${regionUrl}&templateRepositoryUid=${foundRepo.uid}`,
        { headers }
      );

      const templates = templatesResponse.data?.templateList || [];
      if (templates.length > 0) {
        targetTemplate = templates[0]; // Use the first template
        targetRepo = foundRepo;
      }
    } catch {
      // Continue to search by template name
    }
  }

  // If not found by repository name, try to find by template name across all repositories
  if (!(targetTemplate && targetRepo)) {
    const allResults = await Promise.allSettled(
      repos.map(async (repo) => {
        const templatesResponse = await axios.get<TemplateListResponse>(
          `/api/sealos/devbox/templateRepository/template/list?regionUrl=${regionUrl}&templateRepositoryUid=${repo.uid}`,
          { headers }
        );

        const templates = templatesResponse.data?.templateList || [];
        const foundTemplate = templates.find(
          (t: Template) => t.name.toLowerCase() === templateName.toLowerCase()
        );

        return foundTemplate ? { template: foundTemplate, repo } : null;
      })
    );

    for (const result of allResults) {
      if (result.status === "fulfilled" && result.value) {
        targetTemplate = result.value.template;
        targetRepo = result.value.repo;
        break;
      }
    }
  }

  if (!(targetTemplate && targetRepo)) {
    // Collect all available options for error message
    const allRepoNames: string[] = repos.map((r: Repository) => r.name);
    const allTemplates: string[] = [];

    const templateResults = await Promise.allSettled(
      repos.map(async (repo) => {
        const templatesResponse = await axios.get<TemplateListResponse>(
          `/api/sealos/devbox/templateRepository/template/list?regionUrl=${regionUrl}&templateRepositoryUid=${repo.uid}`,
          { headers }
        );
        const templates = templatesResponse.data?.templateList || [];
        return templates.map((t: Template) => `${repo.name}/${t.name}`);
      })
    );

    for (const result of templateResults) {
      if (result.status === "fulfilled") {
        allTemplates.push(...result.value);
      }
    }

    throw new Error(
      `'${templateName}' not found. Available repositories: ${allRepoNames.join(", ")}. Available templates: ${allTemplates.join(", ")}`
    );
  }

  // Step 3: Generate devbox name and networks
  const devboxName = options?.devboxName || `devbox-${nanoid()}`;

  const createNetworksFromAppPorts = (templateConfig: string) => {
    try {
      const config: TemplateConfig = JSON.parse(templateConfig);
      const appPorts = config.appPorts || [];
      return appPorts.map((appPort: AppPort) => ({
        networkName: `${devboxName}-${nanoid()}`,
        portName: nanoid(),
        port: appPort.port,
        protocol: "HTTP" as const,
        openPublicDomain: options?.enablePublicDomain ?? true,
        publicDomain:
          (options?.enablePublicDomain ?? true)
            ? `${nanoid8()}.sealosbja.site`
            : "",
        customDomain: "",
        id: crypto.randomUUID(),
      }));
    } catch {
      return [];
    }
  };

  // Step 4: Build the complete devboxForm
  const devboxForm: DevboxFormValues = {
    name: devboxName,
    templateRepositoryUid: targetRepo.uid,
    templateUid: targetTemplate.uid,
    image: targetTemplate.image,
    templateConfig: targetTemplate.config,
    cpu: options?.cpu || 1000, // Default 1 CPU core in millicores
    memory: options?.memory || 2048, // Default 2GB in MB
    networks: createNetworksFromAppPorts(targetTemplate.config || "{}"),
  };

  return devboxForm;
}

/**
 * Validate that all templates are part of DEVBOX_TEMPLATES
 */
export function validateTemplates(templates: (string | undefined)[]): {
  isValid: boolean;
  invalidTemplates: string[];
} {
  const validTemplates = templates.filter((t): t is string => Boolean(t));
  const invalidTemplates = validTemplates.filter(
    (t) => !DEVBOX_TEMPLATES.includes(t)
  );

  return {
    isValid: invalidTemplates.length === 0,
    invalidTemplates,
  };
}

/**
 * Validate devbox names (basic validation)
 */
export function validateDevboxNames(names: (string | undefined)[]): {
  isValid: boolean;
  invalidNames: string[];
} {
  const validNames = names.filter((n): n is string => Boolean(n));
  const invalidNames = validNames.filter(
    (name) => !name || name.trim().length === 0 || !DEVBOX_NAME_REGEX.test(name)
  );

  return {
    isValid: invalidNames.length === 0,
    invalidNames,
  };
}
