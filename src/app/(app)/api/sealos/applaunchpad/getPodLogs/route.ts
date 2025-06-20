import { NextRequest, NextResponse } from "next/server";
import {
  makeAppLaunchpadApiRequest,
  validateHeaders,
  validateQueryParams,
} from "@/lib/sealos-api";

export async function GET(req: NextRequest) {
  try {
    const regionUrl = req.nextUrl.searchParams.get("regionUrl");
    const podName = req.nextUrl.searchParams.get("podName");
    const containerName = req.nextUrl.searchParams.get("containerName");
    const stream = req.nextUrl.searchParams.get("stream");
    const previous = req.nextUrl.searchParams.get("previous");
    const authorization = req.headers.get("Authorization");

    // Validate required query parameters
    const paramValidation = validateQueryParams(
      { regionUrl, podName, containerName },
      ["regionUrl", "podName", "containerName"]
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

    // Build query parameters
    const queryParams: Record<string, string> = {
      podName: podName!,
      containerName: containerName!,
    };
    if (stream) queryParams.stream = stream;
    if (previous) queryParams.previous = previous;

    // Make API request
    const result = await makeAppLaunchpadApiRequest(
      regionUrl!,
      "getPodLogs",
      { authorization: authorization! },
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
