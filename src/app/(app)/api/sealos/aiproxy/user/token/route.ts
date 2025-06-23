import { NextRequest, NextResponse } from "next/server";
import {
  makeAIProxyApiRequest,
  validateHeaders,
  validateQueryParams,
} from "@/lib/sealos-api";

// GET - Fetch tokens with pagination
export async function GET(req: NextRequest) {
  try {
    const regionUrl = req.nextUrl.searchParams.get("regionUrl");
    const authorization = req.headers.get("Authorization");
    const page = req.nextUrl.searchParams.get("page") || "1";
    const perPage = req.nextUrl.searchParams.get("perPage") || "10";

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

    // Validate pagination parameters
    const pageNum = parseInt(page, 10);
    const perPageNum = parseInt(perPage, 10);

    if (pageNum < 1) {
      return NextResponse.json(
        { message: "Page number must be greater than 0" },
        { status: 400 }
      );
    }

    if (perPageNum < 1 || perPageNum > 100) {
      return NextResponse.json(
        { message: "Per page must be between 1 and 100" },
        { status: 400 }
      );
    }

    // Make API request
    const result = await makeAIProxyApiRequest(
      regionUrl!,
      "user/token",
      {
        authorization: authorization!,
      },
      {
        page: pageNum.toString(),
        perPage: perPageNum.toString(),
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

// POST - Create new token
export async function POST(req: NextRequest) {
  try {
    const regionUrl = req.nextUrl.searchParams.get("regionUrl");
    const authorization = req.headers.get("Authorization");

    const body = await req.json();

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

    // Validate request body
    if (!body.name) {
      return NextResponse.json(
        { message: "Name parameter is required" },
        { status: 400 }
      );
    }

    // Make API request
    const result = await makeAIProxyApiRequest(
      regionUrl!,
      "user/token",
      {
        authorization: authorization!,
      },
      undefined,
      {
        method: "POST",
        data: body,
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
