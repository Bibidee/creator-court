import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function ms(start: number) {
  return `${Math.round(performance.now() - start)}ms`;
}

export async function POST(req: NextRequest) {
  const t0 = performance.now();
  const jwt = process.env.PINATA_JWT;
  if (!jwt) return NextResponse.json({ error: "PINATA_JWT not configured" }, { status: 500 });

  // Read raw bytes from the request as a Buffer. Avoid req.formData() which is slow
  // in Next 16 + Turbopack for non-trivial multipart bodies.
  const reader = req.body?.getReader();
  if (!reader) return NextResponse.json({ error: "no body" }, { status: 400 });

  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      total += value.byteLength;
      if (total > 25 * 1024 * 1024) {
        try { await reader.cancel(); } catch {}
        return NextResponse.json({ error: "file too large (max 25MB)" }, { status: 400 });
      }
    }
  }
  const raw = Buffer.concat(chunks.map((c) => Buffer.from(c.buffer, c.byteOffset, c.byteLength)));
  console.log(`[pinata] body read ${total}B in ${ms(t0)}`);

  // Parse the multipart manually — fast and dependency-free.
  const contentType = req.headers.get("content-type") || "";
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);
  const boundary = m?.[1] || m?.[2];
  if (!boundary) return NextResponse.json({ error: "missing boundary" }, { status: 400 });

  const part = extractFilePart(raw, boundary);
  if (!part) return NextResponse.json({ error: "no file part found" }, { status: 400 });
  console.log(`[pinata] file extracted ${part.body.length}B name=${part.filename} type=${part.type} in ${ms(t0)}`);

  // Forward to Pinata using a freshly constructed multipart body.
  const out = new FormData();
  out.append(
    "file",
    new Blob([new Uint8Array(part.body)], { type: part.type || "application/octet-stream" }),
    part.filename || "evidence"
  );
  out.append("pinataMetadata", JSON.stringify({ name: part.filename || "creator-court-evidence" }));
  out.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

  try {
    const t1 = performance.now();
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: out,
    });
    const text = await res.text();
    console.log(`[pinata] upstream ${res.status} in ${Math.round(performance.now() - t1)}ms, total ${ms(t0)}`);
    if (!res.ok) {
      return NextResponse.json({ error: `pinata ${res.status}: ${text.slice(0, 300)}` }, { status: 502 });
    }
    const data = JSON.parse(text);
    return NextResponse.json({ cid: data.IpfsHash, size: data.PinSize, timestamp: data.Timestamp });
  } catch (e: any) {
    console.error("[pinata] network err", e);
    return NextResponse.json({ error: `network: ${e?.message || e}` }, { status: 502 });
  }
}

/** Minimal multipart parser — finds the first part with a filename. */
function extractFilePart(buf: Buffer, boundary: string): { body: Buffer; filename: string; type: string } | null {
  const delim = Buffer.from(`--${boundary}`);
  let i = buf.indexOf(delim);
  while (i !== -1) {
    const headerStart = i + delim.length;
    if (buf[headerStart] === 0x2d && buf[headerStart + 1] === 0x2d) return null; // trailing --
    const lineEnd = buf.indexOf(Buffer.from("\r\n\r\n"), headerStart);
    if (lineEnd === -1) return null;
    const headers = buf.slice(headerStart, lineEnd).toString("utf8");
    const bodyStart = lineEnd + 4;
    const next = buf.indexOf(delim, bodyStart);
    if (next === -1) return null;
    const body = buf.slice(bodyStart, next - 2); // strip trailing \r\n
    const filenameM = /filename="([^"]+)"/i.exec(headers);
    if (filenameM) {
      const typeM = /Content-Type:\s*([^\r\n]+)/i.exec(headers);
      return { body, filename: filenameM[1], type: typeM?.[1].trim() || "application/octet-stream" };
    }
    i = next;
  }
  return null;
}
