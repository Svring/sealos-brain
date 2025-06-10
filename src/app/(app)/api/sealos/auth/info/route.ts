import { NextRequest, NextResponse } from "next/server";
import {
  makeAccountApiRequest,
  validateHeaders,
  validateQueryParams,
} from "@/lib/sealos-api";

export async function GET(req: NextRequest) {
  try {
    const region_url = req.nextUrl.searchParams.get("region_url");
    const authorization = req.headers.get("Authorization");

    // Validate query parameters
    const paramValidation = validateQueryParams({ region_url }, ["region_url"]);
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

    // Make API request
    const result = await makeAccountApiRequest(region_url!, "info", {
      authorization: authorization!,
    });

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
