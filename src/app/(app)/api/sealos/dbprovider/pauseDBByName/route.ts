import { NextRequest, NextResponse } from "next/server";
import {
  makeDBProviderApiRequest,
  validateHeaders,
  validateQueryParams,
} from "@/lib/sealos-api";

export async function POST(req: NextRequest) {
  try {
    const regionUrl = req.nextUrl.searchParams.get("regionUrl");
    const authorization = req.headers.get("Authorization");

    // Parse request body to get dbName and dbType
    const body = await req.json();
    const { dbName, dbType } = body;

    // Validate query parameters (only regionUrl now)
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

    // Validate required body parameters
    if (!dbName || !dbType) {
      return NextResponse.json(
        { message: "Missing required parameters: dbName and dbType" },
        { status: 400 }
      );
    }

    // Make API request
    const result = await makeDBProviderApiRequest(
      regionUrl!,
      "pauseDBByName",
      {
        authorization: authorization!,
      },
      undefined,
      {
        method: "POST",
        data: {
          dbName: dbName,
          dbType: dbType,
        },
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
