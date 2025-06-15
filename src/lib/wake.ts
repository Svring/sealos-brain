// import { Effect } from "effect";
// import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// // Types for better type safety
// export interface FetchOptions {
//   method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
//   params?: Record<string, any>;
//   data?: any;
//   headers?: Record<string, string>;
//   timeout?: number;
// }

// export interface Context {
//   authorization?: string;
//   apiKey?: string;
//   userAgent?: string;
//   [key: string]: any;
// }

// export interface WakeConfig<T = any, R = any> {
//   urls: string[];
//   transformations: Array<(data: T) => R>;
//   fetchOptions?: FetchOptions;
//   context?: Context;
// }

// // Error types for better error handling
// export class WakeError {
//   readonly _tag = "WakeError";
//   constructor(
//     public readonly message: string,
//     public readonly cause?: unknown,
//     public readonly url?: string
//   ) {}
// }

// export class TransformationError {
//   readonly _tag = "TransformationError";
//   constructor(
//     public readonly message: string,
//     public readonly cause?: unknown,
//     public readonly index?: number
//   ) {}
// }

// // Helper function to merge context into axios config
// const buildAxiosConfig = (
//   url: string,
//   fetchOptions: FetchOptions = {},
//   context: Context = {}
// ): AxiosRequestConfig => {
//   const config: AxiosRequestConfig = {
//     url,
//     method: fetchOptions.method || "GET",
//     params: fetchOptions.params,
//     data: fetchOptions.data,
//     timeout: fetchOptions.timeout || 10000,
//     headers: {
//       "Content-Type": "application/json",
//       ...fetchOptions.headers,
//     },
//   };

//   // Apply context to headers
//   if (context.authorization) {
//     config.headers!["Authorization"] = context.authorization;
//   }
//   if (context.apiKey) {
//     config.headers!["X-API-Key"] = context.apiKey;
//   }
//   if (context.userAgent) {
//     config.headers!["User-Agent"] = context.userAgent;
//   }

//   // Apply any additional context headers
//   Object.entries(context).forEach(([key, value]) => {
//     if (
//       key !== "authorization" &&
//       key !== "apiKey" &&
//       key !== "userAgent" &&
//       typeof value === "string"
//     ) {
//       config.headers![key] = value;
//     }
//   });

//   return config;
// };

// // Single URL fetch effect
// const fetchSingle = (
//   url: string,
//   fetchOptions: FetchOptions = {},
//   context: Context = {}
// ): Effect.Effect<any, WakeError> =>
//   Effect.tryPromise({
//     try: async () => {
//       const config = buildAxiosConfig(url, fetchOptions, context);
//       const response: AxiosResponse = await axios(config);
//       return response.data;
//     },
//     catch: (error) =>
//       new WakeError(
//         `Failed to fetch from ${url}: ${error instanceof Error ? error.message : String(error)}`,
//         error,
//         url
//       ),
//   });

// // Apply transformation with error handling
// const applyTransformation = <T, R>(
//   data: T,
//   transformation: (data: T) => R,
//   index: number
// ): Effect.Effect<R, TransformationError> =>
//   Effect.try({
//     try: () => transformation(data),
//     catch: (error) =>
//       new TransformationError(
//         `Transformation failed at index ${index}: ${error instanceof Error ? error.message : String(error)}`,
//         error,
//         index
//       ),
//   });

// // Main wake function
// export const wake = <T = any, R = any>(
//   config: WakeConfig<T, R>
// ): Effect.Effect<R[], WakeError | TransformationError> => {
//   const { urls, transformations, fetchOptions = {}, context = {} } = config;

//   // Validate inputs
//   if (urls.length === 0) {
//     return Effect.fail(new WakeError("URLs array cannot be empty"));
//   }

//   if (transformations.length === 0) {
//     return Effect.fail(
//       new TransformationError("Transformations array cannot be empty")
//     );
//   }

//   // Fetch all URLs concurrently
//   const fetchEffects = urls.map((url) =>
//     fetchSingle(url, fetchOptions, context)
//   );

//   return Effect.gen(function* (_) {
//     // Fetch all data concurrently
//     const fetchedData = yield* _(
//       Effect.all(fetchEffects, { concurrency: "unbounded" })
//     );

//     // Apply transformations to each fetched data
//     const transformationEffects = fetchedData.map((data, index) => {
//       // Use the corresponding transformation, or the last one if there are fewer transformations than URLs
//       const transformationIndex = Math.min(index, transformations.length - 1);
//       const transformation = transformations[transformationIndex];
//       return applyTransformation(data, transformation, transformationIndex);
//     });

//     // Apply all transformations concurrently
//     const transformedData = yield* _(
//       Effect.all(transformationEffects, { concurrency: "unbounded" })
//     );

//     return transformedData;
//   });
// };

// // Convenience function for single URL with single transformation
// export const wakeSingle = <T = any, R = any>(
//   url: string,
//   transformation: (data: T) => R,
//   fetchOptions: FetchOptions = {},
//   context: Context = {}
// ): Effect.Effect<R, WakeError | TransformationError> =>
//   wake({
//     urls: [url],
//     transformations: [transformation],
//     fetchOptions,
//     context,
//   }).pipe(Effect.map((results) => results[0]));

// // Utility function to run the wake effect with error handling
// export const runWake = async <T = any, R = any>(
//   config: WakeConfig<T, R>
// ): Promise<R[]> => {
//   const program = wake(config).pipe(
//     Effect.catchAll((error) => {
//       console.error("Wake operation failed:", error);
//       return Effect.fail(error);
//     })
//   );

//   return Effect.runPromise(program);
// };
