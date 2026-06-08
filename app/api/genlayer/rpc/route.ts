import { NextRequest, NextResponse } from "next/server";

// Server-side proxy to the GenLayer RPC. Avoids browser CORS issues and lets us
// keep the upstream URL server-only if we ever want to.

export const runtime = "nodejs";

const UPSTREAM =
  process.env.GENLAYER_RPC_UPSTREAM ||
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ||
  "https://studio.genlayer.com:8443/api";

async function forward(req: NextRequest, method: "GET" | "POST") {
  try {
    const init: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (method === "POST") {
      const body = await req.text();
      init.body = body;
    }
    const upstream = await fetch(UPSTREAM, init);
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "RPC proxy failed" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  return forward(req, "POST");
}

export async function GET(req: NextRequest) {
  return forward(req, "GET");
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
