import type { ResourceTarget } from "@sealos-brain/k8s/shared/models";
import { formatUnixTimeInLocalTimezone } from "@sealos-brain/shared/date/utils";
import type {
	MonitorData,
	MonitorDataPoint,
} from "../models/resource-monitor.model";

// ============================================================================
// RESOURCE ICON UTILITIES
// ============================================================================

/**
 * Gets the appropriate icon path for a resource based on its target type
 */
export function getResourceIcon(target: ResourceTarget): string {
	const { resourceType } = target;

	switch (resourceType) {
		case "devbox":
		case "cluster":
		case "instance":
			return `/${resourceType}/default.svg`;
		case "deployment":
		case "statefulset":
			return "/launchpad/default.svg";
		default:
			return "/launchpad/default.svg";
	}
}

// ============================================================================
// MONITOR DATA TRANSFORMATION
// ============================================================================

/**
 * Transforms combined monitor data into a more usable format
 * Handles both simple (devbox/launchpad) and complex (cluster) data formats
 */
export function transformMonitorData(
	monitorData: MonitorData,
): MonitorDataPoint[] | Record<string, MonitorDataPoint[]> {
	// Handle simple format (devbox/launchpad)
	const cpuDataArray = monitorData.cpu?.data;
	const memoryDataArray = monitorData.memory?.data;

	const simpleCpuData = Array.isArray(cpuDataArray)
		? cpuDataArray[0]
		: undefined;
	const simpleMemoryData = Array.isArray(memoryDataArray)
		? memoryDataArray[0]
		: undefined;

	if (simpleCpuData?.xData || simpleMemoryData?.xData) {
		const xSeries = simpleCpuData?.xData ?? simpleMemoryData?.xData ?? [];
		return xSeries.map((timestamp: number, index: number) => ({
			timestamp,
			readableTime: formatUnixTimeInLocalTimezone(
				timestamp,
				"yyyy/MM/dd HH:mm",
			),
			cpu: parseFloat(String(simpleCpuData?.yData?.[index] || 0)) || 0,
			memory: parseFloat(String(simpleMemoryData?.yData?.[index] || 0)) || 0,
		}));
	}

	// Handle complex format (cluster)
	return transformClusterMonitorData(monitorData);
}

/**
 * Transforms cluster monitor data with pod-level granularity
 */
function transformClusterMonitorData(
	monitorData: MonitorData,
): Record<string, MonitorDataPoint[]> {
	const cpuData = monitorData.cpu?.data;
	const memoryData = monitorData.memory?.data;
	const storageData = monitorData.storage?.data;

	const cpuResult = cpuData && "result" in cpuData ? cpuData.result : undefined;
	const memoryResult =
		memoryData && "result" in memoryData ? memoryData.result : undefined;
	const diskResult =
		storageData && "result" in storageData ? storageData.result : undefined;

	const validResult = cpuResult || memoryResult || diskResult;
	if (!validResult?.xData) return {};

	const result: Record<string, MonitorDataPoint[]> = {};

	// Process CPU data (primary)
	if (cpuResult?.yData?.length) {
		cpuResult.yData.forEach((podData: { name: string; data: number[] }) => {
			result[podData.name] = createPodDataPoints(
				cpuResult.xData,
				podData.data,
				findPodData(memoryResult?.yData, podData.name),
				findPodData(diskResult?.yData, podData.name, `data-${podData.name}`),
			);
		});
		return result;
	}

	// Process memory data (fallback)
	if (memoryResult?.yData?.length) {
		memoryResult.yData.forEach((podData: { name: string; data: number[] }) => {
			result[podData.name] = createPodDataPoints(
				memoryResult.xData,
				new Array(memoryResult.xData.length).fill(0), // No CPU data
				podData.data,
				findPodData(diskResult?.yData, podData.name, `data-${podData.name}`),
			);
		});
		return result;
	}

	// Process disk data (last resort)
	if (diskResult?.yData?.length) {
		diskResult.yData.forEach((podData: { name: string; data: number[] }) => {
			result[podData.name] = createPodDataPoints(
				diskResult.xData,
				new Array(diskResult.xData.length).fill(0), // No CPU data
				new Array(diskResult.xData.length).fill(0), // No memory data
				podData.data,
			);
		});
	}

	return result;
}

/**
 * Helper function to find pod data by name
 */
function findPodData(
	dataArray: Array<{ name: string; data: number[] }> | undefined,
	name: string,
	altName?: string,
): number[] | undefined {
	return dataArray?.find((item) => item.name === name || item.name === altName)
		?.data;
}

/**
 * Creates data points for a pod with all metrics
 */
function createPodDataPoints(
	timestamps: number[],
	cpuData: number[],
	memoryData: number[] | undefined,
	storageData: number[] | undefined,
): MonitorDataPoint[] {
	return timestamps.map((timestamp, index) => ({
		timestamp,
		readableTime: formatUnixTimeInLocalTimezone(timestamp, "yyyy/MM/dd HH:mm"),
		cpu: cpuData[index] || 0,
		memory: memoryData?.[index] || 0,
		storage: storageData?.[index] || 0,
	}));
}
