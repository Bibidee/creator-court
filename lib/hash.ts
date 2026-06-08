export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function contentHashFromMetadata(parts: Record<string, unknown>): Promise<string> {
  const normalised = JSON.stringify(parts, Object.keys(parts).sort());
  return sha256Hex(normalised);
}
