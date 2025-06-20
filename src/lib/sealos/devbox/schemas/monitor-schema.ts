import { z } from "zod";

// Schema for monitor query keys
export const MonitorQueryKeySchema = z.object({
  disk: z.string().optional(),
  cpu: z.string().optional(),
  memory: z.string().optional(),
  average_cpu: z.string().optional(),
  average_memory: z.string().optional(),
});

export type MonitorQueryKey = z.infer<typeof MonitorQueryKeySchema>;

// Schema for individual metric data
export const MetricSchema = z.object({
  pod: z.string(),
  __name__: z.string().optional(),
});

// Schema for metric values (timestamp, value pairs)
export const MetricValueSchema = z.tuple([z.number(), z.string()]);

// Schema for individual result item
export const ResultItemSchema = z.object({
  metric: MetricSchema,
  values: z.array(MetricValueSchema),
});

// Schema for monitor service result
export const MonitorServiceResultSchema = z.object({
  data: z.object({
    result: z.array(ResultItemSchema),
    resultType: z.string(),
  }),
  status: z.string(),
});

export type MonitorServiceResult = z.infer<typeof MonitorServiceResultSchema>;

// Schema for processed monitor data result
export const MonitorDataResultSchema = z.object({
  name: z.string(),
  xData: z.array(z.number()),
  yData: z.array(z.string()),
});

export type MonitorDataResult = z.infer<typeof MonitorDataResultSchema>;

// Schema for monitor request parameters
export const MonitorRequestParamsSchema = z.object({
  queryName: z.string(),
  queryKey: z.enum(["disk", "cpu", "memory", "average_cpu", "average_memory"]),
  start: z.string().optional(),
  end: z.string().optional(),
  step: z.string().default("1m"),
});

export type MonitorRequestParams = z.infer<typeof MonitorRequestParamsSchema>;
