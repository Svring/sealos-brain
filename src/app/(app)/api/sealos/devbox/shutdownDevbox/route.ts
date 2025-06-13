import { NextRequest, NextResponse } from "next/server";
import {
  makeDevboxApiRequest,
  validateHeaders,
  validateQueryParams,
} from "@/lib/sealos-api";

type ShutdownModeType = "Stopped" | "Shutdown";

export async function POST(req: NextRequest) {
  try {
    const regionUrl = req.nextUrl.searchParams.get("regionUrl");
    const authorization = req.headers.get("Authorization");
    const authorizationBearer = req.headers.get("Authorization-Bearer");

    // Parse request body
    const body = await req.json();
    const {
      devboxName,
      shutdownMode,
    }: { devboxName: string; shutdownMode: ShutdownModeType } = body;

    // Validate query parameters
    const paramValidation = validateQueryParams({ regionUrl }, ["regionUrl"]);
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

    // Validate devboxName
    if (!devboxName) {
      return NextResponse.json(
        { message: "devboxName is required" },
        { status: 400 }
      );
    }

    // Validate shutdownMode
    if (!shutdownMode || !["Stopped", "Shutdown"].includes(shutdownMode)) {
      return NextResponse.json(
        {
          message:
            "shutdownMode is required and must be either 'Stopped' or 'Shutdown'",
        },
        { status: 400 }
      );
    }

    // Make API request
    const result = await makeDevboxApiRequest(
      regionUrl!,
      "shutdownDevbox",
      {
        authorization: authorization!,
        authorizationBearer: authorizationBearer!,
      },
      undefined,
      {
        method: "POST",
        data: { devboxName, shutdownMode },
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
