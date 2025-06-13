import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { customAlphabet } from 'nanoid';

// Create custom nanoid functions with lowercase alphabet
const nanoid4 = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 4);
const nanoid6 = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);
const nanoid8 = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);
const nanoid10 = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

// -----------------------------------------------------------------------------
// CONFIGURATION
// ---
// STEP 1: Modify these values to match your environment and desired Devbox.
// -----------------------------------------------------------------------------

const SEALOS_CONFIG = {
  // The base URL of your Sealos instance.
  baseUrl: 'http://127.0.0.1:3000/api/sealos/devbox',

  // The top-level domain used for Ingress.
  ingressDomain: 'bja.sealos.run',

  // Absolute path to the kubeconfig file for the target Sealos cluster.
  kubeconfigPath: '/Users/linkling/Downloads/kubeconfig_.yaml',

  // JWT for session authentication.
  // This is passed as the 'Authorization-Bearer' header.
  // While not strictly required by the /api/createDevbox route itself,
  // it is required by many other Sealos APIs and middleware.
  bearerToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyVWlkIjoiZjk1NjZhOWItZTllZi00YWZjLWJjOGQtMDRjNTY5NDEyOWYyIiwib3JnYW5pemF0aW9uVWlkIjoiMTVmYzBjMTktNDczMy00YWI5LTg3YzQtMTAxZjM2NDAxY2E0IiwicmVnaW9uVWlkIjoiMGRiYTNkOTAtMmJhZS00ZmI2LTgzZjctODk2MjA2NTY1NzRmIiwid29ya3NwYWNlSWQiOiJucy1nYXB5bzBpZyIsImlhdCI6MTc0OTM5Mzc1NCwiZXhwIjoxNzQ5OTk4NTU0fQ.5ru2LBQX1VZoQr3PeMM88Nccf2nWGpUnRe3gnlMZCz4' // <--- ADD YOUR TOKEN HERE
};

const DEVBOX_SPEC = {
  // The name for your new Devbox. Must be DNS-1123 compliant.
  name: `my-api-devbox-${nanoid4()}`,

  // The runtime you want to use.
  runtimeName: 'Go', // e.g., 'Go', 'Rust', 'Node.js', 'Ubuntu'

  // The version of the runtime.
  templateName: '1.22',

  // Hardware resources.
  cpu: 2,    // Cores (e.g., 1, 2, 4, 8, 16)
  memory: 4, // GiB (e.g., 2, 4, 8, 16, 32)

  // Define network ports to open.
  ports: [
    {
      port: 8080,
      protocol: 'HTTP',
      enablePublic: true
    }
  ]
};


// -----------------------------------------------------------------------------
// SCRIPT IMPLEMENTATION
// ---
// You don't need to modify anything below this line.
// -----------------------------------------------------------------------------

const api = axios.create({ baseURL: SEALOS_CONFIG.baseUrl });

/**
 * Fetches the list of all available runtime environments (Template Repositories).
 * @returns {Promise<Array>} A list of template repositories.
 */
async function listTemplateRepositories() {
  console.log('Fetching available runtimes...');
  const { data } = await api.get('/api/template/list-official-template-repository');
  if (!data?.templateRepositoryList?.length) {
    throw new Error('No template repositories found.');
  }
  return data.templateRepositoryList;
}

/**
 * Fetches the list of templates (versions) within a specific repository.
 * @param {string} repoUid - The UID of the template repository.
 * @returns {Promise<Array>} A list of templates.
 */
async function listTemplatesInRepo(repoUid) {
  console.log(`Fetching templates for repository UID: ${repoUid}...`);
  const { data } = await api.get(`/api/template/listTemplate?repositoryUid=${repoUid}`);
  if (!data?.templateList?.length) {
    throw new Error(`No templates found in repository ${repoUid}.`);
  }
  return data.templateList;
}

/**
 * Constructs the final devboxForm payload.
 * @param {object} spec - The user-defined DEVBOX_SPEC.
 * @returns {Promise<object>} The fully-formed `devboxForm` object.
 */
async function buildDevboxForm(spec) {
  const repos = await listTemplateRepositories();
  const targetRepo = repos.find(r => r.name === spec.runtimeName);
  if (!targetRepo) {
    const available = repos.map(r => r.name).join(', ');
    throw new Error(`Runtime '${spec.runtimeName}' not found. Available runtimes: ${available}`);
  }
  console.log(`Found runtime '${targetRepo.name}' (UID: ${targetRepo.uid})`);

  const templates = await listTemplatesInRepo(targetRepo.uid);
  const targetTemplate = templates.find(t => t.name === spec.templateName);
  if (!targetTemplate) {
    const available = templates.map(t => t.name).join(', ');
    throw new Error(`Template '${spec.templateName}' not found in '${targetRepo.name}'. Available versions: ${available}`);
  }
  console.log(`Found template '${targetTemplate.name}' (UID: ${targetTemplate.uid})`);

  const cpuMillicores = spec.cpu * 1000;
  const memoryMiB = spec.memory * 1024;

  const devboxForm = {
    name: spec.name.toLowerCase(),
    templateRepositoryUid: targetRepo.uid,
    templateUid: targetTemplate.uid,
    templateConfig: targetTemplate.config,
    image: targetTemplate.image,
    cpu: cpuMillicores,
    memory: memoryMiB,
    networks: spec.ports.map(p => ({
      networkName: `${spec.name}-${nanoid6()}`.toLowerCase(),
      portName: nanoid10(),
      port: p.port,
      protocol: p.protocol,
      openPublicDomain: p.enablePublic,
      publicDomain: p.enablePublic ? `${nanoid8()}.${SEALOS_CONFIG.ingressDomain}` : '',
      customDomain: ''
    }))
  };

  console.log('\nConstructed devboxForm payload:');
  console.log(JSON.stringify(devboxForm, null, 2));
  return devboxForm;
}

/**
 * Sends the request to the createDevbox API endpoint.
 * @param {object} devboxForm - The final payload.
 */
async function createDevbox(devboxForm) {
  console.log('\nReading kubeconfig for authentication...');
  const kubeconfig = await fs.readFile(path.resolve(SEALOS_CONFIG.kubeconfigPath), 'utf-8');
  if (!kubeconfig) {
    throw new Error(`Could not read kubeconfig at: ${SEALOS_CONFIG.kubeconfigPath}`);
  }

  // --- MODIFIED PART: Dynamically build headers ---
  const headers = {
    'Authorization': encodeURIComponent(kubeconfig),
    'Content-Type': 'application/json'
  };

  if (SEALOS_CONFIG.bearerToken && SEALOS_CONFIG.bearerToken !== 'YOUR_JWT_BEARER_TOKEN_HERE') {
    headers['Authorization-Bearer'] = SEALOS_CONFIG.bearerToken;
    console.log('Attaching Authorization-Bearer token to the request.');
  }
  // --- END MODIFIED PART ---


  console.log('Sending request to /api/createDevbox...');
  try {
    const { data, status } = await api.post('/api/createDevbox',
      { devboxForm },
      { headers } // Use the dynamically created headers object
    );

    console.log(`\n✅ Success! API responded with status ${status}.`);
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error(`\n❌ Error! API request failed.`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
}

/**
 * Main execution function.
 */
async function run() {
  try {
    const form = await buildDevboxForm(DEVBOX_SPEC);
    await createDevbox(form);
  } catch (error) {
    console.error('\nScript failed:', error.message);
    process.exit(1);
  }
}

run();
