interface RequestHeaders {
  authorization: string;
  authorizationBearer?: string;
}

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status: number;
}

// Pure function for making account API requests
export async function makeAccountApiRequest(
  regionUrl: string,
  endpoint: string,
  headers: Pick<RequestHeaders, "authorization">
): Promise<ApiResponse> {
  const backendUrl = `https://${regionUrl}/api/account/${endpoint}`;

  const response = await fetch(backendUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: headers.authorization,
    },
  });

  const data = await response.json();
  return {
    data: response.ok ? data : undefined,
    message: !response.ok ? data.message || data.detail : undefined,
    status: response.status,
  };
}

// Pure function for making auth API requests
export async function makeAuthApiRequest(
  regionUrl: string,
  endpoint: string,
  headers: Pick<RequestHeaders, "authorization">
): Promise<ApiResponse> {
  const backendUrl = `https://${regionUrl}/api/auth/${endpoint}`;

  const response = await fetch(backendUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: headers.authorization,
    },
  });

  const data = await response.json();
  return {
    data: response.ok ? data : undefined,
    message: !response.ok ? data.message || data.detail : undefined,
    status: response.status,
  };
}

// Pure function for making devbox API requests
export async function makeDevboxApiRequest(
  regionUrl: string,
  endpoint: string,
  headers: RequestHeaders,
  queryParams?: Record<string, string>,
  options?: { method?: "GET" | "POST"; data?: any }
): Promise<ApiResponse> {
  const baseUrl = `https://devbox.${regionUrl}/api/${endpoint}`;
  const url = queryParams
    ? `${baseUrl}?${new URLSearchParams(queryParams).toString()}`
    : baseUrl;

  const method = options?.method || "GET";
  const requestInit: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: headers.authorization,
      "Authorization-Bearer": headers.authorizationBearer!,
    },
  };

  if (method === "POST" && options?.data) {
    requestInit.body = JSON.stringify(options.data);
  }

  const response = await fetch(url, requestInit);

  const data = await response.json();
  return {
    data: response.ok ? data : undefined,
    message: !response.ok ? data.message || data.detail : undefined,
    status: response.status,
  };
}

// Pure function for validating required headers
export function validateHeaders(
  authorization: string | null,
  authorizationBearer?: string | null
): { isValid: boolean; errorMessage?: string } {
  if (!authorization) {
    return {
      isValid: false,
      errorMessage: "Authorization header is required",
    };
  }

  if (authorizationBearer !== undefined && !authorizationBearer) {
    return {
      isValid: false,
      errorMessage:
        "Authorization and Authorization-Bearer headers are required",
    };
  }

  return { isValid: true };
}

// Pure function for validating required query parameters
export function validateQueryParams(
  params: Record<string, string | null>,
  requiredParams: string[]
): { isValid: boolean; errorMessage?: string } {
  const missingParams = requiredParams.filter((param) => !params[param]);

  if (missingParams.length > 0) {
    return {
      isValid: false,
      errorMessage: `Missing required parameters: ${missingParams.join(", ")}`,
    };
  }

  return { isValid: true };
}
