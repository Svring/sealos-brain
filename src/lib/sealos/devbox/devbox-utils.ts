import axios from "axios";
import { customAlphabet } from "nanoid";
import { DevboxFormValues } from "@/components/flow/node/devbox/create/schema/devbox-create-schema";

// Create a custom nanoid with lowercase alphabet and size 12
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz", 12);
const nanoid8 = customAlphabet("abcdefghijklmnopqrstuvwxyz", 8);

// Helper to get headers from currentUser
function getDevboxHeaders(currentUser: any) {
  return {
    Authorization:
      currentUser?.tokens?.find((t: any) => t.type === "kubeconfig")?.value ||
      "",
    "Authorization-Bearer":
      currentUser?.tokens?.find((t: any) => t.type === "custom")?.value || "",
  };
}

/**
 * Generate DevboxForm from template name
 * This utility function handles the logic of finding templates and generating form data
 */
export async function generateDevboxFormFromTemplate(
  templateName: string,
  currentUser: any,
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
  const reposResponse = await axios.get(
    `/api/sealos/devbox/templateRepository/listOfficial?regionUrl=${regionUrl}`,
    { headers }
  );

  console.log("reposResponse", reposResponse);

  const repos = reposResponse.data?.templateRepositoryList || [];
  if (!repos.length) {
    throw new Error("No template repositories found");
  }

  // Step 2: Find repository by name and get its first template
  let targetTemplate = null;
  let targetRepo = null;

  // First try to find by repository name
  const foundRepo = repos.find(
    (repo: any) => repo.name.toLowerCase() === templateName.toLowerCase()
  );

  if (foundRepo) {
    try {
      const templatesResponse = await axios.get(
        `/api/sealos/devbox/templateRepository/template/list?regionUrl=${regionUrl}&templateRepositoryUid=${foundRepo.uid}`,
        { headers }
      );

      const templates = templatesResponse.data?.templateList || [];
      if (templates.length > 0) {
        targetTemplate = templates[0]; // Use the first template
        targetRepo = foundRepo;
      }
    } catch (error) {
      // Continue to search by template name
    }
  }

  // If not found by repository name, try to find by template name across all repositories
  if (!targetTemplate || !targetRepo) {
    for (const repo of repos) {
      try {
        const templatesResponse = await axios.get(
          `/api/sealos/devbox/templateRepository/template/list?regionUrl=${regionUrl}&templateRepositoryUid=${repo.uid}`,
          { headers }
        );

        const templates = templatesResponse.data?.templateList || [];
        const foundTemplate = templates.find(
          (t: any) => t.name.toLowerCase() === templateName.toLowerCase()
        );

        if (foundTemplate) {
          targetTemplate = foundTemplate;
          targetRepo = repo;
          break;
        }
      } catch (error) {
        continue;
      }
    }
  }

  if (!targetTemplate || !targetRepo) {
    // Collect all available options for error message
    const allRepoNames: string[] = repos.map((r: any) => r.name);
    const allTemplates: string[] = [];

    for (const repo of repos) {
      try {
        const templatesResponse = await axios.get(
          `/api/sealos/devbox/templateRepository/template/list?regionUrl=${regionUrl}&templateRepositoryUid=${repo.uid}`,
          { headers }
        );
        const templates = templatesResponse.data?.templateList || [];
        allTemplates.push(
          ...templates.map((t: any) => `${repo.name}/${t.name}`)
        );
      } catch (error) {
        continue;
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
      const config = JSON.parse(templateConfig);
      const appPorts = config.appPorts || [];
      return appPorts.map((appPort: any) => ({
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
    } catch (error) {
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
