import { z } from "zod";

// ============================================================================
// MONITOR DATA SCHEMAS
// ============================================================================

export const MonitorDataPointSchema = z.object({
	timestamp: z.number(),
	readableTime: z.string(),
	cpu: z.number(),
	memory: z.number(),
	storage: z.number().optional(),
});

export const MonitorDataSeriesSchema = z.object({
	xData: z.array(z.number()),
	yData: z.array(z.number()),
});

export const MonitorDataResultSchema = z.object({
	xData: z.array(z.number()),
	yData: z.array(
		z.object({
			name: z.string(),
			data: z.array(z.number()),
		}),
	),
});

export const MonitorDataSchema = z.object({
	cpu: z
		.object({
			data: z.union([
				z.array(MonitorDataSeriesSchema),
				z.object({ result: MonitorDataResultSchema }),
			]),
		})
		.optional(),
	memory: z
		.object({
			data: z.union([
				z.array(MonitorDataSeriesSchema),
				z.object({ result: MonitorDataResultSchema }),
			]),
		})
		.optional(),
	storage: z
		.object({
			data: z.object({ result: MonitorDataResultSchema }),
		})
		.optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type MonitorDataPoint = z.infer<typeof MonitorDataPointSchema>;
export type MonitorDataSeries = z.infer<typeof MonitorDataSeriesSchema>;
export type MonitorDataResult = z.infer<typeof MonitorDataResultSchema>;
export type MonitorData = z.infer<typeof MonitorDataSchema>;
