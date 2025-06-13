import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const regionUrl = req.nextUrl.searchParams.get("regionUrl");
    if (!regionUrl) {
      return NextResponse.json(
        { message: "regionUrl is required" },
        { status: 400 }
      );
    }

    const authorization = req.headers.get("Authorization");
    const authorizationBearer = req.headers.get("Authorization-Bearer");

    if (!authorization || !authorizationBearer) {
      return NextResponse.json(
        {
          message:
            "Authorization and Authorization-Bearer headers are required",
        },
        { status: 401 }
      );
    }

    const body = await req.text(); // read raw body as text to forward directly

    const remoteResponse = await fetch(
      `https://devbox.${regionUrl}/api/execCommandInDevboxPod`,
      {
        method: "POST",
        headers: {
          "Content-Type": req.headers.get("Content-Type") || "application/json",
          Authorization: authorization,
          "Authorization-Bearer": authorizationBearer,
        },
        body,
      }
    );

    // Stream the response back to client
    return new Response(remoteResponse.body, {
      status: remoteResponse.status,
      headers: {
        "Content-Type":
          remoteResponse.headers.get("Content-Type") || "text/event-stream",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
