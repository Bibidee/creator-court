export function shortAddr(a?: string): string {
  if (!a) return "unknown";
  return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

export function ipfsUrl(cid: string): string {
  if (!cid) return "";
  if (cid.startsWith("http")) return cid;
  const c = cid.replace(/^ipfs:\/\//, "");
  return `https://gateway.pinata.cloud/ipfs/${c}`;
}

export function safeJSON<T>(raw: string | undefined | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function fmtCount(n?: number): string {
  if (!n && n !== 0) return "0";
  return new Intl.NumberFormat().format(n);
}
