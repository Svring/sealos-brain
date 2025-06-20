import { NextRequest, NextResponse } from "next/server";
import {
  makeAppLaunchpadApiRequest,
  validateHeaders,
  validateQueryParams,
} from "@/lib/sealos-api";

export async function GET(req: NextRequest) {
  try {
    const regionUrl = req.nextUrl.searchParams.get("regionUrl");
    const authorization = req.headers.get("Authorization");

    // Validate query parameters
    const paramValidation = validateQueryParams({ regionUrl }, ["regionUrl"]);
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

    // Extract all query parameters except regionUrl for forwarding
    const queryParams: Record<string, string> = {};
    req.nextUrl.searchParams.forEach((value, key) => {
      if (key !== "regionUrl") {
        queryParams[key] = value;
      }
    });

    // Make API request
    const result = await makeAppLaunchpadApiRequest(
      regionUrl!,
      "kubeFileSystem/download",
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
