import { NextRequest, NextResponse } from "next/server";
import {
  makeDevboxApiRequest,
  validateHeaders,
  validateQueryParams,
} from "@/lib/sealos-api";

export async function GET(req: NextRequest) {
  try {
    const regionUrl = req.nextUrl.searchParams.get("regionUrl");
    const queryKey = req.nextUrl.searchParams.get("queryKey");
    const queryName = req.nextUrl.searchParams.get("queryName");
    const step = req.nextUrl.searchParams.get("step") || "1m";
    const authorization = req.headers.get("Authorization");
    const authorizationBearer = req.headers.get("Authorization-Bearer");

    // Validate required query parameters
    const paramValidation = validateQueryParams(
      { regionUrl, queryKey, queryName },
      ["regionUrl", "queryKey", "queryName"]
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

    // Make API request
    const result = await makeDevboxApiRequest(
      regionUrl!,
      "monitor/getMonitorData",
      {
        authorization: authorization!,
        authorizationBearer: authorizationBearer!,
      },
      {
        queryKey: queryKey!,
        queryName: queryName!,
        step,
      }
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
