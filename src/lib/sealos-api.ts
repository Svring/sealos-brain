import axios, { AxiosResponse, AxiosRequestConfig } from "axios";

interface RequestHeaders {
  authorization: string;
  authorizationBearer?: string;
}

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status: number;
}

// Helper function to handle axios responses consistently
function handleAxiosResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
  return {
    data: response.data,
    status: response.status,
  };
}

// Helper function to handle axios errors consistently
function handleAxiosError(error: any): ApiResponse {
  if (error.response) {
    const { data, status } = error.response;
    return {
      message: data?.message || data?.detail || "Request failed",
      status,
    };
  }
  return {
    message: error.message || "Network error",
    status: 500,
  };
}

// Helper function to create axios config
function createAxiosConfig(
  headers: Partial<RequestHeaders>,
  method: "GET" | "POST" | "DELETE" = "GET",
  data?: any
): AxiosRequestConfig {
  const config: AxiosRequestConfig = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: headers.authorization,
    },
  };

  if (headers.authorizationBearer) {
    config.headers!["Authorization-Bearer"] = headers.authorizationBearer;
  }

  if (data && method !== "GET") {
    config.data = data;
  }

  return config;
}

// Pure function for making account API requests
export async function makeAccountApiRequest(
  regionUrl: string,
  endpoint: string,
  headers: Pick<RequestHeaders, "authorization">
): Promise<ApiResponse> {
  try {
    const url = `https://${regionUrl}/api/account/${endpoint}`;
    const config = createAxiosConfig(headers);

    const response = await axios(url, config);
    return handleAxiosResponse(response);
  } catch (error) {
    return handleAxiosError(error);
  }
}

// Pure function for making auth API requests
export async function makeAuthApiRequest(
  regionUrl: string,
  endpoint: string,
  headers: Pick<RequestHeaders, "authorization">,
  queryParams?: Record<string, string>,
  options?: { method?: "GET" | "POST" | "DELETE"; data?: any }
): Promise<ApiResponse> {
  try {
    const url = `https://${regionUrl}/api/auth/${endpoint}`;
    const config = createAxiosConfig(headers, options?.method, options?.data);

    if (queryParams) {
      config.params = queryParams;
    }

    const response = await axios(url, config);
    return handleAxiosResponse(response);
  } catch (error) {
    return handleAxiosError(error);
  }
}

// Pure function for making devbox API requests
export async function makeDevboxApiRequest(
  regionUrl: string,
  endpoint: string,
  headers: RequestHeaders,
  queryParams?: Record<string, string>,
  options?: { method?: "GET" | "POST" | "DELETE"; data?: any }
): Promise<ApiResponse> {
  try {
    const baseUrl = `https://devbox.${regionUrl}/api/${endpoint}`;
    const config = createAxiosConfig(headers, options?.method, options?.data);

    if (queryParams) {
      config.params = queryParams;
    }

    const response = await axios(baseUrl, config);
    return handleAxiosResponse(response);
  } catch (error) {
    return handleAxiosError(error);
  }
}

// Pure function for making platform API requests
export async function makePlatformApiRequest(
  regionUrl: string,
  endpoint: string,
  headers: Pick<RequestHeaders, "authorization">,
  queryParams?: Record<string, string>,
  options?: { method?: "GET" | "POST" | "DELETE"; data?: any }
): Promise<ApiResponse> {
  try {
    const baseUrl = `https://devbox.${regionUrl}/api/platform/${endpoint}`;
    const config = createAxiosConfig(headers, options?.method, options?.data);

    if (queryParams) {
      config.params = queryParams;
    }

    const response = await axios(baseUrl, config);
    return handleAxiosResponse(response);
  } catch (error) {
    return handleAxiosError(error);
  }
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
