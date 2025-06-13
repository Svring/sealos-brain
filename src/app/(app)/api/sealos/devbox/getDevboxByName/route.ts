import { NextRequest, NextResponse } from "next/server";
import {
  makeDevboxApiRequest,
  validateHeaders,
  validateQueryParams,
} from "@/lib/sealos-api";

export async function GET(req: NextRequest) {
  try {
    const regionUrl = req.nextUrl.searchParams.get("regionUrl");
    const devboxName = req.nextUrl.searchParams.get("devboxName");
    const mock = req.nextUrl.searchParams.get("mock");
    const authorization = req.headers.get("Authorization");
    const authorizationBearer = req.headers.get("Authorization-Bearer");

    // Validate query parameters
    const paramValidation = validateQueryParams(
      { regionUrl, devboxName, mock },
      ["regionUrl", "devboxName", "mock"]
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
      "getDevboxByName",
      {
        authorization: authorization!,
        authorizationBearer: authorizationBearer!,
      },
      {
        devboxName: devboxName!,
        mock: mock!,
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
