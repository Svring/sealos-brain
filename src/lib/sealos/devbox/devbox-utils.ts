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

/**
 * Fetch official template repositories
 */
async function fetchTemplateRepositories(
  currentUser: User | null,
  regionUrl: string
): Promise<Repository[]> {
  const headers = getDevboxHeaders(currentUser);
  const reposResponse = await axios.get<TemplateResponse>(
    `/api/sealos/devbox/templateRepository/listOfficial?regionUrl=${regionUrl}`,
    { headers }
  );

  const repos = reposResponse.data?.templateRepositoryList || [];
  if (!repos.length) {
    throw new Error("No template repositories found");
  }

  return repos;
}

/**
 * Fetch templates from a specific repository
 */
async function fetchTemplatesFromRepository(
  repo: Repository,
  currentUser: User | null,
  regionUrl: string
): Promise<Template[]> {
  const headers = getDevboxHeaders(currentUser);
  const templatesResponse = await axios.get<TemplateListResponse>(
    `/api/sealos/devbox/templateRepository/template/list?regionUrl=${regionUrl}&templateRepositoryUid=${repo.uid}`,
    { headers }
  );
  return templatesResponse.data?.templateList || [];
}

/**
 * Find template by repository name
 */
async function findTemplateByRepositoryName(
  templateName: string,
  repos: Repository[],
  currentUser: User | null,
  regionUrl: string
): Promise<{ template: Template; repo: Repository } | null> {
  const foundRepo = repos.find(
    (repo: Repository) => repo.name.toLowerCase() === templateName.toLowerCase()
  );

  if (!foundRepo) {
    return null;
  }

  try {
    const templates = await fetchTemplatesFromRepository(
      foundRepo,
      currentUser,
      regionUrl
    );
    if (templates.length > 0) {
      return { template: templates[0], repo: foundRepo };
    }
  } catch {
    // Continue to search by template name
  }

  return null;
}

/**
 * Find template by template name across all repositories
 */
async function findTemplateByTemplateName(
  templateName: string,
  repos: Repository[],
  currentUser: User | null,
  regionUrl: string
): Promise<{ template: Template; repo: Repository } | null> {
  const allResults = await Promise.allSettled(
    repos.map(async (repo) => {
      const templates = await fetchTemplatesFromRepository(
        repo,
        currentUser,
        regionUrl
      );
      const foundTemplate = templates.find(
        (t: Template) => t.name.toLowerCase() === templateName.toLowerCase()
      );
      return foundTemplate ? { template: foundTemplate, repo } : null;
    })
  );

  for (const result of allResults) {
    if (result.status === "fulfilled" && result.value) {
      return result.value;
    }
  }

  return null;
}

/**
 * Collect all available templates for error messages
 */
async function collectAvailableTemplates(
  repos: Repository[],
  currentUser: User | null,
  regionUrl: string
): Promise<{ repoNames: string[]; templateNames: string[] }> {
  const allRepoNames = repos.map((r: Repository) => r.name);
  const allTemplates: string[] = [];

  const templateResults = await Promise.allSettled(
    repos.map(async (repo) => {
      const templates = await fetchTemplatesFromRepository(
        repo,
        currentUser,
        regionUrl
      );
      return templates.map((t: Template) => `${repo.name}/${t.name}`);
    })
  );

  for (const result of templateResults) {
    if (result.status === "fulfilled") {
      allTemplates.push(...result.value);
    }
  }

  return { repoNames: allRepoNames, templateNames: allTemplates };
}

/**
 * Create networks from app ports configuration
 */
function createNetworksFromAppPorts(
  templateConfig: string,
  devboxName: string,
  enablePublicDomain: boolean
) {
  try {
    const config: TemplateConfig = JSON.parse(templateConfig);
    const appPorts = config.appPorts || [];
    return appPorts.map((appPort: AppPort) => ({
      networkName: `${devboxName}-${nanoid()}`,
      portName: nanoid(),
      port: appPort.port,
      protocol: "HTTP" as const,
      openPublicDomain: enablePublicDomain,
      publicDomain: enablePublicDomain ? `${nanoid8()}.sealosbja.site` : "",
      customDomain: "",
      id: crypto.randomUUID(),
    }));
  } catch {
    return [];
  }
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
  // Step 1: Fetch official template repositories
  const repos = await fetchTemplateRepositories(currentUser, regionUrl);

  // Step 2: Find template by repository name first
  let result = await findTemplateByRepositoryName(
    templateName,
    repos,
    currentUser,
    regionUrl
  );

  // Step 3: If not found by repository name, try by template name
  if (!result) {
    result = await findTemplateByTemplateName(
      templateName,
      repos,
      currentUser,
      regionUrl
    );
  }

  // Step 4: If still not found, throw error with available options
  if (!result) {
    const { repoNames, templateNames } = await collectAvailableTemplates(
      repos,
      currentUser,
      regionUrl
    );
    throw new Error(
      `'${templateName}' not found. Available repositories: ${repoNames.join(", ")}. Available templates: ${templateNames.join(", ")}`
    );
  }

  const { template: targetTemplate, repo: targetRepo } = result;

  // Step 5: Generate devbox name and build form
  const devboxName = options?.devboxName || `devbox-${nanoid()}`;
  const enablePublicDomain = options?.enablePublicDomain ?? true;

  const devboxForm: DevboxFormValues = {
    name: devboxName,
    templateRepositoryUid: targetRepo.uid,
    templateUid: targetTemplate.uid,
    image: targetTemplate.image,
    templateConfig: targetTemplate.config,
    cpu: options?.cpu || 1000, // Default 1 CPU core in millicores
    memory: options?.memory || 2048, // Default 2GB in MB
    networks: createNetworksFromAppPorts(
      targetTemplate.config || "{}",
      devboxName,
      enablePublicDomain
    ),
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

// Interfaces for devbox operations
export interface DevboxData {
  devboxForm?: {
    name?: string;
  };
  name?: string;
}

export interface DevboxResult {
  devboxName: string;
  templateName?: string;
}

export interface ShutdownResult {
  devboxName: string;
  action: string;
}

export interface BulkOperationResult<T = unknown> {
  success: boolean;
  item: string;
  result?: T;
  error?: string;
}

// Helper to get headers from currentUser
export function getDevboxHeaders(currentUser: User | null) {
  return {
    Authorization:
      currentUser?.tokens?.find((t) => t.type === "kubeconfig")?.value || "",
    "Authorization-Bearer":
      currentUser?.tokens?.find((t) => t.type === "devbox_token")?.value || "",
  };
}

/**
 * Core function to start a devbox
 */
export async function startDevbox(
  devboxName: string,
  currentUser: User | null,
  regionUrl: string
): Promise<{ devboxName: string }> {
  const headers = getDevboxHeaders(currentUser);
  const response = await axios.post(
    `/api/sealos/devbox/startDevbox?regionUrl=${regionUrl}`,
    { devboxName },
    { headers }
  );
  return { ...response.data, devboxName };
}

/**
 * Core function to shutdown a devbox
 */
export async function shutdownDevbox(
  devboxName: string,
  currentUser: User | null,
  regionUrl: string,
  shutdownMode: "Stopped" | "Shutdown" = "Stopped"
): Promise<{ devboxName: string; shutdownMode: string }> {
  const headers = getDevboxHeaders(currentUser);
  const response = await axios.post(
    `/api/sealos/devbox/shutdownDevbox?regionUrl=${regionUrl}`,
    { devboxName, shutdownMode },
    { headers }
  );
  return { ...response.data, devboxName, shutdownMode };
}

/**
 * Core function to restart a devbox
 */
export async function restartDevbox(
  devboxName: string,
  currentUser: User | null,
  regionUrl: string
): Promise<{ devboxName: string }> {
  const headers = getDevboxHeaders(currentUser);
  const response = await axios.post(
    `/api/sealos/devbox/restartDevbox?regionUrl=${regionUrl}`,
    { devboxName },
    { headers }
  );
  return { ...response.data, devboxName };
}

/**
 * Core function to delete a devbox
 */
export async function deleteDevbox(
  devboxName: string,
  currentUser: User | null,
  regionUrl: string
): Promise<{ devboxName: string }> {
  const headers = getDevboxHeaders(currentUser);
  const response = await axios.delete(
    `/api/sealos/devbox/delDevbox?regionUrl=${regionUrl}&devboxName=${devboxName}`,
    { headers }
  );
  return { ...response.data, devboxName };
}

/**
 * Core function to create a devbox
 */
export async function createDevbox(
  devboxData: DevboxData,
  currentUser: User | null,
  regionUrl: string
): Promise<{ devboxName: string }> {
  const headers = getDevboxHeaders(currentUser);
  const response = await axios.post(
    `/api/sealos/devbox/createDevbox?regionUrl=${regionUrl}`,
    devboxData,
    { headers }
  );
  const devboxName =
    devboxData.devboxForm?.name || devboxData.name || "Unknown";
  return { ...response.data, devboxName };
}

/**
 * Core function to create a devbox from template
 */
export async function createDevboxFromTemplate(
  templateName: string,
  currentUser: User | null,
  regionUrl: string
): Promise<{ devboxName: string; templateName: string }> {
  // First, generate the devboxForm from template name
  const devboxForm = await generateDevboxFormFromTemplate(
    templateName,
    currentUser,
    regionUrl
  );

  // Then, create the devbox using the generated form
  const headers = getDevboxHeaders(currentUser);
  const response = await axios.post(
    `/api/sealos/devbox/createDevbox?regionUrl=${regionUrl}`,
    { devboxForm },
    { headers }
  );

  return { ...response.data, devboxName: devboxForm.name, templateName };
}

// Regex patterns defined at top level for performance
const OPERATION_ED_REGEX = /ed$/;

/**
 * Generic function to process bulk devbox operation results with summary generation
 */
export function processDevboxBulkResults<T>(
  results: BulkOperationResult<T>[],
  operationName: string
): {
  successful: BulkOperationResult<T>[];
  failed: BulkOperationResult[];
  summary: string;
} {
  const successful = results.filter(
    (r): r is BulkOperationResult<T> => r.success
  );
  const failed = results.filter((r) => !r.success);

  let summary = "";
  if (successful.length > 0) {
    summary += `Successfully ${operationName} ${successful.length} devbox(es):\n`;
    for (const r of successful) {
      summary += `- '${r.result || r.item}'\n`;
    }
  }
  if (failed.length > 0) {
    const baseOperation = operationName.replace(OPERATION_ED_REGEX, "");
    summary += `\nFailed to ${baseOperation} ${failed.length} devbox(es):\n`;
    for (const r of failed) {
      summary += `- '${r.item}': ${r.error}\n`;
    }
  }

  return { successful, failed, summary: summary.trim() };
}
