import { NextRequest, NextResponse } from "next/server";
import {
  makeDevboxApiRequest,
  validateHeaders,
  validateQueryParams,
} from "@/lib/sealos-api";
import {
  MonitorServiceResult,
  MonitorDataResult,
  MonitorQueryKey,
} from "@/lib/devbox/schemas/monitor-schema";

// Data transformation functions for different monitor types
const AdapterChartData: Record<
  keyof MonitorQueryKey,
  (data: MonitorServiceResult) => MonitorDataResult[]
> = {
  disk: (data: MonitorServiceResult) => {
    const newDataArray = data.data.result.map((item) => {
      let name = item.metric.pod;
      let xData = item.values.map((value) => value[0]);
      let yData = item.values.map((value) =>
        (parseFloat(value[1]) * 100).toFixed(2)
      );
      return {
        name: name,
        xData: xData,
        yData: yData,
      };
    });
    return newDataArray;
  },
  cpu: (data: MonitorServiceResult) => {
    const newDataArray = data.data.result.map((item) => {
      let name = item.metric.pod;
      let xData = item.values.map((value) => value[0]);
      let yData = item.values.map((value) =>
        (parseFloat(value[1]) * 100).toFixed(2)
      );
      return {
        name: name,
        xData: xData,
        yData: yData,
      };
    });
    return newDataArray;
  },
  memory: (data: MonitorServiceResult) => {
    const newDataArray = data.data.result.map((item) => {
      let name = item.metric.pod;
      let xData = item.values.map((value) => value[0]);
      let yData = item.values.map((value) =>
        (parseFloat(value[1]) * 100).toFixed(2)
      );
      return {
        name: name,
        xData: xData,
        yData: yData,
      };
    });
    return newDataArray;
  },
  average_cpu: (data: MonitorServiceResult) => {
    const newDataArray = data.data.result.map((item) => {
      let name = item.metric.pod;
      let xData = item.values.map((value) => value[0]);
      let yData = item.values.map((value) => parseFloat(value[1]).toFixed(2));
      return {
        name: name,
        xData: xData,
        yData: yData,
      };
    });
    return newDataArray;
  },
  average_memory: (data: MonitorServiceResult) => {
    const newDataArray = data.data.result.map((item) => {
      let name = item.metric.pod;
      let xData = item.values.map((value) => value[0]);
      let yData = item.values.map((value) => parseFloat(value[1]).toFixed(2));
      return {
        name: name,
        xData: xData,
        yData: yData,
      };
    });
    return newDataArray;
  },
};

export async function GET(req: NextRequest) {
  try {
    const regionUrl = req.nextUrl.searchParams.get("regionUrl");
    const queryName = req.nextUrl.searchParams.get("queryName");
    const queryKey = req.nextUrl.searchParams.get(
      "queryKey"
    ) as keyof MonitorQueryKey;
    const start = req.nextUrl.searchParams.get("start");
    const end = req.nextUrl.searchParams.get("end");
    const step = req.nextUrl.searchParams.get("step") || "1m";
    const authorization = req.headers.get("Authorization");
    const authorizationBearer = req.headers.get("Authorization-Bearer");

    // Validate required query parameters
    const paramValidation = validateQueryParams(
      { regionUrl, queryName, queryKey },
      ["regionUrl", "queryName", "queryKey"]
    );
    if (!paramValidation.isValid) {
      return NextResponse.json(
        { message: paramValidation.errorMessage },
        { status: 400 }
      );
    }

    // Validate headers
    const headerValidation = validateHeaders(
      authorization,
      authorizationBearer
    );
    if (!headerValidation.isValid) {
      return NextResponse.json(
        { message: headerValidation.errorMessage },
        { status: 401 }
      );
    }

    // Validate queryKey
    const validQueryKeys = [
      "disk",
      "cpu",
      "memory",
      "average_cpu",
      "average_memory",
    ];
    if (!validQueryKeys.includes(queryKey)) {
      return NextResponse.json(
        {
          message: `Invalid queryKey. Must be one of: ${validQueryKeys.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Calculate time range if not provided (default to 1 hour)
    const endTime = end ? parseInt(end) : Date.now();
    const startTime = start ? parseInt(start) : endTime - 60 * 60 * 1000;

    // Build query parameters for the monitor API
    const queryParams = {
      type: queryKey,
      launchPadName: queryName!,
      start: (startTime / 1000).toString(),
      end: (endTime / 1000).toString(),
      step: step,
    };

    // Make API request to the monitor endpoint
    const result = await makeDevboxApiRequest(
      regionUrl!,
      "monitor/query",
      {
        authorization: authorization!,
        authorizationBearer: authorizationBearer!,
      },
      queryParams
    );

    if (result.data) {
      // Transform the data using the appropriate adapter
      const transformedData = AdapterChartData[queryKey]
        ? AdapterChartData[queryKey](result.data as MonitorServiceResult)
        : result.data;

      return NextResponse.json({
        code: 200,
        data: transformedData,
      });
    } else {
      return NextResponse.json(
        { message: result.message },
        { status: result.status }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        code: 500,
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
