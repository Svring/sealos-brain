import { NextRequest, NextResponse } from "next/server";
import {
  makeObjectStorageApiRequest,
  validateHeaders,
  validateQueryParams,
} from "@/lib/sealos-api";

export async function POST(req: NextRequest) {
  try {
    const regionUrl = req.nextUrl.searchParams.get("regionUrl");
    const authorization = req.headers.get("Authorization");
    const appToken = req.headers.get("app-token");

    // Parse request body
    const body = await req.json();
    const { bucketName } = body;

    // Validate query parameters
    const paramValidation = validateQueryParams({ regionUrl }, ["regionUrl"]);
    if (!paramValidation.isValid) {
      return NextResponse.json(
        { message: paramValidation.errorMessage },
        { status: 400 }
      );
    }

    // Validate headers - both authorization (kubeconfig) and app-token are required
    const headerValidation = validateHeaders(authorization, appToken);
    if (!headerValidation.isValid) {
      return NextResponse.json(
        { message: headerValidation.errorMessage },
        { status: 401 }
      );
    }

    // Validate required body parameters
    if (!bucketName) {
      return NextResponse.json(
        { message: "Missing required parameter: bucketName" },
        { status: 400 }
      );
    }

    // Make API request
    const result = await makeObjectStorageApiRequest(
      regionUrl!,
      "bucket/delete",
      {
        authorization: authorization!,
        authorizationBearer: appToken!,
      },
      undefined,
      {
        method: "POST",
        data: {
          bucketName,
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
