import { NextRequest, NextResponse } from "next/server";
import {
  makeDevboxApiRequest,
  validateHeaders,
  validateQueryParams,
} from "@/lib/sealos-api";

export async function GET(req: NextRequest) {
  try {
    const regionUrl = req.nextUrl.searchParams.get("regionUrl");
    const search = req.nextUrl.searchParams.get("search");
    const page = req.nextUrl.searchParams.get("page");
    const pageSize = req.nextUrl.searchParams.get("pageSize");
    const authorization = req.headers.get("Authorization");
    const authorizationBearer = req.headers.get("Authorization-Bearer");

    const paramValidation = validateQueryParams({ regionUrl }, ["regionUrl"]);
    if (!paramValidation.isValid) {
      return NextResponse.json(
        { message: paramValidation.errorMessage },
        { status: 400 }
      );
    }

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

    const queryParams: Record<string, string> = {};
    if (search) queryParams.search = search;
    if (page) queryParams.page = page;
    if (pageSize) queryParams.pageSize = pageSize;

    const result = await makeDevboxApiRequest(
      regionUrl!,
      "templateRepository/listPrivate",
      {
        authorization: authorization!,
        authorizationBearer: authorizationBearer!,
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
