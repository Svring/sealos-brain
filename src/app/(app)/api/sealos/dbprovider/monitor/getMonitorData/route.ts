import { NextRequest, NextResponse } from "next/server";
import {
  makeDBProviderApiRequest,
  validateHeaders,
  validateQueryParams,
} from "@/lib/sealos-api";

export async function GET(req: NextRequest) {
  try {
    const regionUrl = req.nextUrl.searchParams.get("regionUrl");
    const dbName = req.nextUrl.searchParams.get("dbName");
    const dbType = req.nextUrl.searchParams.get("dbType");
    const queryKey = req.nextUrl.searchParams.get("queryKey");
    const start = req.nextUrl.searchParams.get("start");
    const end = req.nextUrl.searchParams.get("end");
    const step = req.nextUrl.searchParams.get("step");
    const authorization = req.headers.get("Authorization");

    // Validate query parameters
    const paramValidation = validateQueryParams(
      { regionUrl, dbName, dbType, queryKey },
      ["regionUrl", "dbName", "dbType", "queryKey"]
    );
    if (!paramValidation.isValid) {
      return NextResponse.json(
        { message: paramValidation.errorMessage },
        { status: 400 }
      );
    }

    // Validate headers
    const headerValidation = validateHeaders(authorization);
    if (!headerValidation.isValid) {
      return NextResponse.json(
        { message: headerValidation.errorMessage },
        { status: 401 }
      );
    }

    // Build query params
    const queryParams: Record<string, string> = {
      dbName: dbName!,
      dbType: dbType!,
      queryKey: queryKey!,
    };

    if (start) queryParams.start = start;
    if (end) queryParams.end = end;
    if (step) queryParams.step = step;

    // Make API request
    const result = await makeDBProviderApiRequest(
      regionUrl!,
      "monitor/getMonitorData",
      {
        authorization: authorization!,
      },
      queryParams
    );

    if (result.data) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { message: result.message },
        { status: result.status }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
